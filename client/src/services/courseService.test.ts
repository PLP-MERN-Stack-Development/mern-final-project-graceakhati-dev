import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import courseService from './courseService';
import type { AxiosInstance } from 'axios';

// Mock axiosInstance
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('./axiosInstance', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  } as Partial<AxiosInstance>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockAxios = {
  get: mockGet as MockedFunction<typeof mockGet>,
  post: mockPost as MockedFunction<typeof mockPost>,
};

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCourses', () => {
    it('should successfully fetch courses', async () => {
      const mockCourses = [
        {
          _id: 'course1',
          title: 'Climate Basics',
          description: 'Learn about climate change',
          price: 0,
        },
        {
          _id: 'course2',
          title: 'Renewable Energy',
          description: 'Solar and wind energy',
          price: 1000,
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            courses: mockCourses,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              pages: 1,
            },
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourses();

      expect(mockAxios.get).toHaveBeenCalledWith('/courses', {
        params: {
          status: 'published',
        },
      });
      expect(result.courses).toEqual(mockCourses);
      expect(result.pagination).toBeDefined();
    });

    it('should handle array response format', async () => {
      const mockCourses = [
        { _id: 'course1', title: 'Course 1', description: 'Desc 1', price: 0 },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockCourses,
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourses();

      expect(result.courses).toEqual(mockCourses);
    });

    it('should pass query parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { courses: [], pagination: {} },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      await courseService.getCourses({ impact_type: 'climate', page: 2 });

      expect(mockAxios.get).toHaveBeenCalledWith('/courses', {
        params: {
          status: 'published',
          impact_type: 'climate',
          page: 2,
        },
      });
    });

    it('should throw error when fetch fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Failed to fetch courses',
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      await expect(courseService.getCourses()).rejects.toThrow('Failed to fetch courses');
    });

    it('should handle network errors', async () => {
      (mockAxios.get as any).mockRejectedValue({
        request: {},
      });

      await expect(courseService.getCourses()).rejects.toThrow(
        'Network error. Please check your connection.'
      );
    });
  });

  describe('getCourse', () => {
    it('should successfully fetch a single course', async () => {
      const mockCourse = {
        _id: 'course1',
        title: 'Climate Basics',
        description: 'Learn about climate change',
        price: 0,
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            course: mockCourse,
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourse('course1');

      expect(mockAxios.get).toHaveBeenCalledWith('/courses/course1');
      expect(result).toEqual(mockCourse);
    });

    it('should handle direct course data in response', async () => {
      const mockCourse = {
        _id: 'course1',
        title: 'Course 1',
        description: 'Desc',
        price: 0,
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockCourse,
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourse('course1');

      expect(result).toEqual(mockCourse);
    });

    it('should throw error when course not found', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Course not found',
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      await expect(courseService.getCourse('invalid')).rejects.toThrow('Course not found');
    });
  });

  describe('enroll', () => {
    it('should successfully enroll in a course', async () => {
      const mockEnrollment = {
        _id: 'enrollment1',
        userId: 'user1',
        courseId: 'course1',
        enrolledAt: new Date(),
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            enrollment: mockEnrollment,
          },
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      const result = await courseService.enroll('course1');

      expect(mockAxios.post).toHaveBeenCalledWith('/enrollments', {
        courseId: 'course1',
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should handle direct enrollment data in response', async () => {
      const mockEnrollment = {
        _id: 'enrollment1',
        userId: 'user1',
        courseId: 'course1',
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockEnrollment,
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      const result = await courseService.enroll('course1');

      expect(result).toEqual(mockEnrollment);
    });

    it('should throw error when enrollment fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Already enrolled',
        },
      };

      (mockAxios.post as any).mockResolvedValue(mockResponse);

      await expect(courseService.enroll('course1')).rejects.toThrow('Already enrolled');
    });
  });

  describe('checkEnrollment', () => {
    it('should return true if user is enrolled', async () => {
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: { id: 'user1', name: 'Test', role: 'student' },
          token: 'token',
        })
      );

      const mockEnrollments = [
        {
          _id: 'enrollment1',
          userId: 'user1',
          courseId: 'course1',
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            enrollments: mockEnrollments,
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.checkEnrollment('course1');

      expect(mockAxios.get).toHaveBeenCalledWith('/enrollments/user/user1');
      expect(result).toBe(true);
    });

    it('should return false if user is not enrolled', async () => {
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: { id: 'user1', name: 'Test', role: 'student' },
          token: 'token',
        })
      );

      const mockResponse = {
        data: {
          success: true,
          data: {
            enrollments: [],
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.checkEnrollment('course1');

      expect(result).toBe(false);
    });

    it('should return false if no localStorage auth', async () => {
      localStorage.clear();

      const result = await courseService.checkEnrollment('course1');

      expect(result).toBe(false);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should return false if API call fails', async () => {
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: { id: 'user1', name: 'Test', role: 'student' },
          token: 'token',
        })
      );

      (mockAxios.get as any).mockRejectedValue(new Error('API Error'));

      const result = await courseService.checkEnrollment('course1');

      expect(result).toBe(false);
    });

    it('should handle enrollment with courseId as object', async () => {
      localStorage.setItem(
        'planet-path-auth-storage',
        JSON.stringify({
          user: { id: 'user1', name: 'Test', role: 'student' },
          token: 'token',
        })
      );

      const mockEnrollments = [
        {
          _id: 'enrollment1',
          userId: 'user1',
          courseId: { _id: 'course1', title: 'Course 1' },
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            enrollments: mockEnrollments,
          },
        },
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.checkEnrollment('course1');

      expect(result).toBe(true);
    });
  });
});
