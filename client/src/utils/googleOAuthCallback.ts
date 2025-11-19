import { useAuthStore } from '@/store/useAuthStore';

/**
 * Google OAuth Callback Handler
 * 
 * Handles the callback from Google OAuth flow.
 * Backend redirects to frontend with JWT token in URL params or localStorage.
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
export function handleGoogleOAuthCallback() {
  try {
    // Check if we're returning from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
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
      let user;
      
      // Parse user data
      if (userParam) {
        try {
          user = JSON.parse(decodeURIComponent(userParam));
        } catch (e) {
          // If user param is not JSON, try to get from localStorage
          const stored = localStorage.getItem('planet-path-auth-storage');
          if (stored) {
            const parsed = JSON.parse(stored);
            user = parsed.user;
          }
        }
      }

      // If we have token and user, save to localStorage and update store
      if (token && user) {
        const authData = {
          token,
          user,
          role: user.role,
        };
        
        localStorage.setItem('planet-path-auth-storage', JSON.stringify(authData));
        
        // Update Zustand store
        const authStore = useAuthStore.getState();
        if (authStore && typeof authStore.loginWithUser === 'function') {
          authStore.loginWithUser(
            {
              id: user._id || user.id || '',
              name: user.name,
              email: user.email || '',
              role: user.role as 'student' | 'instructor' | 'admin',
              googleId: user.googleId,
              xp: user.xp,
              badges: user.badges,
            },
            token
          );
        }

        // Get redirect URL from query params or default to dashboard
        const redirect = urlParams.get('redirect') || '/dashboard';
        
        // Clean URL (remove OAuth params)
        const cleanUrl = window.location.pathname.split('?')[0];
        window.history.replaceState({}, '', cleanUrl);
        
        // Redirect to intended page
        window.location.href = redirect;
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

