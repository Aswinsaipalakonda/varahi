from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/kyc/', include('apps.kyc.urls')),
    path('api/v1/plans/', include('apps.plans.urls')),
    path('api/v1/investments/', include('apps.investments.urls')),
    path('api/v1/payouts/', include('apps.payouts.urls')),
    path('api/v1/referrals/', include('apps.referrals.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
