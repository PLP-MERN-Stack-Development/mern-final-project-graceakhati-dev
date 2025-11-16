import { Router } from 'express';
import {
  submitAssignment,
  listSubmissionsByAssignment,
  gradeSubmission,
  getSubmissionById,
} from '../controllers/submissionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/submissions
 * @desc    Submit an assignment
 * @access  Private
 */
router.post('/', authenticate, submitAssignment);

/**
 * @route   GET /api/submissions/assignment/:assignmentId
 * @desc    List submissions by assignment
 * @access  Private (instructor/admin only)
 */
router.get(
  '/assignment/:assignmentId',
  authenticate,
  authorize('instructor', 'admin'),
  listSubmissionsByAssignment
);

/**
 * @route   PUT /api/submissions/:id/grade
 * @desc    Grade a submission
 * @access  Private (instructor/admin only)
 */
router.put('/:id/grade', authenticate, authorize('instructor', 'admin'), gradeSubmission);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get('/:id', authenticate, getSubmissionById);

export default router;

