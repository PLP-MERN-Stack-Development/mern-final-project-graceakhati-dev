import { ReactNode, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export interface ProtectedLinkProps {
  /**
   * Path to navigate to when authenticated
   */
  to: string;
  /**
   * Link content (children)
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Click handler (called after navigation if authenticated)
   */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
  /**
   * ARIA label
   */
  'aria-label'?: string;
  /**
   * ARIA current (for active links)
   */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  /**
   * Allowed roles (optional - if not provided, any authenticated user can access)
   */
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
}

/**
 * ProtectedLink Component
 * 
 * A Link component that checks authentication before navigating.
 * If user is not authenticated, redirects to /login with redirect parameter.
 * If user is authenticated, navigates to the intended route.
 * 
 * @example
 * ```tsx
 * <ProtectedLink to="/courses" className="nav-link">
 *   Courses
 * </ProtectedLink>
 * 
 * <ProtectedLink to="/admin" allowedRoles={['admin']}>
 *   Admin Dashboard
 * </ProtectedLink>
 * ```
 */
function ProtectedLink({
  to,
  children,
  className = '',
  onClick,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  allowedRoles,
}: ProtectedLinkProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  /**
   * Check if user is authenticated and has valid JWT token
   */
  const checkAuthentication = (): boolean => {
    // Wait for auth to finish loading
    if (isLoading) {
      return false;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      return false;
    }

    // Check JWT token in localStorage
    try {
      const stored = localStorage.getItem('planet-path-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed.token;
        
        // Validate JWT format (3 parts: header.payload.signature)
        if (token && typeof token === 'string') {
          const parts = token.split('.');
          if (parts.length !== 3) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }

    // Check role if allowedRoles specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return false;
      }
    }

    return true;
  };

  /**
   * Handle link click
   */
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e);
    }

    // Check authentication
    if (!checkAuthentication()) {
      // User is not authenticated - prevent default navigation and redirect to login
      e.preventDefault();
      e.stopPropagation();
      const redirectUrl = `/login?redirect=${encodeURIComponent(to)}`;
      navigate(redirectUrl);
    }
    // If authenticated, let Link component handle navigation normally
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}

export default ProtectedLink;

