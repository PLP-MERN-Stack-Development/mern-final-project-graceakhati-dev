import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Certificate from '../models/Certificate';
import { generateAndStoreCertificate } from '../services/certificate.service';

/**
 * Generate certificate for user and course
 * POST /api/certificates/generate
 */
export const generateCertificate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { userId, courseId } = req.body as {
      userId: string;
      courseId: string;
    };

    // Validate input
    if (!userId || !courseId) {
      res.status(400).json({
        success: false,
        message: 'userId and courseId are required',
      });
      return;
    }

    // Check if user is authorized (can only generate for themselves unless admin/instructor)
    const requestingUserId = req.user._id.toString();
    const isAdminOrInstructor = ['admin', 'instructor'].includes(req.user.role);

    if (userId !== requestingUserId && !isAdminOrInstructor) {
      res.status(403).json({
        success: false,
        message: 'You can only generate certificates for yourself',
      });
      return;
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      userId,
      courseId,
    });

    if (existingCertificate) {
      res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        data: {
          id: existingCertificate._id.toString(),
          url: existingCertificate.url,
          issuedAt: existingCertificate.issuedAt,
          userId: existingCertificate.userId instanceof Types.ObjectId
            ? existingCertificate.userId.toString()
            : String(existingCertificate.userId),
          courseId: existingCertificate.courseId instanceof Types.ObjectId
            ? existingCertificate.courseId.toString()
            : String(existingCertificate.courseId),
        },
      });
      return;
    }

    // Generate and store certificate
    const certificateUrl = await generateAndStoreCertificate(userId, courseId);

    // Save certificate record
    const certificate = new Certificate({
      userId,
      courseId,
      url: certificateUrl,
      issuedAt: new Date(),
    });

    await certificate.save();

    // Populate user and course info
    await certificate.populate('userId', 'name email');
    await certificate.populate('courseId', 'title slug');

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        id: certificate._id.toString(),
        url: certificate.url,
        issuedAt: certificate.issuedAt,
        userId: certificate.userId instanceof Types.ObjectId
          ? certificate.userId.toString()
          : String(certificate.userId),
        courseId: certificate.courseId instanceof Types.ObjectId
          ? certificate.courseId.toString()
          : String(certificate.courseId),
      },
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating certificate',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get certificate by ID
 * GET /api/certificates/:id
 */
export const getCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email')
      .populate('courseId', 'title slug');

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
      return;
    }

    // Check authorization: user can view their own certificates, instructors/admins can view all
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userId = req.user._id.toString();
    // certificate.userId is Types.ObjectId, safe to call toString()
    const certificateUserId = certificate.userId instanceof Types.ObjectId
      ? certificate.userId.toString()
      : String(certificate.userId);
    const isOwner = userId === certificateUserId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isOwner && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this certificate',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: certificate._id.toString(),
        url: certificate.url,
        issuedAt: certificate.issuedAt,
        userId: certificate.userId instanceof Types.ObjectId
          ? certificate.userId.toString()
          : String(certificate.userId),
        courseId: certificate.courseId instanceof Types.ObjectId
          ? certificate.courseId.toString()
          : String(certificate.courseId),
      },
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificate',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get user's certificates
 * GET /api/certificates/user/:userId
 */
export const getUserCertificates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params as { userId: string };

    // Check authorization
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const requestingUserId = req.user._id.toString();
    const isAdminOrInstructor = ['admin', 'instructor'].includes(req.user.role);

    if (userId !== requestingUserId && !isAdminOrInstructor) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own certificates',
      });
      return;
    }

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title slug')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        certificates: certificates.map((cert) => ({
          id: cert._id.toString(),
          url: cert.url,
          issuedAt: cert.issuedAt,
          userId: cert.userId instanceof Types.ObjectId
            ? cert.userId.toString()
            : String(cert.userId),
          courseId: cert.courseId instanceof Types.ObjectId
            ? cert.courseId.toString()
            : String(cert.courseId),
        })),
        count: certificates.length,
      },
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get certificates for a course
 * GET /api/certificates/course/:courseId
 */
export const getCourseCertificates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };

    // Only instructors and admins can view all certificates for a course
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view course certificates',
      });
      return;
    }

    const certificates = await Certificate.find({ courseId })
      .populate('userId', 'name email')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        certificates: certificates.map((cert) => ({
          id: cert._id.toString(),
          url: cert.url,
          issuedAt: cert.issuedAt,
          userId: cert.userId instanceof Types.ObjectId
            ? cert.userId.toString()
            : String(cert.userId),
          courseId: cert.courseId instanceof Types.ObjectId
            ? cert.courseId.toString()
            : String(cert.courseId),
        })),
        count: certificates.length,
      },
    });
  } catch (error) {
    console.error('Get course certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

