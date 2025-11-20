import { ReactNode, useEffect, useState } from 'react';
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
 * ProtectedRoute Component
 *
 * SECURITY: Enforces role-based access control with strict JWT validation.
 * Validates token on every route access to prevent token tampering.
 *
 * Security Features:
 * 1. JWT format validation (3 parts: header.payload.signature)
 * 2. Token presence check on every render
 * 3. Role verification from multiple sources (Zustand + localStorage)
 * 4. Automatic cleanup of invalid/corrupted tokens
 * 5. Prevents role escalation attacks
 *
 * Behavior:
 * 1. Waits for auth.loading === false
 * 2. Validates JWT token format from localStorage
 * 3. Resolves user role before rendering
 * 4. If no token -> redirects to /login?redirect=<current-path>
 * 5. If role mismatch -> redirects to /unauthorized
 * 6. Else renders children
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
  const { user, isLoading, role } = useAuthStore();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [resolvedRole, setResolvedRole] = useState<UserRole | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  
  /**
   * SECURITY: Validate JWT token format
   * Returns true if token is valid JWT format (3 parts)
   */
  const validateJWTFormat = (token: string | null): boolean => {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3; // Valid JWT: header.payload.signature
  };

  /**
   * SECURITY: Check JWT token from localStorage and validate on every route access
   * This prevents token tampering and ensures security on every navigation
   * 
   * Security Checks:
   * 1. Token format validation (JWT must have 3 parts)
   * 2. Token presence check
   * 3. Role consistency check (prevents role escalation)
   * 4. Automatic cleanup of invalid tokens
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check localStorage for token
        const stored = localStorage.getItem('planet-path-auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const token = parsed.token || null;
          const userRole = parsed.role || parsed.user?.role || null;
          const user = parsed.user || null;
          
          // SECURITY: Validate JWT token format (strict check)
          if (validateJWTFormat(token)) {
            // Valid JWT format - ensure it's synced with Zustand store
            setHasToken(true);
            setResolvedRole(userRole);
            
            // SECURITY: Sync with Zustand store to prevent state inconsistencies
            const authStore = useAuthStore.getState();
            if (!authStore.token || authStore.token !== token) {
              useAuthStore.getState().setToken(token);
            }
            if (user && (!authStore.user || authStore.user.id !== user.id)) {
              useAuthStore.getState().setUser(user);
            }
            if (userRole && (!authStore.role || authStore.role !== userRole)) {
              useAuthStore.getState().setRole(userRole as UserRole);
            }
            
            // SECURITY: Role consistency check - prevent role escalation
            // Ensure role from localStorage matches role from Zustand store
            const storeRole = authStore.role || authStore.user?.role;
            if (userRole && storeRole && userRole !== storeRole) {
              // Role mismatch detected - potential tampering, clear auth
              console.warn('Security: Role mismatch detected. Clearing auth state.');
              setHasToken(false);
              setResolvedRole(null);
              localStorage.removeItem('planet-path-auth-storage');
              useAuthStore.getState().logout();
              setIsCheckingAuth(false);
              return;
            }
          } else {
            // Invalid JWT format - clear storage (security: prevent token tampering)
            setHasToken(false);
            setResolvedRole(null);
            localStorage.removeItem('planet-path-auth-storage');
            useAuthStore.getState().logout();
          }
        } else {
          // No stored auth data
          setHasToken(false);
          setResolvedRole(null);
        }
      } catch (error) {
        // Corrupted localStorage - clear it (security: prevent data corruption attacks)
        setHasToken(false);
        setResolvedRole(null);
        try {
          localStorage.removeItem('planet-path-auth-storage');
          useAuthStore.getState().logout();
        } catch {
          // Ignore errors when clearing
        }
      }
      setIsCheckingAuth(false);
    };

    // Wait for auth store to finish loading, then validate
    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading, location.pathname]); // Re-validate on route change

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        data-testid="protected-route-loading"
      >
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Get current path for redirect query parameter
  // Safely encode the path to prevent URI malformed errors
  const currentPath = location.pathname + location.search;
  let loginRedirectUrl: string;
  try {
    // Validate and encode the path
    const encodedPath = encodeURIComponent(currentPath);
    loginRedirectUrl = `/login?redirect=${encodedPath}`;
  } catch (error) {
    // Fallback to just pathname if encoding fails
    console.warn('Failed to encode redirect path, using pathname only:', error);
    loginRedirectUrl = `/login?redirect=${encodeURIComponent(location.pathname)}`;
  }

  // Logic: If no token -> redirect to /login
  if (!hasToken) {
    return (
      <Navigate 
        to={loginRedirectUrl} 
        replace 
        state={{ from: location }}
        data-testid="protected-route-redirect-login"
      />
    );
  }

  // If allowedRoles is undefined, allow any authenticated user with token
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // SECURITY: Resolve role from multiple sources (defense in depth)
  const userRole = role || user?.role || resolvedRole;

  // SECURITY: Role-based access control - prevent role escalation
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Role mismatch - user doesn't have required role
      // This prevents role escalation attacks (e.g., student accessing admin routes)
      return (
        <Navigate 
          to="/unauthorized" 
          replace 
          state={{ from: location }}
          data-testid="protected-route-redirect-unauthorized"
        />
      );
    }
  }

  // SECURITY: All checks passed - render children
  return <>{children}</>;
}

export default ProtectedRoute;
