import { Router } from 'express';
import {
  getCertificate,
  getUserCertificates,
  getCourseCertificates,
} from '../controllers/certificate.controller';
import {
  generateCertificate as generateCertificateNew,
  verifyCertificate,
} from '../controllers/certificateController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/certificates/generate
 * @desc    Generate a certificate for user and course
 * @access  Private
 */
router.post('/generate', authenticate, generateCertificateNew);

/**
 * @route   GET /api/certificates/verify/:certificateId
 * @desc    Verify a certificate by certificateId
 * @access  Public
 * NOTE: This route must come before /:id to avoid route conflicts
 */
router.get('/verify/:certificateId', verifyCertificate);

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

/**
 * @route   GET /api/certificates/:id
 * @desc    Get certificate by ID
 * @access  Private
 * NOTE: This route must come last to avoid conflicts with /verify/:certificateId
 */
router.get('/:id', authenticate, getCertificate);

export default router;

