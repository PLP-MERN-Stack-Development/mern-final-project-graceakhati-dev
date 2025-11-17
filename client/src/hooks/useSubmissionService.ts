import { useState, useCallback } from 'react';
import submissionService from '@/services/submissionService';

interface Submission {
  _id?: string;
  id?: string;
  aiScore?: number;
  verified?: boolean;
  [key: string]: any;
}

interface SubmitProjectParams {
  courseId: string;
  image: File;
  geotag?: { lat: number; lng: number };
  description: string;
  assignmentId?: string;
}

/**
 * React hook for submission operations
 * @returns Submission service methods and state
 */
export function useSubmissionService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit a project/assignment
   */
  const submitProject = useCallback(async (params: SubmitProjectParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const submission = await submissionService.submitProject(params);
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
   * Get current user's submissions
   */
  const getMySubmissions = useCallback(async (courseId: string | null = null) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to get submissions by course if courseId provided
      if (courseId) {
        const submissions = await submissionService.getSubmissionsByCourse(courseId);
        return submissions;
      }
      
      // Otherwise use the service method (which may throw if endpoint doesn't exist)
      const submissions = await submissionService.getMySubmissions();
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
    submitProject,
    getMySubmissions,
    isLoading,
    error,
  };
}

