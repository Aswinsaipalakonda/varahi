from django.db import models
from django.contrib.auth import get_user_model
from apps.plans.models import InvestmentPlan
import uuid

User = get_user_model()

class Investment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
        ('matured', 'Matured'),
        ('withdrawn', 'Withdrawn'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    plan = models.ForeignKey(InvestmentPlan, on_delete=models.PROTECT, related_name='investments')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    start_date = models.DateField(blank=True, null=True)
    maturity_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    upi_txn_ref = models.CharField(max_length=100)
    screenshot = models.FileField(upload_to='screenshots/', blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_investments')
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.mobile_number} - {self.plan.name} - ₹{self.amount}"
