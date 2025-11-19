import { useState, useCallback } from 'react';
import courseService, { Course } from '@/services/courseService';
import submissionService from '@/services/submissionService';

/**
 * useCourses Hook
 * 
 * Comprehensive React hook for course operations including:
 * - Fetching course list
 * - Getting single course details
 * - Enrolling in courses
 * - Submitting projects
 * - Checking enrollment status
 * 
 * @example
 * ```tsx
 * const { courses, isLoading, error, getCourses, enroll, submitProject } = useCourses();
 * 
 * useEffect(() => {
 *   getCourses();
 * }, []);
 * 
 * const handleEnroll = async (courseId: string) => {
 *   try {
 *     await enroll(courseId);
 *     // Enrollment successful
 *   } catch (err) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});

  /**
   * Get all courses
   */
  const getCourses = useCallback(async (params: Record<string, any> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await courseService.getCourses(params);
      setCourses(result.courses || []);
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
      setCurrentCourse(course);
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
      // Update enrollment status
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: true }));
      return enrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enroll in course';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check enrollment status for a course
   */
  const checkEnrollment = useCallback(async (courseId: string) => {
    try {
      const isEnrolled = await courseService.checkEnrollment(courseId);
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: isEnrolled }));
      return isEnrolled;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check enrollment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Submit a project for a course
   */
  const submitProject = useCallback(async (
    courseId: string,
    assignmentId: string,
    projectData: {
      description: string;
      image: File; // Required, not optional
      location?: { latitude: number; longitude: number };
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert location format from {latitude, longitude} to {lat, lng}
      const geotag = projectData.location 
        ? { lat: projectData.location.latitude, lng: projectData.location.longitude }
        : undefined;
      
      const submission = await submissionService.submitProject({
        courseId,
        assignmentId,
        description: projectData.description,
        image: projectData.image, // Now guaranteed to be File, not undefined
        geotag,
      });
      return submission;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get submissions for a course
   */
  const getSubmissions = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const submissions = await submissionService.getSubmissionsByCourse(courseId);
      return submissions;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch submissions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    currentCourse,
    isLoading,
    error,
    enrollmentStatus,
    getCourses,
    getCourse,
    enroll,
    checkEnrollment,
    submitProject,
    getSubmissions,
    setError, // Allow manual error clearing
  };
}

export default useCourses;

