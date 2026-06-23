from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SendOtpSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)

class VerifyOtpSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)

class SetPinSerializer(serializers.Serializer):
    pin = serializers.CharField(min_length=4, max_length=4)

class VerifyPinSerializer(serializers.Serializer):
    pin = serializers.CharField(min_length=4, max_length=4)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'mobile_number', 'full_name', 'role', 'kyc_status', 'wallet_balance', 'referral_code', 'biometric_enabled']
        read_only_fields = ['id', 'role', 'kyc_status', 'wallet_balance', 'referral_code']
