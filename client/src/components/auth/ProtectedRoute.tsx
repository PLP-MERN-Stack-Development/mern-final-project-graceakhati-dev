import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

export interface ProtectedRouteProps {
  /**
   * Array of allowed roles. If undefined, any authenticated user can access.
   */
  allowedRoles?: UserRole[];
  /**
   * Child components to render if access is granted
   */
  children: ReactNode;
}

/**
 * ProtectedRoute Component (Zustand-based)
 *
 * Enforces role-based access control for routes using Zustand auth store.
 *
 * Behavior:
 * - If user is not authenticated -> redirects to /login
 * - If user is authenticated but role not in allowedRoles -> redirects to /unauthorized
 * - If allowedRoles is undefined -> allows any authenticated user
 * - If user is authenticated and role matches -> renders children
 *
 * Role restrictions:
 * - Student cannot access /admin/* or /instructor/*
 * - Instructor cannot access /student/* or /admin/*
 * - Admin cannot access /student/* or /instructor/*
 *
 * @example
 * ```tsx
 * // Allow only admin users
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * // Allow any authenticated user
 * <ProtectedRoute>
 *   <UserProfile />
 * </ProtectedRoute>
 *
 * // Allow multiple roles
 * <ProtectedRoute allowedRoles={['student', 'instructor']}>
 *   <CourseContent />
 * </ProtectedRoute>
 * ```
 */
function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Save the attempted location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is undefined, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

export default ProtectedRoute;

