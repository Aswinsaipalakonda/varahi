from rest_framework import serializers
from .models import KycDocument

class KycDocumentSerializer(serializers.ModelSerializer):
    user_mobile = serializers.CharField(source='user.mobile_number', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_kyc_status = serializers.CharField(source='user.kyc_status', read_only=True)

    class Meta:
        model = KycDocument
        fields = '__all__'
        read_only_fields = ['id', 'user', 'reviewed_by', 'reviewed_at', 'submitted_at']
