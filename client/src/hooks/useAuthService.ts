import { useState, useCallback } from 'react';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthUser {
  id: string;
  name: string;
  role: string;
}

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
          role: user.role,
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
  const signup = useCallback(async (name: string, email: string, password: string, role: string = 'student') => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.signup(name, email, password, role);
      
      // Update auth store
      loginWithUser(
        {
          id: user._id || user.id || '',
          name: user.name,
          role: user.role,
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
          role: user.role,
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
            role: user.role,
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

