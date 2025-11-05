import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authService } from '@/lib/auth';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
            if (requireAuth) {
              router.push('/login');
            }
          }
        } else {
          setUser(null);
          if (requireAuth) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        if (requireAuth) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router, setUser, setLoading]);

  const login = async (username: string, password: string) => {
    const { user } = await authService.login(username, password);
    setUser(user);
    router.push('/dashboard');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
