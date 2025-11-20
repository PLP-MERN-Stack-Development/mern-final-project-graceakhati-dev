import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import authService from '@/services/authService';

/**
 * User roles available in Planet Path
 */
export type UserRole = 'student' | 'instructor' | 'admin';

/**
 * Authenticated user object
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  googleId?: string;
  xp?: number;
  badges?: string[];
  _id?: string; // MongoDB _id for backward compatibility
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials
 */
export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Currently uses mock authentication - replace login() implementation with
 * real API call when backend is ready.
 * 
 * Example backend integration:
 * ```typescript
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(credentials)
 * });
 * const data = await response.json();
 * setAuthState({ user: data.user, token: data.token });
 * ```
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Storage key for localStorage (matches Zustand store)
 */
const STORAGE_KEY = 'planet-path-auth-storage';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication context.
 * Persists auth state in localStorage for session persistence.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load authentication state from localStorage on mount
   */
  useEffect(() => {
    const loadAuthState = () => {
      try {
        // Try loading from Zustand store first
        const authStore = useAuthStore.getState();
        if (authStore && authStore.user && authStore.token) {
          setUser(authStore.user);
          setToken(authStore.token);
          setIsLoading(false);
          return;
        }

        // Fallback to localStorage (using same key as Zustand store)
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user && parsed.token) {
              setUser(parsed.user);
              setToken(parsed.token);
              // Sync with Zustand store
              const store = useAuthStore.getState();
              if (store && typeof store.loginWithUser === 'function') {
                store.loginWithUser(parsed.user, parsed.token);
              }
            }
          } catch (parseError) {
            // Invalid JSON - clear corrupted data
            localStorage.removeItem(STORAGE_KEY);
            // Safely call logout on Zustand store
            try {
              const store = useAuthStore.getState();
              if (store && typeof store.logout === 'function') {
                store.logout();
              }
            } catch (storeError) {
              // Silently fail if store is not available
            }
          }
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
        // Safely call logout on Zustand store
        try {
          const store = useAuthStore.getState();
          if (store && typeof store.logout === 'function') {
            store.logout();
          }
        } catch (storeError) {
          // Silently fail if store is not available
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  /**
   * Login function
   * 
   * Authenticates user with backend API using email and password.
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // Call backend API via authService
      const { user, token } = await authService.login(
        credentials.email.trim(),
        credentials.password
      );

      // Normalize user data
      const authUser: AuthUser = {
        id: user._id || user.id || '',
        name: user.name || '',
        email: user.email || '',
        role: (user.role as UserRole) || 'student',
        googleId: user.googleId,
        xp: user.xp,
        badges: user.badges,
        _id: user._id,
      };

      // Update state
      setUser(authUser);
      setToken(token);

      // Persist to localStorage (using same key as Zustand store)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: authUser,
        token,
        isAuthenticated: true,
        role: authUser.role,
      }));

      // Sync with Zustand store
      try {
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(authUser, token);
        }
      } catch (storeError) {
        // Silently fail if store is not available
      }
    } catch (error: any) {
      // Re-throw error for component handling
      throw error;
    }
  };

  /**
   * Signup function
   * 
   * Registers a new user with backend API.
   */
  const signup = async (credentials: SignupCredentials): Promise<void> => {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Call backend API via authService
      const { user, token } = await authService.signup(
        credentials.fullName.trim(),
        credentials.email.trim(),
        credentials.password,
        credentials.role
      );

      // Normalize user data
      const authUser: AuthUser = {
        id: user._id || user.id || '',
        name: user.name || '',
        email: user.email || '',
        role: (user.role as UserRole) || credentials.role,
        googleId: user.googleId,
        xp: user.xp,
        badges: user.badges,
        _id: user._id,
      };

      // Update state
      setUser(authUser);
      setToken(token);

      // Persist to localStorage (using same key as Zustand store)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: authUser,
        token,
        isAuthenticated: true,
        role: authUser.role,
      }));

      // Sync with Zustand store
      try {
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(authUser, token);
        }
      } catch (storeError) {
        // Silently fail if store is not available
      }
    } catch (error: any) {
      // Re-throw error for component handling
      throw error;
    }
  };

  /**
   * Login with Google
   * 
   * Redirects to backend Google OAuth endpoint.
   * The backend handles the OAuth flow and redirects back to frontend with token.
   * Token handling is done by handleGoogleOAuthCallback() utility function.
   */
  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Get backend API URL from environment or use default
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const googleAuthUrl = `${apiUrl}/auth/google`;
      
      // Redirect to backend Google OAuth endpoint
      // Backend will handle OAuth flow and redirect back to frontend with token
      window.location.href = googleAuthUrl;
    } catch (error: any) {
      // Re-throw error for component handling
      throw new Error(error.message || 'Google login failed. Please try again.');
    }
  };

  /**
   * Signup with Google
   * 
   * Simulates Google OAuth signup - replace with real OAuth flow.
   */
  const signupWithGoogle = async (): Promise<void> => {
    // For now, same as loginWithGoogle - backend should handle new vs existing users
    await loginWithGoogle();
  };

  /**
   * Logout function
   * 
   * Clears authentication state and localStorage.
   */
  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);

    // Safely call logout on Zustand store
    try {
      const store = useAuthStore.getState();
      if (store && typeof store.logout === 'function') {
        store.logout();
      }
    } catch (storeError) {
      // Silently fail if store is not available
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    loginWithGoogle,
    signupWithGoogle,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Hook to access authentication context.
 * Must be used within AuthProvider.
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

