from rest_framework import serializers
from .models import ReferralBonus

class ReferralBonusSerializer(serializers.ModelSerializer):
    referred_user_name = serializers.CharField(source='referred_user.full_name', read_only=True)
    referred_user_mobile = serializers.CharField(source='referred_user.mobile_number', read_only=True)

    class Meta:
        model = ReferralBonus
        fields = '__all__'
