from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Kullanıcı kayıt endpoint'i
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Token oluştur
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Kayıt başarılı'
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Özelleştirilmiş login endpoint'i
    POST /api/auth/login/
    Body: {"username": "...", "password": "..."}
    veya: {"email": "...", "password": "..."}
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # E-posta ile de giriş yapılabilmesi için
        if 'email' in request.data and 'username' not in request.data:
            try:
                user = User.objects.get(email=request.data['email'])
                request.data._mutable = True
                request.data['username'] = user.username
                request.data._mutable = False
            except User.DoesNotExist:
                pass
        
        return super().post(request, *args, **kwargs)


class LogoutView(views.APIView):
    """
    Logout endpoint'i - Refresh token'ı blacklist'e ekler
    POST /api/auth/logout/
    Body: {"refresh": "..."}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token gerekli"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"message": "Çıkış başarılı"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Kullanıcı profil endpoint'i
    GET /api/auth/profile/ - Profil bilgilerini getir
    PUT/PATCH /api/auth/profile/ - Profil bilgilerini güncelle
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    """
    Şifre değiştirme endpoint'i
    POST /api/auth/change-password/
    Body: {"old_password": "...", "new_password": "...", "new_password2": "..."}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                "message": "Şifre başarıyla değiştirildi"
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    Kullanıcı listesi (sadece admin)
    GET /api/auth/users/
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Sadece staff kullanıcılar tüm listeyi görebilir
        if self.request.user.is_staff:
            return User.objects.all()
        # Normal kullanıcılar sadece kendilerini görebilir
        return User.objects.filter(id=self.request.user.id)


class UserDetailView(generics.RetrieveAPIView):
    """
    Kullanıcı detay endpoint'i
    GET /api/auth/users/{id}/
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs.get('pk')
        # Sadece kendi bilgilerini veya staff ise herkesi görebilir
        if self.request.user.is_staff or str(self.request.user.id) == str(user_id):
            return User.objects.get(id=user_id)
        return self.request.user


class VerifyTokenView(views.APIView):
    """
    Token doğrulama endpoint'i
    POST /api/auth/verify-token/
    Body: {"token": "..."}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({
            "valid": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
            }
        })
