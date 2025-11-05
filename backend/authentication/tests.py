from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthenticationTestCase(TestCase):
    """Authentication test case"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_register(self):
        """Test user registration"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login(self):
        """Test user login"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_login_with_email(self):
        """Test login with email"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile(self):
        """Test get user profile"""
        # Login first
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post('/api/auth/login/', login_data)
        token = login_response.data['access']
        
        # Get profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_change_password(self):
        """Test password change"""
        # Login
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post('/api/auth/login/', login_data)
        token = login_response.data['access']
        
        # Change password
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        change_data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'new_password2': 'newpass123'
        }
        response = self.client.post('/api/auth/change-password/', change_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout(self):
        """Test logout"""
        # Login
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post('/api/auth/login/', login_data)
        token = login_response.data['access']
        refresh = login_response.data['refresh']
        
        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        logout_data = {'refresh': refresh}
        response = self.client.post('/api/auth/logout/', logout_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)