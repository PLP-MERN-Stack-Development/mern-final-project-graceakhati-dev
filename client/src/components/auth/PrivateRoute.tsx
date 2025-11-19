import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export interface PrivateRouteProps {
  /**
   * Child components to render if access is granted
   */
  children: ReactNode;
  /**
   * Optional redirect path (default: /login)
   */
  redirectTo?: string;
}

/**
 * PrivateRoute Component
 * 
 * Wrapper component that checks if the user is authenticated.
 * Redirects unauthorized users to /login (or custom redirectTo path).
 * 
 * This is a simpler version of ProtectedRoute that doesn't check roles.
 * Use ProtectedRoute for role-based access control.
 * 
 * @example
 * ```tsx
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 * 
 * <PrivateRoute redirectTo="/signup">
 *   <Profile />
 * </PrivateRoute>
 * ```
 */
function PrivateRoute({ children, redirectTo = '/login' }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        data-testid="private-route-loading"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login with current path as redirect parameter
    const currentPath = location.pathname + location.search;
    const loginRedirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
    
    return (
      <Navigate 
        to={loginRedirectUrl} 
        replace 
        state={{ from: location }}
        data-testid="private-route-redirect-login"
      />
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}

export default PrivateRoute;
