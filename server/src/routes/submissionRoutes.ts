import { Router, RequestHandler } from 'express';
import {
  submitAssignment,
  listSubmissionsByAssignment,
  gradeSubmission,
  getSubmissionById,
} from '../controllers/submissionController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadFilesAndImage, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/submissions
 * @desc    Submit an assignment (multipart/form-data)
 * @access  Private
 */
router.post(
  '/',
  authenticate as RequestHandler,
  uploadFilesAndImage as any, // Multer middleware type compatibility
  handleUploadError as any, // Error handler middleware type compatibility
  submitAssignment as any // UploadRequest type compatibility
);

/**
 * @route   GET /api/submissions/assignment/:assignmentId
 * @desc    List submissions by assignment
 * @access  Private (instructor/admin only)
 */
router.get(
  '/assignment/:assignmentId',
  authenticate as RequestHandler,
  authorize('instructor', 'admin') as RequestHandler,
  listSubmissionsByAssignment as RequestHandler
);

/**
 * @route   PUT /api/submissions/:id/grade
 * @desc    Grade a submission
 * @access  Private (instructor/admin only)
 */
router.put('/:id/grade', authenticate as RequestHandler, authorize('instructor', 'admin') as RequestHandler, gradeSubmission as RequestHandler);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get('/:id', authenticate as RequestHandler, getSubmissionById as RequestHandler);

export default router;

