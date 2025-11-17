import axiosInstance from './axiosInstance';

interface Course {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  level?: string;
  tags?: string[];
  price?: number;
  modules?: any[];
  [key: string]: any;
}

interface CoursesResponse {
  courses: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Enrollment {
  _id?: string;
  id?: string;
  userId: string;
  courseId: string;
  enrolledAt?: Date;
  [key: string]: any;
}

/**
 * CourseService - Handles all course-related API calls
 */
class CourseService {
  /**
   * Get all courses
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

