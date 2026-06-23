from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Payout
from .serializers import PayoutSerializer
from apps.investments.models import Investment

class IsOwnerOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'supervisor']

class PayoutViewSet(viewsets.ModelViewSet):
    queryset = Payout.objects.all()
    serializer_class = PayoutSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Payout.objects.none()
        
        queryset = Payout.objects.all().order_by('due_date')
        if user.role == 'customer':
            queryset = queryset.filter(investment__customer=user)
            
        payout_status = self.request.query_params.get('status')
        if payout_status:
            queryset = queryset.filter(status=payout_status)
            
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrSupervisor])
    def mark_paid(self, request, pk=None):
        payout = self.get_object()
        if payout.status == 'paid':
            return Response({'error': 'Payout is already marked as paid.'}, status=status.HTTP_400_BAD_REQUEST)
            
        payout.status = 'paid'
        payout.paid_at = timezone.now()
        payout.processed_by = request.user
        payout.remarks = request.data.get('remarks', payout.remarks)
        payout.save()
        
        return Response({
            'message': 'Payout marked as paid successfully.',
            'payout': PayoutSerializer(payout).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsOwnerOrSupervisor])
    def bulk_mark_paid(self, request):
        payout_ids = request.data.get('payout_ids', [])
        if not payout_ids:
            return Response({'error': 'payout_ids array is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            payouts = Payout.objects.filter(id__in=payout_ids, status__in=['pending', 'overdue'])
            updated_count = payouts.update(
                status='paid',
                paid_at=timezone.now(),
                processed_by=request.user,
                remarks=request.data.get('remarks', 'Bulk marked as paid')
            )
            
        return Response({'message': f'Successfully marked {updated_count} payouts as paid.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def withdrawal_request(self, request):
        investment_id = request.data.get('investment_id')
        if not investment_id:
            return Response({'error': 'investment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            investment = Investment.objects.get(id=investment_id, customer=request.user)
        except Investment.DoesNotExist:
            return Response({'error': 'Investment not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if investment.status != 'active':
            return Response({'error': 'Only active investments can be withdrawn.'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            investment.status = 'withdrawn'
            investment.save()
            
            pending_payouts = Payout.objects.filter(investment=investment, status='pending')
            pending_payouts.update(status='skipped', remarks="Skipped due to early withdrawal")
            
            penalty_rate = investment.plan.premature_penalty_percent / 100
            penalty_amount = investment.amount * penalty_rate
            net_payout_amount = investment.amount - penalty_amount
            
            final_payout = Payout.objects.create(
                investment=investment,
                due_date=timezone.now().date(),
                amount=net_payout_amount,
                status='pending',
                remarks=f"Early Withdrawal Principal Refund (Penalty applied: ₹{penalty_amount})"
            )
            
        return Response({
            'message': 'Withdrawal request submitted successfully. Final payout generated.',
            'payout': PayoutSerializer(final_payout).data
        }, status=status.HTTP_200_OK)
