import { ReactNode, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export interface ProtectedButtonProps {
  /**
   * Path to navigate to when authenticated
   */
  to: string;
  /**
   * Button content (children)
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button type (default: 'button')
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Click handler (called after navigation if authenticated)
   */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
  /**
   * ARIA label
   */
  'aria-label'?: string;
  /**
   * Allowed roles (optional - if not provided, any authenticated user can access)
   */
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
}

/**
 * ProtectedButton Component
 * 
 * A button that checks authentication before navigating.
 * If user is not authenticated, redirects to /login with redirect parameter.
 * If user is authenticated, navigates to the intended route.
 * 
 * @example
 * ```tsx
 * <ProtectedButton to="/courses" className="btn-primary">
 *   View Courses
 * </ProtectedButton>
 * 
 * <ProtectedButton to="/admin" allowedRoles={['admin']}>
 *   Admin Dashboard
 * </ProtectedButton>
 * ```
 */
function ProtectedButton({
  to,
  children,
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  'data-testid': testId,
  'aria-label': ariaLabel,
  allowedRoles,
}: ProtectedButtonProps) {
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
   * Handle button click
   */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e);
    }

    // Check authentication
    if (checkAuthentication()) {
      // User is authenticated - navigate to intended route
      navigate(to);
    } else {
      // User is not authenticated - redirect to login with redirect parameter
      const redirectUrl = `/login?redirect=${encodeURIComponent(to)}`;
      navigate(redirectUrl);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default ProtectedButton;

