// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import fs from 'fs';
import path from 'path';
import { storeFiles, FileLike } from './storage.service';
import User from '../models/User';
import Course from '../models/Course';

/**
 * Certificate Data Interface
 */
export interface CertificateData {
  userName: string;
  courseTitle: string;
  issuedDate: Date;
  certificateId: string;
}

/**
 * Generate PDF Certificate
 * Creates a PDF certificate with user name and course title
 * 
 * @param certificateData - Certificate data (user name, course title, etc.)
 * @returns Buffer containing PDF data
 */
export const generateCertificatePDF = async (
  certificateData: CertificateData
): Promise<Buffer> => {
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
        .text('CERTIFICATE OF COMPLETION', {
          align: 'center',
          y: pageHeight / 2 - 150,
        });

      // Subtitle
      doc.fontSize(18)
        .fillColor('#15803D')
        .font('Helvetica')
        .text('This is to certify that', {
          align: 'center',
          y: pageHeight / 2 - 80,
        });

      // User Name
      doc.fontSize(32)
        .fillColor('#16A34A')
        .font('Helvetica-Bold')
        .text(certificateData.userName, {
          align: 'center',
          y: pageHeight / 2 - 40,
        });

      // Course Title
      doc.fontSize(20)
        .fillColor('#15803D')
        .font('Helvetica')
        .text('has successfully completed the course', {
          align: 'center',
          y: pageHeight / 2 + 20,
        });

      doc.fontSize(24)
        .fillColor('#16A34A')
        .font('Helvetica-Bold')
        .text(certificateData.courseTitle, {
          align: 'center',
          y: pageHeight / 2 + 60,
        });

      // Date
      doc.fontSize(14)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Issued on ${certificateData.issuedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`, {
          align: 'center',
          y: pageHeight / 2 + 140,
        });

      // Certificate ID
      doc.fontSize(10)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(`Certificate ID: ${certificateData.certificateId}`, {
          align: 'center',
          y: pageHeight / 2 + 180,
        });

      // Footer
      doc.fontSize(12)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('Planet Path - Environmental Education Platform', {
          align: 'center',
          y: pageHeight - 80,
        });

      // Decorative border elements
      doc.strokeColor('#22C55E').lineWidth(2);
      doc.moveTo(pageWidth / 2 - 100, pageHeight / 2 - 100)
        .lineTo(pageWidth / 2 - 80, pageHeight / 2 - 100)
        .stroke();
      doc.moveTo(pageWidth / 2 + 100, pageHeight / 2 - 100)
        .lineTo(pageWidth / 2 + 80, pageHeight / 2 - 100)
        .stroke();

      doc.moveTo(pageWidth / 2 - 100, pageHeight / 2 + 120)
        .lineTo(pageWidth / 2 - 80, pageHeight / 2 + 120)
        .stroke();
      doc.moveTo(pageWidth / 2 + 100, pageHeight / 2 + 120)
        .lineTo(pageWidth / 2 + 80, pageHeight / 2 + 120)
        .stroke();

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate and store certificate
 * Creates PDF certificate and stores it using storage service
 * 
 * @param userId - User ID
 * @param courseId - Course ID
 * @returns Certificate URL
 */
export const generateAndStoreCertificate = async (
  userId: string,
  courseId: string
): Promise<string> => {
  try {
    // Fetch user and course data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Generate certificate ID
    const certificateId = `CERT-${Date.now()}-${userId.substring(0, 8)}`;

    // Prepare certificate data
    const certificateData: CertificateData = {
      userName: user.name,
      courseTitle: course.title,
      issuedDate: new Date(),
      certificateId,
    };

    // Generate PDF buffer
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Create a temporary file-like object for storage service
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `certificate-${certificateId}.pdf`;
    const tempFilePath = path.join(tempDir, filename);

    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Create file-like object for storage service
    const fileObject: FileLike = {
      fieldname: 'certificate',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
      buffer: pdfBuffer,
      destination: tempDir,
      filename: filename,
      path: tempFilePath,
    };

    // Store file using storage service (S3 or local)
    const urls = await storeFiles([fileObject]);

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (urls.length === 0) {
      throw new Error('Failed to store certificate');
    }

    return urls[0];
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error(`Failed to generate certificate: ${(error as Error).message}`);
  }
};

/**
 * Generate certificate filename
 * 
 * @param userName - User name
 * @param courseTitle - Course title
 * @param certificateId - Certificate ID
 * @returns Filename string
 */
export const generateCertificateFilename = (
  userName: string,
  courseTitle: string,
  certificateId: string
): string => {
  const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const sanitizedCourseTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `certificate-${sanitizedUserName}-${sanitizedCourseTitle}-${certificateId}.pdf`;
};

export default {
  generateCertificatePDF,
  generateAndStoreCertificate,
  generateCertificateFilename,
};

