import axiosInstance from './axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Submission Interface matching backend ISubmission model
 */
export interface Submission {
  _id?: string;
  id?: string;
  assignmentId: string | { _id: string; title: string };
  courseId: string | { _id: string; title: string };
  userId: string | { _id: string; name: string; email: string };
  files: string[];
  metadata?: {
    geotag?: { lat: number; lng: number };
    notes?: string;
  };
  score?: number | null;
  feedback?: string;
  status?: 'submitted' | 'graded' | 'rejected';
  aiScore?: number;
  verified?: boolean;
  verifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

/**
 * Submit Project Parameters
 */
export interface SubmitProjectParams {
  courseId: string;
  image: File;
  geotag?: { lat: number; lng: number };
  description: string;
  assignmentId?: string;
}

/**
 * SubmissionService - Handles all submission-related API calls
 */
class SubmissionService {
  /**
   * Submit a project/assignment
   * POST /api/submissions (multipart/form-data)
   * @param submissionData - Submission data
   * @returns Promise with submission object
   */
  async submitProject({
    courseId,
    image,
    geotag,
    description,
    assignmentId,
  }: SubmitProjectParams): Promise<Submission> {
    try {
      let finalAssignmentId = assignmentId;

      // If assignmentId not provided, try to get the first assignment for the course
      if (!finalAssignmentId && courseId) {
        try {
          const assignmentsResponse = await axiosInstance.get<{
            success: boolean;
            data?: {
              assignments?: Array<{ _id?: string; id?: string }>;
            } | Array<{ _id?: string; id?: string }>;
          }>(`/assignments/course/${courseId}`);
          
          if (assignmentsResponse.data.success) {
            const data = assignmentsResponse.data.data as any;
            const assignments = Array.isArray(data) ? data : data.assignments || [];
            if (assignments.length > 0) {
              finalAssignmentId = assignments[0]._id || assignments[0].id;
            } else {
              throw new Error('No assignments found for this course. Please contact the instructor.');
            }
          }
        } catch (err: any) {
          throw new Error('Could not find assignment for this course. Please provide an assignmentId or contact support.');
        }
      }

      if (!finalAssignmentId) {
        throw new Error('Assignment ID is required. Please provide an assignmentId.');
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData();

      // Add required fields
      if (courseId) {
        formData.append('courseId', courseId);
      }
      formData.append('assignmentId', finalAssignmentId);

      // Add image file if provided
      if (image) {
        formData.append('files', image);
      }

      // Add metadata as JSON string
      const metadata: Record<string, any> = {};
      if (geotag) {
        metadata.geotag = geotag;
      }
      if (description) {
        metadata.notes = description;
      }

      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axiosInstance.post<{
        success: boolean;
        data?: {
          submission?: Submission;
        } | Submission;
        message?: string;
      }>('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as any;
        return data.submission || data;
      }

      throw new Error(response.data.message || 'Failed to submit project');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's submissions
   * GET /api/submissions/assignment/:assignmentId (filtered by user)
   * @param courseId - Course ID to filter submissions
   * @returns Promise with array of submissions
   */
  async getMySubmissions(courseId: string | null = null): Promise<Submission[]> {
    try {
      // Try to get submissions by course if courseId provided
      if (courseId) {
        const submissions = await this.getSubmissionsByCourse(courseId);
        return submissions;
      }
      
      // Otherwise use the service method (which may throw if endpoint doesn't exist)
      throw new Error('Please provide courseId or implement GET /api/submissions/user/:userId endpoint');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submissions for a specific course (helper method)
   * @param courseId - Course ID
   * @returns Promise with array of submissions
   */
  async getSubmissionsByCourse(courseId: string): Promise<Submission[]> {
    try {
      // Get assignments for the course
      const assignmentsResponse = await axiosInstance.get<{
        success: boolean;
        data?: {
          assignments?: Array<{ _id?: string; id?: string }>;
        } | Array<{ _id?: string; id?: string }>;
      }>(`/assignments/course/${courseId}`);
      
      if (!assignmentsResponse.data.success) {
        throw new Error('Failed to fetch assignments');
      }

      const data = assignmentsResponse.data.data as any;
      const assignments = Array.isArray(data) ? data : data.assignments || [];
      
      // Get submissions for each assignment
      const allSubmissions: Submission[] = [];
      
      for (const assignment of assignments) {
        try {
          const submissionsResponse = await axiosInstance.get<{
            success: boolean;
            data?: {
              submissions?: Submission[];
            } | Submission[];
          }>(`/submissions/assignment/${assignment._id || assignment.id}`);
          
          if (submissionsResponse.data.success) {
            const subData = submissionsResponse.data.data as any;
            const submissions = Array.isArray(subData) ? subData : subData.submissions || [];
            // Filter to only current user's submissions
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
              const userId = currentUser.id;
              const userSubmissions = submissions.filter((sub: Submission) => {
                const subUserId = 
                  typeof sub.userId === 'string'
                    ? sub.userId
                    : (sub.userId as any)?._id || (sub.userId as any)?.id || sub.userId;
                return subUserId && subUserId.toString() === userId.toString();
              });
              allSubmissions.push(...userSubmissions);
            }
          }
        } catch (err) {
          // Skip if no permission or assignment has no submissions - silently fail
        }
      }

      return allSubmissions;
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

export default new SubmissionService();
