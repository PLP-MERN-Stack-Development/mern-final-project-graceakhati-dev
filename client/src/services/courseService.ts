import axiosInstance from './axiosInstance';

/**
 * Course Interface matching backend ICourse model
 */
export interface Course {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  description: string;
  authorId?: string | { _id: string; name: string };
  modules?: Array<{ _id: string; title: string }> | string[];
  tags?: string[];
  price: number;
  impact_type?: 'climate' | 'waste' | 'energy' | 'water' | 'community' | 'other';
  status?: 'draft' | 'published' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

/**
 * Courses Response Interface
 */
export interface CoursesResponse {
  courses: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Enrollment Interface matching backend IEnrollment model
 */
export interface Enrollment {
  _id?: string;
  id?: string;
  userId: string | { _id: string; name: string; email: string };
  courseId: string | { _id: string; title: string };
  enrolledAt?: Date;
  progress?: number;
  completedAt?: Date;
  [key: string]: any;
}

/**
 * CourseService - Handles all course-related API calls
 */
class CourseService {
  /**
   * Get all courses
   * GET /api/courses
   * @param params - Query parameters (status, impact_type, tags, page, limit, sort)
   * @returns Promise with courses and pagination
   */
  async getCourses(params: Record<string, any> = {}): Promise<CoursesResponse> {
    try {
      const response = await axiosInstance.get<{
        success: boolean;
        data?: CoursesResponse | Course[];
        message?: string;
      }>('/courses', {
        params: {
          status: 'published', // Default to published courses
          ...params,
        },
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        return {
          courses: Array.isArray(data) ? data : data.courses || [],
          pagination: data.pagination || {},
        };
      }

      throw new Error(response.data.message || 'Failed to fetch courses');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single course by ID or slug
   * GET /api/courses/:id
   * @param id - Course ID or slug
   * @returns Promise with course object
   */
  async getCourse(id: string): Promise<Course> {
    try {
      const response = await axiosInstance.get<{
        success: boolean;
        data?: {
          course?: Course;
        } | Course;
        message?: string;
      }>(`/courses/${id}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        return data.course || data;
      }

      throw new Error(response.data.message || 'Failed to fetch course');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Enroll in a course
   * POST /api/enrollments
   * @param courseId - Course ID to enroll in
   * @returns Promise with enrollment object
   */
  async enroll(courseId: string): Promise<Enrollment> {
    try {
      const response = await axiosInstance.post<{
        success: boolean;
        data?: {
          enrollment?: Enrollment;
        } | Enrollment;
        message?: string;
      }>('/enrollments', {
        courseId,
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        return data.enrollment || data;
      }

      throw new Error(response.data.message || 'Failed to enroll in course');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is enrolled in a course
   * GET /api/enrollments/user/:userId
   * @param courseId - Course ID to check
   * @returns Promise with boolean indicating enrollment status
   */
  async checkEnrollment(courseId: string): Promise<boolean> {
    try {
      // Get auth from localStorage
      const stored = localStorage.getItem('planet-path-auth-storage');
      if (!stored) {
        return false;
      }

      const parsed = JSON.parse(stored);
      const userId = parsed.user?.id;

      if (!userId) {
        return false;
      }

      const response = await axiosInstance.get<{
        success: boolean;
        data?: {
          enrollments?: Enrollment[];
        } | Enrollment[];
        message?: string;
      }>(`/enrollments/user/${userId}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        const enrollments = Array.isArray(data) ? data : data.enrollments || [];
        
        // Check if any enrollment matches the courseId
        return enrollments.some((enrollment: Enrollment) => {
          const enrollmentCourseId = 
            typeof enrollment.courseId === 'string' 
              ? enrollment.courseId 
              : (enrollment.courseId as any)?._id || (enrollment.courseId as any)?.id;
          return enrollmentCourseId === courseId;
        });
      }

      return false;
    } catch (error: any) {
      // If endpoint doesn't exist or user not found, return false
      return false;
    }
  }

  /**
   * Handle API errors
   * @private
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const errorObj = new Error(message);
      (errorObj as any).status = error.response.status;
      (errorObj as any).data = error.response.data;
      return errorObj;
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }
}

export default new CourseService();
