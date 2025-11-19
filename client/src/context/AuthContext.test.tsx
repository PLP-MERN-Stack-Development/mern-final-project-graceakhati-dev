import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { useAuthStore } from '@/store/useAuthStore';
import authService from '@/services/authService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useAuthStore - Zustand store with getState() method
const mockLogout = vi.fn();
const mockLoginWithUser = vi.fn();

const createMockStore = (initialState: any = {}) => ({
  user: initialState.user || null,
  token: initialState.token || null,
  isAuthenticated: initialState.isAuthenticated || false,
  isLoading: initialState.isLoading || false,
  role: initialState.role || null,
  logout: mockLogout,
  loginWithUser: mockLoginWithUser,
  ...initialState,
});

let mockState = createMockStore();

vi.mock('@/store/useAuthStore', () => {
  return {
    useAuthStore: vi.fn((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    }),
  };
});

// Add getState method to the mock - this will be reset in beforeEach
(useAuthStore as any).getState = vi.fn(() => mockState);
(useAuthStore as any).setState = vi.fn((newState: any) => {
  mockState = { ...mockState, ...newState };
});

// Mock authService
vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn(),
    signup: vi.fn(),
    loginWithGoogle: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('AuthContext / useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockLogout.mockClear();
    mockLoginWithUser.mockClear();
    // Reset mock store state
    (useAuthStore as any).getState = vi.fn(() => createMockStore());
  });

  describe('useAuth hook', () => {
    it('should return auth context values', async () => {
      const mockStore = createMockStore({
        user: { id: 'user1', name: 'Test User', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.user).toBeDefined();
        expect(result.current.isAuthenticated).toBeDefined();
      });
    });

    it('should load auth state from localStorage on mount', async () => {
      const storedUser = {
        id: 'user123',
        name: 'Stored User',
        role: 'student',
      };
      const storedToken = 'stored-token';

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
        role: 'student',
      }));

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockLoginWithUser).toHaveBeenCalledWith(storedUser, storedToken);
      });
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('planet-path-auth-storage', 'invalid-json');

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(localStorage.getItem('planet-path-auth-storage')).toBeNull();
      });
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
      };
      const mockToken = 'token123';

      (authService.login as any).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login errors', async () => {
      (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrong',
          });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('signup', () => {
    it('should signup successfully and update state', async () => {
      const mockUser = {
        id: 'user1',
        name: 'New User',
        email: 'new@example.com',
        role: 'student',
      };
      const mockToken = 'token123';

      (authService.signup as any).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signup({
          fullName: 'New User',
          email: 'new@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'student',
        });
      });

      expect(authService.signup).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout and clear state', () => {
      const mockStore = createMockStore({
        user: { id: 'user1', name: 'Test', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(localStorage.getItem('planet-path-auth-storage')).toBeNull();
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google successfully', async () => {
      const mockUser = {
        id: 'google-user',
        name: 'Google User',
        email: 'google@example.com',
        role: 'student',
      };
      const mockToken = 'google-token';

      (authService.loginWithGoogle as any).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const mockStore = createMockStore({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      (useAuthStore.getState as any) = vi.fn(() => mockStore);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loginWithGoogle();
      });

      expect(authService.loginWithGoogle).toHaveBeenCalled();
    });
  });
});
