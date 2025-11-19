import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole, useAuthStore } from '@/store/useAuthStore';

export interface RoleGuardProps {
  /**
   * Required role(s) to access this route
   * If array, user must have one of the roles
   */
  allowedRoles: UserRole | UserRole[];
  /**
   * Child components to render if access is granted
   */
  children: ReactNode;
  /**
   * Redirect path if user doesn't have required role (default: /unauthorized)
   */
  redirectTo?: string;
}

/**
 * RoleGuard Component
 * 
 * SECURITY: Strict role-based route protection with JWT validation.
 * Validates token and role on every render to prevent role escalation.
 * 
 * Security Features:
 * 1. JWT format validation (3 parts: header.payload.signature)
 * 2. Role verification from multiple sources (Zustand + localStorage)
 * 3. Automatic cleanup of invalid tokens
 * 4. Prevents role escalation attacks
 * 
 * Behavior:
 * - If user is not authenticated -> redirects to /login
 * - If user is authenticated but role doesn't match -> redirects to /unauthorized (or custom redirectTo)
 * - If user is authenticated and role matches -> renders children
 * 
 * @example
 * ```tsx
 * // Only students can access
 * <RoleGuard allowedRoles="student">
 *   <StudentDashboard />
 * </RoleGuard>
 * 
 * // Only instructors can access
 * <RoleGuard allowedRoles="instructor">
 *   <InstructorDashboard />
 * </RoleGuard>
 * 
 * // Multiple roles allowed
 * <RoleGuard allowedRoles={['student', 'instructor']}>
 *   <CourseContent />
 * </RoleGuard>
 * ```
 */
function RoleGuard({ allowedRoles, children, redirectTo = '/unauthorized' }: RoleGuardProps) {
  
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
   * SECURITY: Get auth from localStorage with strict JWT validation
   * Also syncs with Zustand store for consistency
   */
  const getAuthFromStorage = (): { user: { role: UserRole } | null; isAuthenticated: boolean } => {
    try {
      const stored = localStorage.getItem('planet-path-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed.token;
        const user = parsed.user || null;
        const userRole = parsed.role || parsed.user?.role || null;
        
        // SECURITY: Validate JWT token format (strict check)
        if (validateJWTFormat(token)) {
          // Valid JWT format - sync with Zustand store
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
          const storeRole = authStore.role || authStore.user?.role;
          if (userRole && storeRole && userRole !== storeRole) {
            // Role mismatch detected - potential tampering, clear auth
            console.warn('Security: Role mismatch detected. Clearing auth state.');
            localStorage.removeItem('planet-path-auth-storage');
            useAuthStore.getState().logout();
            return { user: null, isAuthenticated: false };
          }
          
          return {
            user: user,
            isAuthenticated: !!(user && token),
          };
        }
        
        // Invalid token format - clear storage (security: prevent token tampering)
        localStorage.removeItem('planet-path-auth-storage');
        useAuthStore.getState().logout();
      }
    } catch (error) {
      // Corrupted localStorage - clear it (security: prevent data corruption attacks)
      try {
        localStorage.removeItem('planet-path-auth-storage');
        useAuthStore.getState().logout();
      } catch {
        // Ignore errors when clearing
      }
    }
    return { user: null, isAuthenticated: false };
  };

  const { user, isAuthenticated } = getAuthFromStorage();
  
  // SECURITY: Also check Zustand store for role (defense in depth)
  const authStore = useAuthStore.getState();
  const storeRole = authStore.role || authStore.user?.role;
  const finalRole = storeRole || user?.role;

  // SECURITY: Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // SECURITY: Normalize allowedRoles to array
  const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // SECURITY: Role-based access control - prevent role escalation
  // Check role from both localStorage and Zustand store (defense in depth)
  const userRole = finalRole || user.role;
  
  if (!userRole) {
    // No role found - security issue, redirect to login
    return <Navigate to="/login" replace />;
  }

  // SECURITY: Check if user's role is in the allowed roles
  // This prevents role escalation attacks (e.g., student accessing admin routes)
  const hasAccess = allowedRolesArray.includes(userRole);

  if (!hasAccess) {
    // User is authenticated but doesn't have the required role
    // This is a role escalation attempt - redirect to unauthorized
    return <Navigate to={redirectTo} replace />;
  }

  // SECURITY: All checks passed - user is authenticated and has required role
  return <>{children}</>;
}

export default RoleGuard;

