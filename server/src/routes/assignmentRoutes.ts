import { Router } from 'express';
import {
  createAssignment,
  listAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment
 * @access  Private (instructor/admin only)
 */
router.post('/', authenticate, authorize('instructor', 'admin'), createAssignment);

/**
 * @route   GET /api/assignments/course/:courseId
 * @desc    List assignments by course
 * @access  Public
 */
router.get('/course/:courseId', listAssignmentsByCourse);

/**
 * @route   GET /api/assignments/:id
 * @desc    Get assignment by ID
 * @access  Public
 */
router.get('/:id', getAssignment);

/**
 * @route   PUT /api/assignments/:id
 * @desc    Update assignment
 * @access  Private (instructor/admin only)
 */
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateAssignment);

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete assignment
 * @access  Private (instructor/admin only)
 */
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteAssignment);

export default router;

