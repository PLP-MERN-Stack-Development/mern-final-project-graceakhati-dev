import { Router, RequestHandler } from 'express';
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
router.post('/', authenticate as RequestHandler, createLesson as RequestHandler);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update a lesson
 * @access  Private
 */
router.put('/:id', authenticate as RequestHandler, updateLesson as RequestHandler);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Private
 */
router.delete('/:id', authenticate as RequestHandler, deleteLesson as RequestHandler);

/**
 * @route   GET /api/lessons/module/:moduleId
 * @desc    Get lessons by module ID
 * @access  Public
 */
router.get('/module/:moduleId', getLessonsByModule as RequestHandler);

export default router;

