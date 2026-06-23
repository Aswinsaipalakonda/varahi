from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InvestmentPlan
from .serializers import InvestmentPlanSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'owner'

class InvestmentPlanViewSet(viewsets.ModelViewSet):
    queryset = InvestmentPlan.objects.all()
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        return InvestmentPlanSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'customer':
            return InvestmentPlan.objects.filter(is_active=True)
        return InvestmentPlan.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[IsOwnerOrReadOnly])
    def toggle(self, request, pk=None):
        plan = self.get_object()
        plan.is_active = not plan.is_active
        plan.save()
        return Response({'is_active': plan.is_active, 'message': f'Plan {"activated" if plan.is_active else "deactivated"} successfully'})

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()
        if plan.investments.exists():
            return Response({'error': 'Cannot delete plan with active investments. Deactivate it instead.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
