import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import authService from './authService';
import type { AxiosInstance } from 'axios';

// Mock axiosInstance
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('./axiosInstance', () => ({
  default: {
    post: mockPost,
    get: mockGet,
  } as Partial<AxiosInstance>,
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://localhost:5000/api',
}));

const mockAxios = {
  post: mockPost as MockedFunction<typeof mockPost>,
  get: mockGet as MockedFunction<typeof mockGet>,
};

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'user123',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'student',
            },
            token: 'mock-jwt-token',
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login('john@example.com', 'password123');

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockResponse.data.data.user);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw error when login fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await expect(authService.login('john@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (mockAxios.post as any).mockRejectedValue({
        request: {},
      });

      await expect(authService.login('john@example.com', 'password')).rejects.toThrow(
        'Network error. Please check your connection.'
      );
    });

    it('should handle server errors with status code', async () => {
      const error = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      mockAxios.post.mockRejectedValue(error);

      await expect(authService.login('john@example.com', 'password')).rejects.toThrow('Unauthorized');
    });
  });

  describe('signup', () => {
    it('should successfully signup a new user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'user456',
              name: 'Jane Doe',
              email: 'jane@example.com',
              role: 'student',
            },
            token: 'mock-jwt-token',
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      const result = await authService.signup('Jane Doe', 'jane@example.com', 'password123');

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'student',
      });
      expect(result.user).toEqual(mockResponse.data.data.user);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should signup with custom role', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'user789',
              name: 'Instructor',
              email: 'instructor@example.com',
              role: 'instructor',
            },
            token: 'mock-jwt-token',
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await authService.signup('Instructor', 'instructor@example.com', 'password', 'instructor');

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Instructor',
        email: 'instructor@example.com',
        password: 'password',
        role: 'instructor',
      });
    });

    it('should throw error when signup fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Email already exists',
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await expect(authService.signup('Jane', 'jane@example.com', 'password')).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('register', () => {
    it('should call signup method', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: 'user1', name: 'Test', email: 'test@example.com', role: 'student' },
            token: 'token',
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await authService.register('Test', 'test@example.com', 'password');

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        role: 'student',
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('should successfully login with Google', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'google-user',
              name: 'Google User',
              email: 'google@example.com',
              role: 'student',
            },
            token: 'google-token',
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle();

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/google/stub');
      expect(result.user).toEqual(mockResponse.data.data.user);
      expect(result.token).toBe('google-token');
    });

    it('should throw error when Google login fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Google authentication failed',
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await expect(authService.loginWithGoogle()).rejects.toThrow('Google authentication failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully get current user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'user123',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'student',
            },
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data.data.user);
    });

    it('should handle response with user directly in data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error when getCurrentUser fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Unauthorized',
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });
});
