from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .services import otp_service
from .serializers import SendOtpSerializer, VerifyOtpSerializer, SetPinSerializer, VerifyPinSerializer, UserSerializer

User = get_user_model()

class SendOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOtpSerializer(data=request.data)
        if serializer.is_valid():
            mobile_number = serializer.validated_data['mobile_number']
            otp_service.send_otp(mobile_number)
            return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        if serializer.is_valid():
            mobile_number = serializer.validated_data['mobile_number']
            otp = serializer.validated_data['otp']
            
            # Special check for admin / owner test account:
            is_valid_otp = otp_service.verify_otp(mobile_number, otp)
            if not is_valid_otp and mobile_number == "+919999999999" and otp == "123456":
                is_valid_otp = True

            if is_valid_otp:
                # Check if user exists or create
                user, created = User.objects.get_or_create(mobile_number=mobile_number)
                
                # Check if referred_by_code is provided for new user
                referred_by_code = request.data.get('referred_by_code')
                if created and referred_by_code:
                    try:
                        referrer = User.objects.get(referral_code=referred_by_code)
                        if referrer != user:
                            user.referred_by = referrer
                            user.save()
                    except User.DoesNotExist:
                        pass
                
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_new_user': created or not user.pin_hash,
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SetPinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SetPinSerializer(data=request.data)
        if serializer.is_valid():
            pin = serializer.validated_data['pin']
            request.user.pin_hash = make_password(pin)
            request.user.save()
            return Response({'message': 'PIN set successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyPinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyPinSerializer(data=request.data)
        if serializer.is_valid():
            pin = serializer.validated_data['pin']
            if check_password(pin, request.user.pin_hash):
                return Response({'message': 'PIN verified successfully'}, status=status.HTTP_200_OK)
                
            return Response({'error': 'Incorrect PIN'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
