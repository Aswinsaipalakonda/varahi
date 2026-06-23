from datetime import date
from dateutil.relativedelta import relativedelta
from apps.payouts.models import Payout

def generate_payout_schedule(investment):
    plan = investment.plan
    amount = investment.amount
    start_date = investment.start_date
    frequency = plan.payout_frequency
    tenure_months = plan.tenure_months
    rate = plan.return_rate_percent / 100

    # Clean existing payouts if any to remain idempotent
    Payout.objects.filter(investment=investment).delete()

    payouts_to_create = []

    if frequency == 'monthly':
        monthly_interest = (amount * rate) / 12
        for i in range(1, tenure_months + 1):
            due_date = start_date + relativedelta(months=i)
            payouts_to_create.append(
                Payout(
                    investment=investment,
                    due_date=due_date,
                    amount=monthly_interest,
                    status='pending'
                )
            )
        # Principal payout at maturity
        payouts_to_create.append(
            Payout(
                investment=investment,
                due_date=investment.maturity_date,
                amount=amount,
                status='pending',
                remarks="Principal Refund"
            )
        )

    elif frequency == 'quarterly':
        quarterly_interest = (amount * rate) / 4
        quarters = tenure_months // 3
        for i in range(1, quarters + 1):
            due_date = start_date + relativedelta(months=i*3)
            payouts_to_create.append(
                Payout(
                    investment=investment,
                    due_date=due_date,
                    amount=quarterly_interest,
                    status='pending'
                )
            )
        # Principal payout at maturity
        payouts_to_create.append(
            Payout(
                investment=investment,
                due_date=investment.maturity_date,
                amount=amount,
                status='pending',
                remarks="Principal Refund"
            )
        )

    elif frequency == 'on_maturity':
        total_interest = amount * rate * (tenure_months / 12)
        total_payout = amount + total_interest
        payouts_to_create.append(
            Payout(
                investment=investment,
                due_date=investment.maturity_date,
                amount=total_payout,
                status='pending',
                remarks="Principal + Returns"
            )
        )

    Payout.objects.bulk_create(payouts_to_create)
