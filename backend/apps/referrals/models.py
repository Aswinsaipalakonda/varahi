from django.db import models
from django.contrib.auth import get_user_model
from apps.investments.models import Investment
import uuid

User = get_user_model()

class ReferralBonus(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('credited', 'Credited'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_referral_bonuses')
    referred_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_referral_bonuses')
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='referral_bonuses')
    bonus_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    credited_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Referral Bonus of ₹{self.bonus_amount} for {self.referrer.mobile_number}"
