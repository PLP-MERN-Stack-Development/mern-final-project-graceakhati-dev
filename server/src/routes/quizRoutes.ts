import { Router } from 'express';
import { body } from 'express-validator';
import {
  createQuiz,
  getQuizById,
  getQuizByLesson,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quiz.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Validation rules for creating/updating a quiz
 */
const quizValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Quiz title must be between 3 and 200 characters'),
  body('lessonId')
    .isMongoId()
    .withMessage('Invalid lesson ID'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  body('questions.*.question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Question must have between 2 and 6 options'),
  body('questions.*.points')
    .isInt({ min: 1 })
    .withMessage('Question points must be at least 1'),
];

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Private (instructor/admin only)
 */
router.post('/', authenticate, authorize('instructor', 'admin'), quizValidation, createQuiz);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz by ID
 * @access  Public
 */
router.get('/:id', getQuizById);

/**
 * @route   GET /api/quizzes/lesson/:lessonId
 * @desc    Get quiz by lesson ID
 * @access  Public
 */
router.get('/lesson/:lessonId', getQuizByLesson);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update a quiz
 * @access  Private (instructor/admin only)
 */
router.put('/:id', authenticate, authorize('instructor', 'admin'), quizValidation, updateQuiz);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz
 * @access  Private (instructor/admin only)
 */
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteQuiz);

export default router;

