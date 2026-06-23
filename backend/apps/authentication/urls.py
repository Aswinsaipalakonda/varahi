from django.urls import path
from .views import SendOtpView, VerifyOtpView, SetPinView, VerifyPinView, UserMeView
from .admin_views import (
    AdminAnalyticsView,
    WalletAdjustView,
    SupervisorManagementView,
    SupervisorToggleView,
    ReportGenerationView
)

urlpatterns = [
    path('send-otp/', SendOtpView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOtpView.as_view(), name='verify-otp'),
    path('set-pin/', SetPinView.as_view(), name='set-pin'),
    path('verify-pin/', VerifyPinView.as_view(), name='verify-pin'),
    path('me/', UserMeView.as_view(), name='me'),
    
    # Admin URLs
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/wallet-adjust/', WalletAdjustView.as_view(), name='admin-wallet-adjust'),
    path('admin/supervisors/', SupervisorManagementView.as_view(), name='admin-supervisors'),
    path('admin/supervisors/<uuid:pk>/toggle/', SupervisorToggleView.as_view(), name='admin-supervisor-toggle'),
    path('admin/reports/', ReportGenerationView.as_view(), name='admin-reports'),
]

