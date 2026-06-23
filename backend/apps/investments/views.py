from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from django.db import transaction
import uuid
import random
import string
from dateutil.relativedelta import relativedelta

from .models import Investment
from .serializers import (
    InvestmentSerializer,
    InitiateInvestmentSerializer,
    SubmitInvestmentSerializer
)
from .services.payout_calculator import generate_payout_schedule

class IsOwnerOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'supervisor']

class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Investment.objects.none()
        if user.role == 'customer':
            return Investment.objects.filter(customer=user).order_by('-created_at')
        return Investment.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def initiate(self, request):
        serializer = InitiateInvestmentSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.validated_data['plan']
            amount = serializer.validated_data['amount']
            
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            txn_ref = f"TXN-{random_str}"
            
            investment = Investment.objects.create(
                customer=request.user,
                plan=plan,
                amount=amount,
                upi_txn_ref=txn_ref,
                status='pending'
            )
            
            owner_upi_id = getattr(settings, 'OWNER_UPI_ID', 'owner@ybl')
            owner_payee_name = getattr(settings, 'OWNER_PAYEE_NAME', 'Varahi Capital')
            
            return Response({
                'id': investment.id,
                'txn_ref': txn_ref,
                'upi_id': owner_upi_id,
                'payee_name': owner_payee_name,
                'amount': float(amount)
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request):
        txn_ref = request.data.get('txn_ref') or request.data.get('upi_txn_ref')
        if not txn_ref:
            return Response({'error': 'txn_ref is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            investment = Investment.objects.get(upi_txn_ref=txn_ref, customer=request.user)
        except Investment.DoesNotExist:
            return Response({'error': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = SubmitInvestmentSerializer(investment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Payment proof submitted successfully. Pending verification.',
                'investment': InvestmentSerializer(investment).data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrSupervisor])
    def approve(self, request, pk=None):
        investment = self.get_object()
        if investment.status != 'pending':
            return Response({'error': 'Investment is not pending verification.'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            investment.status = 'active'
            investment.start_date = timezone.now().date()
            investment.maturity_date = investment.start_date + relativedelta(months=investment.plan.tenure_months)
            investment.approved_by = request.user
            investment.approved_at = timezone.now()
            investment.save()
            
            generate_payout_schedule(investment)
            
        return Response({
            'message': 'Investment approved successfully and payout schedule generated.',
            'investment': InvestmentSerializer(investment).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrSupervisor])
    def reject(self, request, pk=None):
        investment = self.get_object()
        if investment.status != 'pending':
            return Response({'error': 'Investment is not pending verification.'}, status=status.HTTP_400_BAD_REQUEST)
            
        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason:
            return Response({'error': 'rejection_reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        investment.status = 'rejected'
        investment.rejection_reason = rejection_reason
        investment.approved_by = request.user
        investment.approved_at = timezone.now()
        investment.save()
        
        return Response({
            'message': 'Investment rejected successfully.',
            'investment': InvestmentSerializer(investment).data
        }, status=status.HTTP_200_OK)
