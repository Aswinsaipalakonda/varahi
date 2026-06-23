from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestmentPlanViewSet

router = DefaultRouter()
router.register(r'', InvestmentPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
