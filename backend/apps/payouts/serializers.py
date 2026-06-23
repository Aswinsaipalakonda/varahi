from rest_framework import serializers
from .models import Payout

class PayoutSerializer(serializers.ModelSerializer):
    customer_mobile = serializers.CharField(source='investment.customer.mobile_number', read_only=True)
    customer_name = serializers.CharField(source='investment.customer.full_name', read_only=True)
    plan_name = serializers.CharField(source='investment.plan.name', read_only=True)

    class Meta:
        model = Payout
        fields = '__all__'
        read_only_fields = ['id', 'investment', 'due_date', 'amount', 'paid_at', 'processed_by', 'created_at']
