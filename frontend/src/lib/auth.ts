import axios from 'axios';
import { User, AuthTokens } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

class AuthService {
  async login(username: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await axios.post(`${API_URL}/api/auth/login/`, {
      username,
      password,
    });

    const { access, refresh, user } = response.data;
    
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);

    return { user, tokens: { access, refresh } };
  }

  async loginWithEmail(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await axios.post(`${API_URL}/api/auth/login/`, {
      email,
      password,
    });

    const { access, refresh, user } = response.data;
    
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);

    return { user, tokens: { access, refresh } };
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await axios.post(`${API_URL}/api/auth/register/`, data);

    const { access, refresh, user } = response.data;
    
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);

    return { user, tokens: { access, refresh } };
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await axios.post(
          `${API_URL}/api/auth/logout/`,
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${this.getAccessToken()}`,
            },
          }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.clearTokens();
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      this.setAccessToken(access);
      
      return access;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    try {
      await axios.post(
        `${API_URL}/api/auth/verify-token/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async changePassword(oldPassword: string, newPassword: string, newPassword2: string): Promise<void> {
    const token = this.getAccessToken();
    
    await axios.post(
      `${API_URL}/api/auth/change-password/`,
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();