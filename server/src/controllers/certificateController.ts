import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import Certificate from '../models/Certificate';
import User from '../models/User';
import Course from '../models/Course';

/**
 * Certificate Data Interface for hashing
 */
interface CertificateData {
  userId: string;
  courseId: string;
  certificateId: string;
  issuedAt: string;
  impactSummary: string;
}

/**
 * Generate certificate
 * POST /api/certificates/generate
 * 
 * Input:
 *   - userId
 *   - courseId
 *   - impactSummary
 * 
 * Steps:
 *   1. Use pdfkit to generate PDF buffer
 *   2. certificateId = uuid()
 *   3. issuedAt = current date
 *   4. Assemble certificateData object
 *   5. Hash = SHA256(JSON.stringify(certificateData))
 *   6. Store in Certificate model
 *   7. Return PDF as stream + verification URL
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

    const { userId, courseId, impactSummary } = req.body as {
      userId: string;
      courseId: string;
      impactSummary: string;
    };

    // Validate input
    if (!userId || !courseId || !impactSummary) {
      res.status(400).json({
        success: false,
        message: 'userId, courseId, and impactSummary are required',
      });
      return;
    }

    // Check authorization: user can only generate for themselves unless admin/instructor
    const requestingUserId = req.user.id;
    const isAdminOrInstructor = ['admin', 'instructor'].includes(req.user.role);

    if (userId !== requestingUserId && !isAdminOrInstructor) {
      res.status(403).json({
        success: false,
        message: 'You can only generate certificates for yourself',
      });
      return;
    }

    // Fetch user and course data
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Generate certificateId using UUID
    const certificateId = uuidv4();

    // Set issuedAt to current date
    const issuedAt = new Date();

    // Assemble certificateData object
    const certificateData: CertificateData = {
      userId: userId.toString(),
      courseId: courseId.toString(),
      certificateId,
      issuedAt: issuedAt.toISOString(),
      impactSummary,
    };

    // Calculate hash: SHA256(JSON.stringify(certificateData))
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(certificateData))
      .digest('hex');

    // Check if certificate already exists for this user and course
    const existingCertificate = await Certificate.findOne({
      userId,
      courseId,
    });

    if (existingCertificate) {
      res.status(400).json({
        success: false,
        message: 'Certificate already exists for this user and course',
        data: {
          certificateId: existingCertificate.certificateId,
          verificationUrl: `/api/certificates/verify/${existingCertificate.certificateId}`,
        },
      });
      return;
    }

    // Store in Certificate model
    const certificate = new Certificate({
      userId,
      courseId,
      certificateId,
      issuedAt,
      impactSummary,
      hash,
    });

    await certificate.save();

    // Generate PDF buffer using pdfkit
    const pdfBuffer = await generatePDFBuffer({
      userName: user.name,
      courseTitle: course.title,
      certificateId,
      issuedAt,
      impactSummary,
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.setHeader('X-Certificate-Id', certificateId);
    res.setHeader('X-Verification-Url', `/api/certificates/verify/${certificateId}`);

    // Return PDF as stream + verification URL in headers
    res.status(201);
    res.send(pdfBuffer);
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
 * Verify certificate
 * GET /api/certificates/verify/:certificateId
 * 
 * Steps:
 *   1. Look up certificateId
 *   2. Recalculate hash
 *   3. Compare with stored hash
 *   4. Return status: valid / tampered
 */
