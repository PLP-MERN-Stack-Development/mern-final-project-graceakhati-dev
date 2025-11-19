import { create } from 'zustand';

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
 * Authentication Store State
 */
interface AuthStore {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setRole: (role: UserRole | null) => void;
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  
  // Legacy methods (for backward compatibility)
  loginWithUser: (user: AuthUser, token: string) => void;
  checkRole: (allowedRoles: UserRole[]) => boolean;
}

/**
 * Zustand store for authentication state
 * 
 * Persists auth state to localStorage.
 * This store can be used independently or alongside AuthContext.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // Login
 * login({ id: 'u-1', name: 'John', role: 'student' }, 'token123');
 * 
 * // Check role
 * const canAccess = checkRole(['admin', 'instructor']);
 * 
 * // Logout
 * logout();
 * ```
 */
export const useAuthStore = create<AuthStore>((set, get) => {
  // Load initial state from localStorage
  const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem('planet-path-auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            user: parsed.user || null,
            token: parsed.token || null,
            role: parsed.role || parsed.user?.role || null,
            isAuthenticated: !!(parsed.user && parsed.token),
          };
        }
      } catch (error) {
        // Silently fail - return unauthenticated state
      }
      return {
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
      };
  };

  const initialState = loadFromStorage();

  return {
    // Initial state
    user: initialState.user,
    token: initialState.token,
    isAuthenticated: initialState.isAuthenticated,
    isLoading: false,
    role: initialState.user?.role || null,

    /**
     * Set user
     */
    setUser: (user) => {
      const newState = {
        user,
        role: user?.role || null,
        isAuthenticated: !!user && !!get().token,
      };
      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: newState.user,
          token: get().token,
          isAuthenticated: newState.isAuthenticated,
          role: newState.role,
        })
      );
    },

    /**
     * Set token
     */
    setToken: (token) => {
      const newState = {
        token,
        isAuthenticated: !!get().user && !!token,
      };
      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: get().user,
          token: newState.token,
          isAuthenticated: newState.isAuthenticated,
          role: get().role,
        })
      );
    },

    /**
     * Set loading state
     */
    setLoading: (isLoading) => {
      set({ isLoading });
    },

    /**
     * Set role
     */
    setRole: (role) => {
      set({ role });
      // Update user role if user exists
      const { user } = get();
      if (user && role) {
        set({ user: { ...user, role } });
      }
      // Persist to localStorage
      const currentState = get();
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: currentState.user,
          token: currentState.token,
          isAuthenticated: currentState.isAuthenticated,
          role: currentState.role,
        })
      );
    },

    /**
     * Login with credentials
     * 
     * Simulates authentication - replace with real API call.
     * 
     * @example
     * ```tsx
     * await login({ email: 'user@example.com', password: 'password' });
     * ```
     */
    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock authentication - always succeeds
      // TODO: Replace with real backend authentication
      // In real app, backend would return user with role
      const mockUser: AuthUser = {
        id: `u-${Date.now()}`,
        name: credentials.email.split('@')[0], // Extract name from email
        email: credentials.email,
        role: 'student', // Default role - backend should return actual role
      };

      // Generate mock token (in real app, this comes from backend)
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newState = {
        user: mockUser,
        token: mockToken,
        role: mockUser.role,
        isAuthenticated: true,
        isLoading: false,
      };

      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: newState.user,
          token: newState.token,
          isAuthenticated: newState.isAuthenticated,
          role: newState.role,
        })
      );
    },

    /**
     * Signup with credentials
     * 
     * Simulates user registration - replace with real API call.
     * 
     * @example
     * ```tsx
     * await signup({
     *   fullName: 'John Doe',
     *   email: 'john@example.com',
     *   password: 'password',
     *   confirmPassword: 'password',
     *   role: 'student'
     * });
     * ```
     */
    signup: async (credentials: SignupCredentials) => {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        set({ isLoading: false });
        throw new Error('Passwords do not match');
      }

      // Mock user creation - always succeeds
      // TODO: Replace with real backend registration
      const mockUser: AuthUser = {
        id: `u-${Date.now()}`,
        name: credentials.fullName,
        email: credentials.email,
        role: credentials.role,
      };

      // Generate mock token (in real app, this comes from backend)
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newState = {
        user: mockUser,
        token: mockToken,
        role: mockUser.role,
        isAuthenticated: true,
        isLoading: false,
      };

      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: newState.user,
          token: newState.token,
          isAuthenticated: newState.isAuthenticated,
          role: newState.role,
        })
      );
    },

    /**
     * Login with Google OAuth
     * 
     * Simulates Google OAuth authentication - replace with real OAuth flow.
     * 
     * @example
     * ```tsx
     * await loginWithGoogle();
     * ```
     */
    loginWithGoogle: async () => {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock Google authentication
      // TODO: Replace with real Google OAuth
      const mockUser: AuthUser = {
        id: `u-google-${Date.now()}`,
        name: 'Google User',
        email: 'google@example.com',
        role: 'student', // Backend should determine role
      };

      const mockToken = `google_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newState = {
        user: mockUser,
        token: mockToken,
        role: mockUser.role,
        isAuthenticated: true,
        isLoading: false,
      };

      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: newState.user,
          token: newState.token,
          isAuthenticated: newState.isAuthenticated,
          role: newState.role,
        })
      );
    },

    /**
     * Logout - clear user and token
     */
    logout: () => {
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
      });
      // Clear localStorage
      localStorage.removeItem('planet-path-auth-storage');
    },

    /**
     * Legacy login method - for backward compatibility
     * Login with user and token directly
     */
    loginWithUser: (user, token) => {
      const newState = {
        user,
        token,
        role: user.role,
        isAuthenticated: true,
      };
      set(newState);
      // Persist to localStorage
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify(newState)
      );
    },

    /**
     * Check if user has one of the allowed roles
     * @param allowedRoles - Array of allowed roles
     * @returns True if user's role is in allowedRoles, false otherwise
     */
    checkRole: (allowedRoles) => {
      const { user, role } = get();
      // Check both user.role and direct role property
      const currentRole = user?.role || role;
      if (!currentRole) return false;
      return allowedRoles.includes(currentRole);
    },
  };
});

