from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    UserListView,
    UserDetailView,
    VerifyTokenView
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify_token'),
    
    # User endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]


# ============================================
# backend/authentication/middleware.py
# ============================================

from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    JWT token'ı otomatik olarak kontrol eden middleware
    """
    def process_request(self, request):
        # Authorization header'ı kontrol et
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            try:
                jwt_authenticator = JWTAuthentication()
                validated_token = jwt_authenticator.get_validated_token(
                    auth_header.split(' ')[1]
                )
                request.user = jwt_authenticator.get_user(validated_token)
            except InvalidToken:
                pass
        
        return None