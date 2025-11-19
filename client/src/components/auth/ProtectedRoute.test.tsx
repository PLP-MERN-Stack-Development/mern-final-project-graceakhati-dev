import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './protectedroute';
import { useAuthStore } from '@/store/useAuthStore';

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

// Mock useAuthStore - Zustand store
let mockStoreState: any = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  role: null,
};

vi.mock('@/store/useAuthStore', () => {
  return {
    useAuthStore: vi.fn((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    }),
  };
});

// Add getState method to the mock
(useAuthStore as any).getState = vi.fn(() => mockStoreState);

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, dataTestId }: { to: string; dataTestId?: string }) => (
      <div data-testid={dataTestId || 'navigate'}>Redirecting to {to}</div>
    ),
  };
});

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset mock store state
    mockStoreState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
    };
    (useAuthStore.getState as any) = vi.fn(() => mockStoreState);
  });

  const TestComponent = () => <div data-testid="test-content">Protected Content</div>;

  const renderWithRouter = (component: React.ReactElement, initialEntries: string[] = ['/test']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading when isLoading is true', () => {
      mockStoreState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        role: null,
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('should show loading when checking auth from localStorage', () => {
      mockStoreState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Initially shows loading while checking localStorage
      expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when not authenticated', async () => {
      mockStoreState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-login')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('should redirect to login when no token in localStorage', async () => {
      mockStoreState = {
        user: { id: 'user1', name: 'Test', role: 'student' },
        token: null,
        isAuthenticated: false,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
      localStorage.clear();

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-login')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated Access - No Role Restriction', () => {
    it('should render children when authenticated and no allowedRoles specified', async () => {
      const mockUser = { id: 'user1', name: 'Test User', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      // Set localStorage to match
      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-route-redirect-login')).not.toBeInTheDocument();
    });

    it('should render children when allowedRoles is empty array', async () => {
      const mockUser = { id: 'user1', name: 'Test User', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={[]}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access when user role matches allowedRoles', async () => {
      const mockUser = { id: 'user1', name: 'Student', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['student']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });

    it('should allow access when user role is in multiple allowedRoles', async () => {
      const mockUser = { id: 'user1', name: 'Instructor', role: 'instructor' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'instructor',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'instructor',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['student', 'instructor']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });

    it('should redirect to unauthorized when user role does not match', async () => {
      const mockUser = { id: 'user1', name: 'Student', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-unauthorized')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('should allow admin access to admin-only routes', async () => {
      const mockUser = { id: 'user1', name: 'Admin', role: 'admin' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'admin',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'admin',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });

    it('should allow instructor access to instructor-only routes', async () => {
      const mockUser = { id: 'user1', name: 'Instructor', role: 'instructor' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'instructor',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'instructor',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['instructor']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });

    it('should block student from accessing instructor routes', async () => {
      const mockUser = { id: 'user1', name: 'Student', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['instructor']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-unauthorized')).toBeInTheDocument();
      });
    });

    it('should block student from accessing admin routes', async () => {
      const mockUser = { id: 'user1', name: 'Student', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-unauthorized')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle user being null even when isAuthenticated is true', async () => {
      mockStoreState = {
        user: null,
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        role: null,
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      // No token in localStorage
      localStorage.clear();

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-login')).toBeInTheDocument();
      });
    });

    it('should handle multiple children components', async () => {
      const mockUser = { id: 'user1', name: 'Test', role: 'student' as const };
      const mockToken = 'token123';

      mockStoreState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      localStorage.setItem('planet-path-auth-storage', JSON.stringify({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        role: 'student',
      }));

      renderWithRouter(
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
      });
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      mockStoreState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);

      // Set invalid JSON in localStorage
      localStorage.setItem('planet-path-auth-storage', 'invalid-json');

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route-redirect-login')).toBeInTheDocument();
      });
    });
  });
});
