import { Router } from 'express';
import {
  generateCertificate,
  getCertificate,
  getUserCertificates,
  getCourseCertificates,
} from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/certificates/generate
 * @desc    Generate a certificate for user and course
 * @access  Private
 */
router.post('/generate', authenticate, generateCertificate);

/**
 * @route   GET /api/certificates/:id
 * @desc    Get certificate by ID
 * @access  Private
 */
router.get('/:id', authenticate, getCertificate);

/**
 * @route   GET /api/certificates/user/:userId
 * @desc    Get all certificates for a user
 * @access  Private
 */
router.get('/user/:userId', authenticate, getUserCertificates);

/**
 * @route   GET /api/certificates/course/:courseId
 * @desc    Get all certificates for a course
 * @access  Private (instructor/admin only)
 */
router.get(
  '/course/:courseId',
  authenticate,
  authorize('instructor', 'admin'),
  getCourseCertificates
);

export default router;

