import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Validation rules for creating a course
 */
const createCourseValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('modules')
    .optional()
    .isArray()
    .withMessage('Modules must be an array of module IDs'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 tags'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('impact_type')
    .optional()
    .isIn(['climate', 'waste', 'energy', 'water', 'community', 'other'])
    .withMessage('Invalid impact type'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

/**
 * Validation rules for updating a course
 */
const updateCourseValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('impact_type')
    .optional()
    .isIn(['climate', 'waste', 'energy', 'water', 'community', 'other'])
    .withMessage('Invalid impact type'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Public
 */
router.get('/', getCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID or slug
 * @access  Public
 */
router.get('/:id', getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (instructor/admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  createCourseValidation,
  createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course
 * @access  Private (course author, instructor, or admin)
 */
router.put(
  '/:id',
  authenticate,
  updateCourseValidation,
  updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (course author, instructor, or admin)
 */
router.delete('/:id', authenticate, deleteCourse);

export default router;

