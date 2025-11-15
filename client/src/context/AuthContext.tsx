import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

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
  role: UserRole;
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
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  USER: 'planet_path_user',
  TOKEN: 'planet_path_token',
} as const;

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
        if (authStore.user && authStore.token) {
          setUser(authStore.user);
          setToken(authStore.token);
          setIsLoading(false);
          return;
        }

        // Fallback to localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            setUser(user);
            setToken(storedToken);
            // Sync with Zustand store
            const authStore = useAuthStore.getState();
            if (authStore && typeof authStore.loginWithUser === 'function') {
              authStore.loginWithUser(user, storedToken);
            }
          } catch (parseError) {
            // Invalid JSON - clear corrupted data
            console.error('Error parsing stored user:', parseError);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            useAuthStore.getState().logout();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        useAuthStore.getState().logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  /**
   * Login function
   * 
   * Simulates authentication - replace with real API call.
   * 
   * TODO: Replace with actual backend API call:
   * ```typescript
   * const response = await fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email, password })
   * });
   * 
   * if (!response.ok) {
   *   throw new Error('Login failed');
   * }
   * 
   * const data = await response.json();
   * return { user: data.user, token: data.token };
   * ```
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock authentication - always succeeds
    // TODO: Replace with real backend authentication
    // In real app, backend would return user with role
    const mockUser: AuthUser = {
      id: `u-${Date.now()}`,
      name: credentials.email.split('@')[0], // Extract name from email
      role: 'student', // Default role - backend should return actual role
    };

    // Generate mock token (in real app, this comes from backend)
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update state
    setUser(mockUser);
    setToken(mockToken);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

        // Sync with Zustand store
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(mockUser, mockToken);
        }
  };

  /**
   * Signup function
   * 
   * Simulates user registration - replace with real API call.
   * 
   * TODO: Replace with actual backend API call:
   * ```typescript
   * const response = await fetch('/api/auth/signup', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ fullName, email, password, role })
   * });
   * 
   * if (!response.ok) {
   *   throw new Error('Signup failed');
   * }
   * 
   * const data = await response.json();
   * return { user: data.user, token: data.token };
   * ```
   */
  const signup = async (credentials: SignupCredentials): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Mock user creation - always succeeds
    // TODO: Replace with real backend registration
    const mockUser: AuthUser = {
      id: `u-${Date.now()}`,
      name: credentials.fullName,
      role: credentials.role,
    };

    // Generate mock token (in real app, this comes from backend)
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update state
    setUser(mockUser);
    setToken(mockToken);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

        // Sync with Zustand store
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(mockUser, mockToken);
        }
  };

  /**
   * Login with Google
   * 
   * Simulates Google OAuth authentication - replace with real OAuth flow.
   * 
   * TODO: Replace with actual Google OAuth implementation:
   * ```typescript
   * // Use Google OAuth library (e.g., @react-oauth/google)
   * const response = await googleAuth.signIn();
   * const user = await fetchUserInfo(response.access_token);
   * // Backend should handle user creation/login
   * ```
   */
  const loginWithGoogle = async (): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock Google authentication
    // TODO: Replace with real Google OAuth
    const mockUser: AuthUser = {
      id: `u-google-${Date.now()}`,
      name: 'Google User',
      role: 'student', // Backend should determine role
    };

    const mockToken = `google_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setUser(mockUser);
    setToken(mockToken);

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

        // Sync with Zustand store
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(mockUser, mockToken);
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
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    // Sync with Zustand store
    useAuthStore.getState().logout();
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

