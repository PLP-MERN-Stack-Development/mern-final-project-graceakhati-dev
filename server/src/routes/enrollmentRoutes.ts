import { Router, RequestHandler } from 'express';
import {
  enrollInCourse,
  getUserEnrollments,
  getCourseEnrollments,
  updateEnrollmentProgress,
  dropEnrollment,
} from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/enrollments
 * @desc    Enroll user in a course
 * @access  Private
 */
router.post('/', authenticate as RequestHandler, enrollInCourse as RequestHandler);

/**
 * @route   GET /api/enrollments/user/:userId
 * @desc    Get user's enrollments
 * @access  Private
 */
router.get('/user/:userId', authenticate as RequestHandler, getUserEnrollments as RequestHandler);

/**
 * @route   GET /api/enrollments/course/:courseId
 * @desc    Get course enrollments (instructor/admin only)
 * @access  Private (instructor/admin)
 */
router.get(
  '/course/:courseId',
  authenticate as RequestHandler,
  authorize('instructor', 'admin') as RequestHandler,
  getCourseEnrollments as RequestHandler
);

/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update enrollment progress
 * @access  Private
 */
router.put('/:id/progress', authenticate as RequestHandler, updateEnrollmentProgress as RequestHandler);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Drop enrollment
 * @access  Private
 */
router.delete('/:id', authenticate as RequestHandler, dropEnrollment as RequestHandler);

export default router;

