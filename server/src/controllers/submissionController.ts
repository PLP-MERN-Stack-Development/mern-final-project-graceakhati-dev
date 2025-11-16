import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Submission from '../models/Submission';
import Assignment from '../models/Assignment';

/**
 * Submit an assignment
 * POST /api/submissions
 * Supports multipart/form-data for file uploads
 */
export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const {
      assignmentId,
      courseId,
      files,
      metadata,
    } = req.body as {
      assignmentId: string;
      courseId: string;
      files?: string[];
      metadata?: {
        geotag?: { lat: number; lng: number };
        notes?: string;
      };
    };

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      userId: req.user._id,
    });

    if (existingSubmission) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
      return;
    }

    const submission = new Submission({
      assignmentId,
      courseId,
      userId: req.user._id,
      files: files || [],
      metadata: metadata || {},
      status: 'submitted',
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assignment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * List submissions by assignment
 * GET /api/submissions/assignment/:assignmentId
 * Protected: instructor/admin only
 */
export const listSubmissionsByAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { assignmentId } = req.params as { assignmentId: string };

    const submissions = await Submission.find({ assignmentId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        submissions,
        count: submissions.length,
      },
    });
  } catch (error) {
    console.error('List submissions by assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submissions',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Grade a submission
 * PUT /api/submissions/:id/grade
 * Protected: instructor/admin only
 */
export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { score, feedback, status } = req.body as {
      score: number;
      feedback?: string;
      status?: 'graded' | 'rejected';
    };

    const submission = await Submission.findById(id);
    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
      return;
    }

    // Get assignment to validate score
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment && score > assignment.maxScore) {
      res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${assignment.maxScore}`,
      });
      return;
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = status || 'graded';

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error grading submission',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get submission by ID
 * GET /api/submissions/:id
 */
export const getSubmissionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const submission = await Submission.findById(id)
      .populate('assignmentId')
      .populate('userId', 'name email')
      .populate('courseId', 'title slug');

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
      return;
    }

    // Students can only view their own submissions
    // Instructors/admins can view all
    const userId = req.user._id?.toString();
    const submissionUserId = submission.userId.toString();
    const isOwner = userId === submissionUserId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isOwner && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submission',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

