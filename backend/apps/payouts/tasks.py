from celery import shared_task
from django.utils import timezone
from apps.investments.models import Investment
from apps.payouts.models import Payout
from apps.notifications.models import Notification

@shared_task
def check_overdue_payouts_and_maturing_investments():
    today = timezone.now().date()
    
    # Maturing Investments
    maturing_investments = Investment.objects.filter(status='active', maturity_date__lte=today)
    for inv in maturing_investments:
        inv.status = 'matured'
        inv.save()
        
        Notification.objects.create(
            user=inv.customer,
            title="Investment Matured!",
            body=f"Your investment of ₹{inv.amount} in plan '{inv.plan.name}' has matured. Final payout is processing.",
            type="investment_matured",
            sent_via="push"
        )
        print(f"MATURED: Investment {inv.id} for user {inv.customer.mobile_number}")

    # Overdue Payouts
    overdue_payouts = Payout.objects.filter(status='pending', due_date__lt=today)
    for payout in overdue_payouts:
        payout.status = 'overdue'
        payout.save()
        
        Notification.objects.create(
            user=payout.investment.customer,
            title="Payout Overdue",
            body=f"Your payout yield of ₹{payout.amount} is currently processing.",
            type="payout_overdue",
            sent_via="push"
        )
        print(f"OVERDUE: Payout {payout.id} due on {payout.due_date}")
