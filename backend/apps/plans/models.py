from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class InvestmentPlan(models.Model):
    PAYOUT_FREQUENCIES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('on_maturity', 'On Maturity'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    min_amount = models.DecimalField(max_digits=15, decimal_places=2)
    max_amount = models.DecimalField(max_digits=15, decimal_places=2)
    return_rate_percent = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_months = models.IntegerField()
    payout_frequency = models.CharField(max_length=20, choices=PAYOUT_FREQUENCIES, default='monthly')
    premature_penalty_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    terms_text = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
