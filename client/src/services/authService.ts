import axiosInstance from './axiosInstance';

interface LoginResponse {
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
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
  };
  token: string;
}

interface UserResponse {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
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
   * Login with Google OAuth
   * @returns Promise with user and token
   */
  async loginWithGoogle(): Promise<LoginResponse> {
    try {
      // TODO: Implement Google OAuth flow
      // This would typically involve:
      // 1. Redirecting to Google OAuth
      // 2. Getting authorization code
      // 3. Exchanging code for token with backend
      // 4. Backend returns user and JWT token

      // For now, throw an error indicating it needs implementation
      throw new Error('Google OAuth login not yet implemented. Please use email/password login.');
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
   * @private
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const errorObj = new Error(message);
      (errorObj as any).status = error.response.status;
      (errorObj as any).data = error.response.data;
      return errorObj;
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return error;
    }
  }
}

export default new AuthService();

