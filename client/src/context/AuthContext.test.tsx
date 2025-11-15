import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginCredentials } from './AuthContext';
import { useAuthStore } from '@/store/useAuthStore';

// Mock Zustand store - must be defined inside vi.mock factory due to hoisting
vi.mock('@/store/useAuthStore', () => {
  const mockStore = {
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
    isLoading: false,
    role: null as any,
    login: vi.fn(),
    signup: vi.fn(),
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    loginWithUser: vi.fn().mockImplementation(() => {}), // Ensure it's a callable function
    checkRole: vi.fn(),
    setUser: vi.fn(),
    setToken: vi.fn(),
    setLoading: vi.fn(),
    setRole: vi.fn(),
  };

  // Create a mock that has both the hook and getState
  const mockUseAuthStore = vi.fn(() => mockStore);
  
  // Ensure getState returns the mockStore with all methods including loginWithUser
  mockUseAuthStore.getState = vi.fn(() => ({
    ...mockStore,
    loginWithUser: vi.fn().mockImplementation(() => {}), // Ensure it's always available
  }));

  return {
    useAuthStore: mockUseAuthStore,
  };
});

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

// Test component that uses useAuth hook
function TestComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button
        data-testid="login-button"
        onClick={() =>
          login({
            email: 'testuser@example.com',
            password: 'password',
          })
        }
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Reset Zustand store mock - access the mocked store directly
    const store = useAuthStore.getState();
    if (store) {
      store.user = null;
      store.token = null;
      store.isAuthenticated = false;
      store.isLoading = false;
      if (typeof store.login === 'function' && 'mockClear' in store.login) {
        (store.login as any).mockClear();
      }
      if (typeof store.logout === 'function' && 'mockClear' in store.logout) {
        (store.logout as any).mockClear();
      }
    }
  });

  describe('Initial State', () => {
    it('should have null user and token initially', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });

    it('should load user and token from localStorage on mount', async () => {
      const mockUser = { id: 'u-1', name: 'John Doe', role: 'student' as const };
      const mockToken = 'stored_token_123';

      localStorageMock.setItem('planet_path_user', JSON.stringify(mockUser));
      localStorageMock.setItem('planet_path_token', mockToken);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });
  });

  describe('Login Functionality', () => {
    it('should set user and token when login is called', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      await loginButton.click();

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        },
        { timeout: 2000 }
      );

      // Check that user is set
      const userText = screen.getByTestId('user').textContent;
      expect(userText).not.toBe('null');
      // The name is extracted from email: testuser@example.com -> testuser
      const user = JSON.parse(userText || 'null');
      expect(user).toBeTruthy();
      expect(user.name).toBe('testuser');
      expect(user.role).toBe('student');

      // Check that token is set
      const tokenText = screen.getByTestId('token').textContent;
      expect(tokenText).not.toBe('null');
      expect(tokenText).toContain('mock_token_');
    });

    it('should persist user and token to localStorage after login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      loginButton.click();

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        },
        { timeout: 2000 }
      );

      // Wait a bit more for localStorage to be updated
      await waitFor(
        () => {
          const storedUser = localStorageMock.getItem('planet_path_user');
          const storedToken = localStorageMock.getItem('planet_path_token');
          expect(storedUser).not.toBeNull();
          expect(storedToken).not.toBeNull();
        },
        { timeout: 1000 }
      );

      // Check localStorage
      const storedUser = localStorageMock.getItem('planet_path_user');
      const storedToken = localStorageMock.getItem('planet_path_token');

      expect(storedUser).not.toBeNull();
      expect(storedToken).not.toBeNull();

      if (storedUser) {
        const user = JSON.parse(storedUser);
        expect(user.name).toBe('testuser');
        expect(user.role).toBe('student');
      }

      if (storedToken) {
        expect(storedToken).toContain('mock_token_');
      }
    });

    it('should create user with email extracted from credentials', async () => {
      // Create a test component that logs in with email
      function EmailLoginComponent() {
        const { user, token, isAuthenticated, login } = useAuth();

        return (
          <div>
            <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
            <div data-testid="token">{token || 'null'}</div>
            <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <button
              data-testid="email-login-button"
              onClick={() =>
                login({
                  email: 'adminuser@example.com',
                  password: 'password',
                })
              }
            >
              Login with Email
            </button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <EmailLoginComponent />
        </AuthProvider>
      );

      const emailLoginButton = screen.getByTestId('email-login-button');
      emailLoginButton.click();

      await waitFor(
        () => {
          const userText = screen.getByTestId('user').textContent;
          expect(userText).toContain('adminuser');
          // Note: role is defaulted to 'student' in mock - backend would return actual role
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Logout Functionality', () => {
    it('should clear user and token when logout is called', async () => {
      // First login
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      loginButton.click();

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        },
        { timeout: 1000 }
      );

      // Then logout
      const logoutButton = screen.getByTestId('logout-button');
      logoutButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    it('should clear localStorage when logout is called', async () => {
      // First login
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      loginButton.click();

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        },
        { timeout: 1000 }
      );

      // Verify localStorage has data
      expect(localStorageMock.getItem('planet_path_user')).not.toBeNull();
      expect(localStorageMock.getItem('planet_path_token')).not.toBeNull();

      // Then logout
      const logoutButton = screen.getByTestId('logout-button');
      logoutButton.click();

      await waitFor(() => {
        // Check that localStorage is cleared
        expect(localStorageMock.getItem('planet_path_user')).toBeNull();
        expect(localStorageMock.getItem('planet_path_token')).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should be false when user or token is null', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });

    it('should be true when both user and token are set', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      loginButton.click();

      await waitFor(
        () => {
          expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('planet_path_user', 'invalid-json');
      localStorageMock.setItem('planet_path_token', 'some-token');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(
        () => {
          // Should clear corrupted data
          expect(localStorageMock.getItem('planet_path_user')).toBeNull();
          expect(localStorageMock.getItem('planet_path_token')).toBeNull();
        },
        { timeout: 2000 }
      );

      consoleSpy.mockRestore();
    });
  });
});

