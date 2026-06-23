from rest_framework import serializers
from .models import Investment
from apps.plans.models import InvestmentPlan

class InvestmentPlanMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPlan
        fields = ['id', 'name', 'return_rate_percent', 'tenure_months', 'payout_frequency']

class InvestmentSerializer(serializers.ModelSerializer):
    plan_details = InvestmentPlanMinSerializer(source='plan', read_only=True)
    customer_mobile = serializers.CharField(source='customer.mobile_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)

    class Meta:
        model = Investment
        fields = '__all__'
        read_only_fields = ['id', 'customer', 'status', 'start_date', 'maturity_date', 'approved_by', 'approved_at', 'created_at']

class InitiateInvestmentSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)

    def validate(self, data):
        try:
            plan = InvestmentPlan.objects.get(id=data['plan_id'], is_active=True)
        except InvestmentPlan.DoesNotExist:
            raise serializers.ValidationError({'plan_id': 'Plan does not exist or is inactive.'})
        
        amount = data['amount']
        if amount < plan.min_amount:
            raise serializers.ValidationError({'amount': f'Amount must be at least ₹{plan.min_amount}.'})
        if amount > plan.max_amount:
            raise serializers.ValidationError({'amount': f'Amount cannot exceed ₹{plan.max_amount}.'})
        
        data['plan'] = plan
        return data

class SubmitInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['upi_txn_ref', 'screenshot']
