import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

// Mock Zustand store
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute (Zustand-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Unauthenticated User', () => {
    it('should redirect to /login when user is not authenticated', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/login');
    });

    it('should show loading state while checking authentication', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Authenticated User - No Role Restrictions', () => {
    it('should render children when user is authenticated and no roles specified', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-1', name: 'John Doe', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow student to access student-only routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-1', name: 'John Doe', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['student']}>
            <div>Student Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    it('should redirect student when trying to access admin routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-1', name: 'John Doe', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should redirect student when trying to access instructor routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-1', name: 'John Doe', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['instructor']}>
            <div>Instructor Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should allow instructor to access instructor routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-2', name: 'Jane Smith', role: 'instructor' },
        token: 'token456',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['instructor']}>
            <div>Instructor Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Instructor Dashboard')).toBeInTheDocument();
    });

    it('should redirect instructor when trying to access student routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-2', name: 'Jane Smith', role: 'instructor' },
        token: 'token456',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['student']}>
            <div>Student Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should redirect instructor when trying to access admin routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-2', name: 'Jane Smith', role: 'instructor' },
        token: 'token456',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should allow admin to access admin routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-3', name: 'Admin User', role: 'admin' },
        token: 'token789',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should redirect admin when trying to access student routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-3', name: 'Admin User', role: 'admin' },
        token: 'token789',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['student']}>
            <div>Student Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should redirect admin when trying to access instructor routes', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-3', name: 'Admin User', role: 'admin' },
        token: 'token789',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['instructor']}>
            <div>Instructor Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveTextContent('/unauthorized');
    });

    it('should allow access when user role is in multiple allowed roles', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'u-1', name: 'John Doe', role: 'student' },
        token: 'token123',
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['student', 'instructor']}>
            <div>Shared Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Shared Content')).toBeInTheDocument();
    });
  });
});

