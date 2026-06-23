from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Notification
from .serializers import NotificationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'read', 'message': 'Notification marked as read.'})

    @action(detail=False, methods=['post'])
    def register_token(self, request):
        fcm_token = request.data.get('fcm_token')
        if not fcm_token:
            return Response({'error': 'fcm_token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.fcm_token = fcm_token
        request.user.save()
        return Response({'message': 'FCM token registered successfully.'})

    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        if request.user.role != 'owner':
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        title = request.data.get('title')
        body = request.data.get('body')
        if not title or not body:
            return Response({'error': 'title and body are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        customers = User.objects.filter(role='customer')
        notifications = []
        for cust in customers:
            notifications.append(
                Notification(
                    user=cust,
                    title=title,
                    body=body,
                    type='announcement',
                    sent_via='push'
                )
            )
            print(f"BROADCAST to {cust.mobile_number}: {title} - {body}")
            
        Notification.objects.bulk_create(notifications)
        return Response({'message': f'Broadcasted notification to {len(customers)} customers.'})
