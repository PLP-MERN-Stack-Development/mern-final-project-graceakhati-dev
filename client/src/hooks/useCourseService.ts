import { useState, useCallback } from 'react';
import courseService from '@/services/courseService';

/**
 * React hook for course operations
 * @returns Course service methods and state
 */
export function useCourseService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all courses
   */
  const getCourses = useCallback(async (params: Record<string, any> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await courseService.getCourses(params);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch courses';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a single course by ID
   */
  const getCourse = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const course = await courseService.getCourse(id);
      return course;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch course';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Enroll in a course
   */
  const enroll = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const enrollment = await courseService.enroll(courseId);
      return enrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enroll in course';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCourses,
    getCourse,
    enroll,
    isLoading,
    error,
  };
}

