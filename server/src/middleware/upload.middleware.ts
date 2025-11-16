import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Extended Request interface with file properties
 */
export interface UploadRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

/**
 * File upload configuration
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // PDFs
  'application/pdf',
];

/**
 * Check if S3 is enabled based on environment variables
 */
const isS3Enabled = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION
  );
};

/**
 * File filter function
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: images, videos, PDFs. Received: ${file.mimetype}`
      )
    );
  }
};

/**
 * Generate storage engine based on S3 configuration
 */
const getStorage = (): StorageEngine => {
  if (isS3Enabled()) {
    // Use memory storage for S3 uploads
    return multer.memoryStorage();
  } else {
    // Use disk storage for local uploads
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    return multer.diskStorage({
      destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
      ) => {
        cb(null, uploadsDir);
      },
      filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
      ) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const filename = `${name}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    });
  }
};

/**
 * Multer configuration
 */
const multerConfig = {
  storage: getStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
};

/**
 * Multer instance
 */
const upload = multer(multerConfig);

/**
 * Middleware for uploading multiple files
 * Accepts 'files' field as array
 */
export const uploadFiles = upload.array('files', 10); // Max 10 files

/**
 * Middleware for uploading single image
 * Accepts 'image' field as single file
 */
export const uploadImage = upload.single('image');

/**
 * Middleware for uploading both files array and single image
 * Accepts 'files' (array) and 'image' (single)
 */
export const uploadFilesAndImage = upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'image', maxCount: 1 },
]);

/**
 * Error handling middleware for multer errors
 */
export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files',
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  next(err);
};

/**
 * Helper function to get uploaded files from request
 */
export const getUploadedFiles = (req: UploadRequest): Express.Multer.File[] => {
  const files: Express.Multer.File[] = [];

  // Get files from array field
  if (req.files && Array.isArray(req.files)) {
    files.push(...req.files);
  }

  // Get file from single field
  if (req.file) {
    files.push(req.file);
  }

  // Get files from fields (multiple fields)
  if (req.files && !Array.isArray(req.files)) {
    Object.values(req.files).forEach((fieldFiles) => {
      if (Array.isArray(fieldFiles)) {
        files.push(...fieldFiles);
      } else {
        files.push(fieldFiles as Express.Multer.File);
      }
    });
  }

  return files;
};

export default upload;

