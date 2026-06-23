from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import ReferralBonus
from .serializers import ReferralBonusSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ReferralViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_code(self, request):
        return Response({
            'referral_code': request.user.referral_code,
            'mobile_number': request.user.mobile_number
        })

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        user = request.user
        bonuses = ReferralBonus.objects.filter(referrer=user).order_by('-created_at')
        
        total_referred = User.objects.filter(referred_by=user).count()
        total_earned = bonuses.filter(status='credited').aggregate(Sum('bonus_amount'))['bonus_amount__sum'] or 0.00
        pending_bonus = bonuses.filter(status='pending').aggregate(Sum('bonus_amount'))['bonus_amount__sum'] or 0.00
        
        serializer = ReferralBonusSerializer(bonuses, many=True)
        
        return Response({
            'total_referred': total_referred,
            'total_earned': float(total_earned),
            'pending_bonus': float(pending_bonus),
            'bonuses': serializer.data
        })

    @action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        if request.user.role != 'owner':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            target_user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        referees = User.objects.filter(referred_by=target_user)
        referee_data = []
        for ref in referees:
            referee_data.append({
                'id': ref.id,
                'full_name': ref.full_name,
                'mobile_number': ref.mobile_number,
                'kyc_status': ref.kyc_status,
                'wallet_balance': float(ref.wallet_balance)
            })
        return Response({'user': target_user.full_name, 'referrals': referee_data})
