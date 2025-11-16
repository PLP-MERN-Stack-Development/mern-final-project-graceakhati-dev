import { Router } from 'express';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByModule,
} from '../controllers/lessonController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson
 * @access  Private
 */
router.post('/', authenticate, createLesson);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update a lesson
 * @access  Private
 */
router.put('/:id', authenticate, updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Private
 */
router.delete('/:id', authenticate, deleteLesson);

/**
 * @route   GET /api/lessons/module/:moduleId
 * @desc    Get lessons by module ID
 * @access  Public
 */
router.get('/module/:moduleId', getLessonsByModule);

export default router;