export const verifyCertificate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { certificateId } = req.params as { certificateId: string };

    if (!certificateId) {
      res.status(400).json({
        success: false,
        message: 'certificateId is required',
      });
      return;
    }

    // Look up certificateId
    const certificate = await Certificate.findOne({ certificateId })
      .populate('userId', 'name email')
      .populate('courseId', 'title slug');

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: 'Certificate not found',
        status: 'invalid',
      });
      return;
    }

    // Recalculate hash
    // certificate.userId and certificate.courseId are Types.ObjectId, safe to call toString()
    // Handle optional fields with defaults
    if (!certificate.certificateId) {
      res.status(400).json({
        success: false,
        message: 'Certificate missing certificateId',
        status: 'invalid',
      });
      return;
    }
    if (!certificate.impactSummary) {
      res.status(400).json({
        success: false,
        message: 'Certificate missing impactSummary',
        status: 'invalid',
      });
      return;
    }
    const certificateData: CertificateData = {
      userId: certificate.userId instanceof Types.ObjectId 
        ? certificate.userId.toString() 
        : String(certificate.userId),
      courseId: certificate.courseId instanceof Types.ObjectId
        ? certificate.courseId.toString()
        : String(certificate.courseId),
      certificateId: certificate.certificateId,
      issuedAt: certificate.issuedAt.toISOString(),
      impactSummary: certificate.impactSummary,
    };

    const recalculatedHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(certificateData))
      .digest('hex');

    // Compare with stored hash
    const isValid = recalculatedHash === certificate.hash;

    // Return status: valid / tampered
    res.status(200).json({
      success: true,
      status: isValid ? 'valid' : 'tampered',
      message: isValid
        ? 'Certificate is valid and has not been tampered with'
        : 'Certificate has been tampered with - hash mismatch detected',
      data: {
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        userId: certificate.userId,
        courseId: certificate.courseId,
        impactSummary: certificate.impactSummary,
        storedHash: certificate.hash,
        recalculatedHash,
        match: isValid,
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying certificate',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Generate PDF buffer using pdfkit
 * @param data - Certificate data for PDF generation
 * @returns PDF buffer
 */
async function generatePDFBuffer(data: {
  userName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: Date;
  impactSummary: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];

      // Collect PDF data
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Certificate Design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;

      // Background color (light green)
      doc.rect(0, 0, pageWidth, pageHeight).fill('#F0FDF4');

      // Border
      doc.strokeColor('#22C55E').lineWidth(5);
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2).stroke();

      // Decorative elements
      doc.fillColor('#22C55E').opacity(0.1);
      doc.circle(pageWidth / 2, pageHeight / 2, 200).fill();
      doc.opacity(1);

      // Title
      doc.fontSize(36)
        .fillColor('#16A34A')
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', pageWidth / 2, pageHeight / 2 - 200, {
          align: 'center',
        });

      // Subtitle
      doc.fontSize(18)
        .fillColor('#15803D')
        .font('Helvetica')
        .text('This is to certify that', pageWidth / 2, pageHeight / 2 - 130, {
          align: 'center',
        });

      // User Name
      doc.fontSize(32)
        .fillColor('#16A34A')
        .font('Helvetica-Bold')
        .text(data.userName, pageWidth / 2, pageHeight / 2 - 90, {
          align: 'center',
        });

      // Course Title
      doc.fontSize(20)
        .fillColor('#15803D')
        .font('Helvetica')
        .text('has successfully completed the course', pageWidth / 2, pageHeight / 2 - 30, {
          align: 'center',
        });

      doc.fontSize(24)
        .fillColor('#16A34A')
        .font('Helvetica-Bold')
        .text(data.courseTitle, pageWidth / 2, pageHeight / 2 + 10, {
          align: 'center',
        });

      // Impact Summary
      doc.fontSize(14)
        .fillColor('#15803D')
        .font('Helvetica')
        .text('Impact Summary:', pageWidth / 2, pageHeight / 2 + 70, {
          align: 'center',
        });

      doc.fontSize(12)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(data.impactSummary, margin, pageHeight / 2 + 100, {
          align: 'center',
          width: pageWidth - margin * 2,
        });

      // Date
      doc.fontSize(14)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Issued on ${data.issuedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`, pageWidth / 2, pageHeight / 2 + 180, {
          align: 'center',
        });

      // Certificate ID
      doc.fontSize(10)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(`Certificate ID: ${data.certificateId}`, pageWidth / 2, pageHeight / 2 + 220, {
          align: 'center',
        });

      // Footer
      doc.fontSize(12)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('Planet Path - Environmental Education Platform', pageWidth / 2, pageHeight - 80, {
          align: 'center',
        });

      // Verification URL
      doc.fontSize(10)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(`Verify at: /api/certificates/verify/${data.certificateId}`, pageWidth / 2, pageHeight - 60, {
          align: 'center',
        });

      // Decorative border elements
      doc.strokeColor('#22C55E').lineWidth(2);
      doc.moveTo(pageWidth / 2 - 100, pageHeight / 2 - 150)
        .lineTo(pageWidth / 2 - 80, pageHeight / 2 - 150)
        .stroke();
      doc.moveTo(pageWidth / 2 + 100, pageHeight / 2 - 150)
        .lineTo(pageWidth / 2 + 80, pageHeight / 2 - 150)
        .stroke();

      doc.moveTo(pageWidth / 2 - 100, pageHeight / 2 + 150)
        .lineTo(pageWidth / 2 - 80, pageHeight / 2 + 150)
        .stroke();
      doc.moveTo(pageWidth / 2 + 100, pageHeight / 2 + 150)
        .lineTo(pageWidth / 2 + 80, pageHeight / 2 + 150)
        .stroke();

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

