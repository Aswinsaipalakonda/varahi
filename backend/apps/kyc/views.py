from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
import random
import string

from .models import KycDocument
from .serializers import KycDocumentSerializer

User = get_user_model()

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'

class IsOwnerOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'supervisor']

class KycViewSet(viewsets.ModelViewSet):
    queryset = KycDocument.objects.all()
    serializer_class = KycDocumentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return KycDocument.objects.none()
        if user.role == 'customer':
            return KycDocument.objects.filter(user=user)
        return KycDocument.objects.all().order_by('-submitted_at')

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request):
        user = request.user
        if user.kyc_status == 'approved':
            return Response({'error': 'KYC is already approved.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            kyc_doc = KycDocument.objects.get(user=user)
            serializer = KycDocumentSerializer(kyc_doc, data=request.data, partial=True)
        except KycDocument.DoesNotExist:
            serializer = KycDocumentSerializer(data=request.data)
            
        if serializer.is_valid():
            with transaction.atomic():
                kyc_doc = serializer.save(user=user)
                user.kyc_status = 'under_review'
                user.save()
            return Response({
                'message': 'KYC documents submitted successfully. Under review.',
                'kyc': KycDocumentSerializer(kyc_doc).data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def status(self, request):
        return Response({
            'kyc_status': request.user.kyc_status,
            'has_submitted': KycDocument.objects.filter(user=request.user).exists()
        })

    @action(detail=True, methods=['post'], permission_classes=[IsOwner])
    def approve(self, request, pk=None):
        kyc_doc = self.get_object()
        user = kyc_doc.user
        
        if user.kyc_status == 'approved':
            return Response({'error': 'KYC is already approved.'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            kyc_doc.reviewed_by = request.user
            kyc_doc.reviewed_at = timezone.now()
            kyc_doc.review_remarks = request.data.get('review_remarks', 'Approved by owner')
            kyc_doc.save()
            
            user.kyc_status = 'approved'
            if not user.referral_code:
                while True:
                    code = 'INV-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                    if not User.objects.filter(referral_code=code).exists():
                        user.referral_code = code
                        break
            user.save()
            
        return Response({
            'message': 'KYC approved and referral code generated successfully.',
            'referral_code': user.referral_code
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrSupervisor])
    def reject(self, request, pk=None):
        kyc_doc = self.get_object()
        user = kyc_doc.user
        
        if user.kyc_status == 'approved':
            return Response({'error': 'Cannot reject already approved KYC.'}, status=status.HTTP_400_BAD_REQUEST)
            
        review_remarks = request.data.get('review_remarks')
        if not review_remarks:
            return Response({'error': 'review_remarks (rejection reason) is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            kyc_doc.reviewed_by = request.user
            kyc_doc.reviewed_at = timezone.now()
            kyc_doc.review_remarks = review_remarks
            kyc_doc.save()
            
            user.kyc_status = 'rejected'
            user.save()
            
        return Response({'message': 'KYC rejected successfully.'}, status=status.HTTP_200_OK)
