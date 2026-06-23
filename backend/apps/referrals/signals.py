from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.db.models import F
from apps.investments.models import Investment
from .models import ReferralBonus

@receiver(post_save, sender=Investment)
def credit_referral_bonus(sender, instance, **kwargs):
    if instance.status != 'active':
        return
        
    if ReferralBonus.objects.filter(investment=instance).exists():
        return

    customer = instance.customer
    referrer = customer.referred_by
    if not referrer:
        return

    # Check if this is the first active investment of the referred user
    active_investments_count = Investment.objects.filter(customer=customer, status='active').count()
    if active_investments_count > 1:
        return

    # 5% referral reward
    bonus_amount = instance.amount * 5 / 100

    ReferralBonus.objects.create(
        referrer=referrer,
        referred_user=customer,
        investment=instance,
        bonus_amount=bonus_amount,
        status='credited',
        credited_at=timezone.now()
    )

    referrer.wallet_balance = F('wallet_balance') + bonus_amount
    referrer.save()
