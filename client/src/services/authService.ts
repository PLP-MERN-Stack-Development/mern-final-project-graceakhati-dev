import axiosInstance from './axiosInstance';

interface LoginResponse {
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
    googleId?: string;
    xp?: number;
    badges?: string[];
  };
  token: string;
}

interface SignupResponse {
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
    googleId?: string;
    xp?: number;
    badges?: string[];
  };
  token: string;
}

interface UserResponse {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  googleId?: string;
  xp?: number;
  badges?: string[];
}

/**
 * AuthService - Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise with user and token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<{
        success: boolean;
        data?: LoginResponse;
        message?: string;
      }>('/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        return {
          user: response.data.data.user,
          token: response.data.data.token,
        };
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign up a new user
   * @param name - User full name
   * @param email - User email
   * @param password - User password
   * @param role - User role (optional, defaults to 'student')
   * @returns Promise with user and token
   */
  async signup(name: string, email: string, password: string, role: string = 'student'): Promise<SignupResponse> {
    try {
      const response = await axiosInstance.post<{
        success: boolean;
        data?: SignupResponse;
        message?: string;
      }>('/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.data.success && response.data.data) {
        return {
          user: response.data.data.user,
          token: response.data.data.token,
        };
      }

      throw new Error(response.data.message || 'Signup failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new user (alias for signup)
   * @param name - User full name
   * @param email - User email
   * @param password - User password
   * @param role - User role (optional, defaults to 'student')
   * @returns Promise with user and token
   */
  async register(name: string, email: string, password: string, role: string = 'student'): Promise<SignupResponse> {
    return this.signup(name, email, password, role);
  }

  /**
   * Login with Google OAuth (stub endpoint)
   * Calls /auth/google endpoint via Axios
   * @returns Promise with user and token
   */
  async loginWithGoogle(): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<{
        success: boolean;
        data?: LoginResponse;
        message?: string;
      }>('/auth/google');

      if (response.data.success && response.data.data) {
        return {
          user: response.data.data.user,
          token: response.data.data.token,
        };
      }

      throw new Error(response.data.message || 'Google login failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current authenticated user
   * @returns Promise with user object
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await axiosInstance.get<{
        success: boolean;
        data?: {
          user?: UserResponse;
        } | UserResponse;
        message?: string;
      }>('/auth/me');

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        return data.user || data;
      }

      throw new Error(response.data.message || 'Failed to get current user');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * FIX: Better error messages for different error types
   * @private
   */
  private handleError(error: any): Error {
    // Network errors (no response received)
    if (error.isNetworkError || (!error.response && error.request)) {
      const networkMessage = error.message || 'Network error. Please check your internet connection and try again.';
      const networkError = new Error(networkMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).code = error.code || 'NETWORK_ERROR';
      return networkError;
    }

    // Server responded with error status
    if (error.response) {
      const status = error.response.status;
      let message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      // Provide user-friendly messages for common errors
      if (status === 400) {
        message = error.response.data?.message || 'Invalid request. Please check your input.';
      } else if (status === 401) {
        message = error.response.data?.message || 'Authentication failed. Please check your credentials.';
      } else if (status === 403) {
        message = error.response.data?.message || 'Access denied. You do not have permission.';
      } else if (status === 404) {
        message = error.response.data?.message || 'Resource not found.';
      } else if (status === 409) {
        message = error.response.data?.message || 'User already exists. Please log in instead.';
      } else if (status >= 500) {
        message = error.response.data?.message || 'Server error. Please try again later.';
      }
      
      const errorObj = new Error(message);
      (errorObj as any).status = status;
      (errorObj as any).data = error.response.data;
      return errorObj;
    }

    // Something else happened (e.g., AUTH_REQUIRED from interceptor)
    if (error.code === 'AUTH_REQUIRED') {
      return new Error('Authentication required. Please log in.');
    }

    // Return the error as-is if it's already an Error object
    if (error instanceof Error) {
      return error;
    }

    // Fallback: create a generic error
    return new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
}

export default new AuthService();

