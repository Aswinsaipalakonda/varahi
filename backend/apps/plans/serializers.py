from rest_framework import serializers
from .models import InvestmentPlan

class InvestmentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
