import { Router } from 'express';
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
router.post('/', authenticate, enrollInCourse);

/**
 * @route   GET /api/enrollments/user/:userId
 * @desc    Get user's enrollments
 * @access  Private
 */
router.get('/user/:userId', authenticate, getUserEnrollments);

/**
 * @route   GET /api/enrollments/course/:courseId
 * @desc    Get course enrollments (instructor/admin only)
 * @access  Private (instructor/admin)
 */
router.get(
  '/course/:courseId',
  authenticate,
  authorize('instructor', 'admin'),
  getCourseEnrollments
);

/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update enrollment progress
 * @access  Private
 */
router.put('/:id/progress', authenticate, updateEnrollmentProgress);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Drop enrollment
 * @access  Private
 */
router.delete('/:id', authenticate, dropEnrollment);

export default router;

