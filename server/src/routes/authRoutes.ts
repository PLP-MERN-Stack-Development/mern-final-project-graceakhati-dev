import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController';
import { googleAuth, googleAuthCallback } from '../controllers/googleAuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate as RequestHandler, getMe as RequestHandler);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 * 
 * This route initiates the Google OAuth flow by redirecting to Google's consent screen.
 * After user authentication, Google redirects to /api/auth/google/callback
 */
router.get('/google', googleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 * 
 * This route handles the callback from Google OAuth.
 * It processes the authentication and redirects to frontend with JWT token.
 */
router.get('/google/callback', googleAuthCallback);

export default router;
