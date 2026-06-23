from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum, Count
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from datetime import timedelta
import random

from apps.investments.models import Investment
from apps.payouts.models import Payout

User = get_user_model()

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'

class AdminAnalyticsView(APIView):
    permission_classes = [IsOwner]

    def get(self, request):
        today = timezone.now().date()
        first_of_month = today.replace(day=1)
        
        # AUM (Total active investments)
        total_aum = Investment.objects.filter(status='active').aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        # Active investors count
        active_investors = User.objects.filter(role='customer', investments__status='active').distinct().count()
        
        # Payouts due this month
        payouts_due_month = Payout.objects.filter(status__in=['pending', 'overdue'], due_date__gte=first_of_month).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        # Pending verification count
        pending_verifications = Investment.objects.filter(status='pending').count()
        
        # Growth Chart (last 30 days)
        chart_data = []
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            day_aum = Investment.objects.filter(status='active', start_date__lte=day).aggregate(Sum('amount'))['amount__sum'] or 0.00
            chart_data.append({
                'date': day.strftime('%Y-%m-%d'),
                'amount': float(day_aum)
            })

        # Recent activities
        recent_investments = Investment.objects.all().order_by('-created_at')[:5]
        activities = []
        for inv in recent_investments:
            activities.append({
                'type': 'investment',
                'description': f"{inv.customer.full_name or inv.customer.mobile_number} initiated investment of ₹{inv.amount} in {inv.plan.name}",
                'status': inv.status,
                'created_at': inv.created_at.strftime('%Y-%m-%d %H:%M')
            })

        return Response({
            'total_aum': float(total_aum),
            'active_investors': active_investors,
            'payouts_due_month': float(payouts_due_month),
            'pending_verifications': pending_verifications,
            'chart_data': chart_data,
            'activities': activities
        })

class WalletAdjustView(APIView):
    permission_classes = [IsOwner]

    def post(self, request):
        customer_id = request.data.get('customer_id')
        amount = request.data.get('amount')
        action_type = request.data.get('action_type') # 'credit' or 'debit'
        
        if not customer_id or not amount or not action_type:
            return Response({'error': 'customer_id, amount, and action_type are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            customer = User.objects.get(id=customer_id, role='customer')
        except User.DoesNotExist:
            return Response({'error': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            amount_val = float(amount)
        except ValueError:
            return Response({'error': 'Invalid amount value.'}, status=status.HTTP_400_BAD_REQUEST)
            
        decimal_val = type(customer.wallet_balance)(amount_val)
        if action_type == 'credit':
            customer.wallet_balance += decimal_val
        elif action_type == 'debit':
            customer.wallet_balance -= decimal_val
        else:
            return Response({'error': 'Invalid action_type.'}, status=status.HTTP_400_BAD_REQUEST)
            
        customer.save()
        return Response({
            'message': f'Wallet successfully {action_type}ed by ₹{amount_val}.',
            'wallet_balance': float(customer.wallet_balance)
        })

class SupervisorManagementView(APIView):
    permission_classes = [IsOwner]

    def get(self, request):
        supervisors = User.objects.filter(role='supervisor').order_by('-date_joined')
        data = []
        for sup in supervisors:
            data.append({
                'id': sup.id,
                'full_name': sup.full_name,
                'mobile_number': sup.mobile_number,
                'email': sup.email,
                'is_active': sup.is_active,
                'last_login': sup.last_login.strftime('%Y-%m-%d %H:%M') if sup.last_login else 'Never'
            })
        return Response(data)

    def post(self, request):
        mobile_number = request.data.get('mobile_number')
        full_name = request.data.get('full_name')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not mobile_number or not full_name or not password:
            return Response({'error': 'mobile_number, full_name, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(mobile_number=mobile_number).exists():
            return Response({'error': 'Mobile number already registered.'}, status=status.HTTP_400_BAD_REQUEST)
            
        supervisor = User.objects.create(
            mobile_number=mobile_number,
            full_name=full_name,
            email=email,
            password=make_password(password),
            role='supervisor',
            kyc_status='approved' # Auto approve supervisors
        )
        return Response({
            'message': 'Supervisor created successfully.',
            'id': supervisor.id,
            'mobile_number': supervisor.mobile_number
        }, status=status.HTTP_201_CREATED)

class SupervisorToggleView(APIView):
    permission_classes = [IsOwner]

    def post(self, request, pk=None):
        try:
            supervisor = User.objects.get(id=pk, role='supervisor')
        except User.DoesNotExist:
            return Response({'error': 'Supervisor not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        supervisor.is_active = not supervisor.is_active
        supervisor.save()
        return Response({
            'message': f'Supervisor {"activated" if supervisor.is_active else "deactivated"} successfully.',
            'is_active': supervisor.is_active
        })

class ReportGenerationView(APIView):
    permission_classes = [IsOwner]

    def get(self, request):
        report_type = request.query_params.get('report_type', 'investments')
        
        if report_type == 'investments':
            investments = Investment.objects.all().order_by('-created_at')
            data = []
            for inv in investments:
                data.append({
                    'customer': inv.customer.full_name or inv.customer.mobile_number,
                    'plan': inv.plan.name,
                    'amount': float(inv.amount),
                    'status': inv.status,
                    'start_date': str(inv.start_date) if inv.start_date else '',
                    'maturity_date': str(inv.maturity_date) if inv.maturity_date else '',
                    'created_at': inv.created_at.strftime('%Y-%m-%d')
                })
            return Response(data)
            
        elif report_type == 'payouts':
            payouts = Payout.objects.all().order_by('due_date')
            data = []
            for p in payouts:
                data.append({
                    'customer': p.investment.customer.full_name or p.investment.customer.mobile_number,
                    'plan': p.investment.plan.name,
                    'due_date': str(p.due_date),
                    'amount': float(p.amount),
                    'status': p.status,
                    'paid_at': p.paid_at.strftime('%Y-%m-%d') if p.paid_at else ''
                })
            return Response(data)
            
        elif report_type == 'customers':
            customers = User.objects.filter(role='customer').order_by('-created_at')
            data = []
            for c in customers:
                data.append({
                    'full_name': c.full_name or '',
                    'mobile_number': c.mobile_number,
                    'kyc_status': c.kyc_status,
                    'wallet_balance': float(c.wallet_balance),
                    'joined': c.created_at.strftime('%Y-%m-%d')
                })
            return Response(data)
            
        return Response({'error': 'Invalid report_type.'}, status=status.HTTP_400_BAD_REQUEST)
