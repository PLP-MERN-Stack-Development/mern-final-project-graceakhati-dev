import { useState, useCallback } from 'react';
import authService from '@/services/authService';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

/**
 * React hook for authentication operations
 * @returns Auth service methods and loading state
 */
export function useAuthService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithUser, logout: logoutStore } = useAuthStore();

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(email, password);
      
      // Update auth store
      loginWithUser(
        {
          id: user._id || user.id || '',
          name: user.name,
          email: user.email || '',
          role: user.role as UserRole,
          googleId: (user as any).googleId,
          xp: (user as any).xp,
          badges: (user as any).badges,
        },
        token
      );

      return { user, token };
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithUser]);

  /**
   * Sign up a new user
   */
  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole = 'student') => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.signup(name, email, password, role);
      
      // Update auth store
      loginWithUser(
        {
          id: user._id || user.id || '',
          name: user.name,
          email: user.email || '',
          role: user.role as UserRole,
          googleId: (user as any).googleId,
          xp: (user as any).xp,
          badges: (user as any).badges,
        },
        token
      );

      return { user, token };
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithUser]);

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.loginWithGoogle();
      
      // Update auth store
      loginWithUser(
        {
          id: user._id || user.id || '',
          name: user.name,
          email: user.email || '',
          role: user.role as UserRole,
          googleId: (user as any).googleId,
          xp: (user as any).xp,
          badges: (user as any).badges,
        },
        token
      );

      return { user, token };
    } catch (err: any) {
      const errorMessage = err.message || 'Google login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithUser]);

  /**
   * Get current authenticated user
   */
  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.getCurrentUser();
      
      // Update auth store if user data changed
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || currentUser.id !== (user._id || user.id)) {
        loginWithUser(
          {
            id: user._id || user.id || '',
            name: user.name,
            email: user.email || '',
            role: user.role as UserRole,
            googleId: (user as any).googleId,
            xp: (user as any).xp,
            badges: (user as any).badges,
          },
          useAuthStore.getState().token || ''
        );
      }

      return user;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get current user';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithUser]);

  /**
   * Logout
   */
  const logout = useCallback(() => {
    logoutStore();
    setError(null);
  }, [logoutStore]);

  return {
    login,
    signup,
    loginWithGoogle,
    getCurrentUser,
    logout,
    isLoading,
    error,
  };
}

