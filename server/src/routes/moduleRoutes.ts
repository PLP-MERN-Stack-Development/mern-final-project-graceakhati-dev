import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
} from '../controllers/module.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Validation rules for creating a module
 */
const createModuleValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Module title must be between 3 and 200 characters'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Module order must be a positive integer'),
];

/**
 * Validation rules for updating a module
 */
const updateModuleValidation = [
  param('id').isMongoId().withMessage('Invalid module ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Module title must be between 3 and 200 characters'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Module order must be a positive integer'),
];

/**
 * @route   POST /api/modules
 * @desc    Create a new module
 * @access  Private
 */
router.post('/', authenticate, createModuleValidation, createModule);

/**
 * @route   GET /api/modules/course/:courseId
 * @desc    Get all modules for a course
 * @access  Public
 */
router.get('/course/:courseId', getModulesByCourse);

/**
 * @route   GET /api/modules/:id
 * @desc    Get module by ID
 * @access  Public
 */
router.get('/:id', getModuleById);

/**
 * @route   PUT /api/modules/:id
 * @desc    Update a module
 * @access  Private
 */
router.put('/:id', authenticate, updateModuleValidation, updateModule);

/**
 * @route   DELETE /api/modules/:id
 * @desc    Delete a module
 * @access  Private
 */
router.delete('/:id', authenticate, deleteModule);

export default router;

