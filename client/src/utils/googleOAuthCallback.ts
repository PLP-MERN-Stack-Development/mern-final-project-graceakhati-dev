import { useAuthStore } from '@/store/useAuthStore';
import authService from '@/services/authService';

/**
 * Google OAuth Callback Handler
 * 
 * Handles the callback from Google OAuth flow.
 * Backend redirects to frontend with JWT token in URL params.
 * 
 * This function should be called on app initialization or when handling OAuth callback.
 * 
 * @example
 * ```tsx
 * // In App.tsx or main.tsx
 * useEffect(() => {
 *   handleGoogleOAuthCallback();
 * }, []);
 * ```
 */
export async function handleGoogleOAuthCallback(): Promise<void> {
  try {
    // Check if we're returning from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('Google OAuth error:', error);
      // Redirect to login with error message
      window.location.href = `/login?error=${encodeURIComponent(error)}`;
      return;
    }

    // Handle successful OAuth callback
    if (token) {
      try {
        // Validate token format
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        // Decode JWT token to get basic user info (without verification)
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.userId;
        const email = payload.email;
        const role = payload.role;

        if (!userId || !email || !role) {
          throw new Error('Invalid token payload');
        }

        // Save token to localStorage temporarily
        const tempAuthData = {
          token,
          user: {
            id: userId,
            _id: userId,
            email: email,
            role: role,
            name: email.split('@')[0], // Temporary name
          },
          isAuthenticated: true,
          role: role,
        };
        
        localStorage.setItem('planet-path-auth-storage', JSON.stringify(tempAuthData));
        
        // Update Zustand store with temporary data
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(
            {
              id: userId,
              name: email.split('@')[0],
              email: email,
              role: role as 'student' | 'instructor' | 'admin',
              googleId: undefined,
              xp: 0,
              badges: [],
            },
            token
          );
        }

        // Fetch full user data from backend
        try {
          const fullUser = await authService.getCurrentUser();
          
          // Update with full user data
          const authData = {
            token,
            user: {
              id: fullUser._id || fullUser.id || userId,
              _id: fullUser._id || fullUser.id || userId,
              name: fullUser.name,
              email: fullUser.email || email,
              role: fullUser.role || role,
              googleId: fullUser.googleId,
              xp: fullUser.xp || 0,
              badges: fullUser.badges || [],
            },
            isAuthenticated: true,
            role: fullUser.role || role,
          };
          
          localStorage.setItem('planet-path-auth-storage', JSON.stringify(authData));
          
          // Update Zustand store with full user data
          if (authStore && typeof authStore.loginWithUser === 'function') {
            authStore.loginWithUser(
              {
                id: fullUser._id || fullUser.id || userId,
                name: fullUser.name,
                email: fullUser.email || email,
                role: (fullUser.role as 'student' | 'instructor' | 'admin') || role,
                googleId: fullUser.googleId,
                xp: fullUser.xp || 0,
                badges: fullUser.badges || [],
              },
              token
            );
          }
        } catch (fetchError) {
          // If fetching user fails, use token payload data
          console.warn('Failed to fetch full user data, using token payload:', fetchError);
        }

        // Get redirect URL from query params or default based on role
        const redirectParam = urlParams.get('redirect');
        let redirect = redirectParam;
        
        if (!redirect) {
          // Redirect based on role
          switch (role) {
            case 'student':
              redirect = '/student/dashboard';
              break;
            case 'instructor':
              redirect = '/instructor/dashboard';
              break;
            case 'admin':
              redirect = '/admin/dashboard';
              break;
            default:
              redirect = '/student/dashboard';
          }
        }
        
        // Clean URL (remove OAuth params)
        const cleanUrl = window.location.pathname.split('?')[0];
        window.history.replaceState({}, '', cleanUrl);
        
        // Redirect to intended page
        window.location.href = redirect;
      } catch (error) {
        console.error('Error processing OAuth token:', error);
        window.location.href = '/login?error=oauth_processing_failed';
      }
    }
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    // Redirect to login on error
    window.location.href = '/login?error=oauth_failed';
  }
}

/**
 * Check if current URL is a Google OAuth callback
 */
export function isGoogleOAuthCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('token') || urlParams.has('error');
}
