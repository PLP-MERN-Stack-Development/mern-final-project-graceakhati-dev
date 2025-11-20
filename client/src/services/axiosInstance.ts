import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Axios instance with base URL from environment variables
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if user is authenticated by verifying JWT token in localStorage
 * This prevents API calls from unauthenticated users
 */
const isAuthenticated = (): boolean => {
  try {
    const stored = localStorage.getItem('planet-path-auth-storage');
    if (!stored) return false;
    
    const parsed = JSON.parse(stored);
    const token = parsed.token;
    
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT validation - check if token has 3 parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Request interceptor - Block unauthenticated API calls and add auth token
 * SECURITY: Prevents API calls from unauthenticated users
 * FIX: Properly handle public endpoints and network errors
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Check authentication before making any API call
    // Exception: Allow auth endpoints (login, signup, google) without token
    // FIX: Use exact URL matching instead of includes() to avoid false positives
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/google'];
    const requestUrl = config.url || '';
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      // Match exact endpoint or endpoint with query params
      return requestUrl === endpoint || requestUrl.startsWith(endpoint + '?') || requestUrl.startsWith(endpoint + '/');
    });
    
    // Allow public endpoints without authentication check
    if (isPublicEndpoint) {
      // Don't add Authorization header for public endpoints
      return config;
    }
    
    // For protected endpoints, check authentication
    if (!isAuthenticated()) {
      // Block the request and redirect to login
      const error = new Error('Authentication required');
      (error as any).code = 'AUTH_REQUIRED';
      (error as any).redirect = '/login';
      
      // Clear any stale auth state
      useAuthStore.getState().logout();
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      
      return Promise.reject(error);
    }
    
    // Add auth token to authenticated requests
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 * FIX: Better error handling for network errors and 401 responses
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors (no response received)
    if (!error.response) {
      // Network error - server unreachable or CORS issue
      const networkError = new Error(
        error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check your connection.'
          : 'Network error. Please check your internet connection and try again.'
      );
      (networkError as any).isNetworkError = true;
      (networkError as any).code = error.code || 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - clear auth and redirect to login
    if (error.response?.status === 401) {
      // Don't logout if we're already on login/signup page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        useAuthStore.getState().logout();
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }

    // Return error for component handling
    return Promise.reject(error);
  }
);

export default axiosInstance;

