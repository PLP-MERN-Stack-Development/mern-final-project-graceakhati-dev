/**
 * File Upload Middleware for Planet Path
 * 
 * Handles file uploads with:
 * - Multer for multipart/form-data parsing
 * - Optional S3 upload via AWS SDK
 * - Local storage fallback to /server/uploads
 * - Returns uploaded file URLs
 * 
 * Usage:
 *   router.post('/upload', uploadSingle('image'), uploadHandler);
 *   router.post('/upload-multiple', uploadMultiple('files'), uploadHandler);
 */

import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from './auth';
import { uploadToS3, saveLocally, isS3Configured } from '../services/storage.service';

/**
 * Extended Request interface with file properties
 */
export interface FileUploadRequest extends AuthRequest {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
  uploadedUrls?: string[]; // URLs of uploaded files
  uploadedUrl?: string; // Single file URL
}

/**
 * File upload configuration
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10; // Maximum number of files

/**
 * Allowed MIME types
 */
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
  // Videos (optional)
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

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
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

/**
 * Check if S3 is enabled
 */
const useS3Storage = (): boolean => {
  return isS3Configured();
};

/**
 * Get storage engine based on S3 configuration
 */
const getStorage = (): StorageEngine => {
  if (useS3Storage()) {
    // Use memory storage for S3 uploads
    return multer.memoryStorage();
  } else {
    // Use disk storage for local uploads
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    return multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      },
    });
  }
};

/**
 * Multer instance configuration
 */
const multerConfig = {
  storage: getStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
};

/**
 * Create multer instance
 */
const upload = multer(multerConfig);

/**
 * Upload single file middleware
 * @param fieldName - Form field name (default: 'file')
 */
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName);
};

/**
 * Upload multiple files middleware
 * @param fieldName - Form field name (default: 'files')
 * @param maxCount - Maximum number of files (default: 10)
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = MAX_FILES) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Upload multiple fields middleware
 * @param fields - Array of field configurations
 */
export const uploadFields = (fields: Array<{ name: string; maxCount?: number }>) => {
  return upload.fields(fields);
};

/**
 * Process uploaded files and store them (S3 or local)
 * This middleware should be used AFTER multer middleware
 */
export const processUploadedFiles = async (
  req: FileUploadRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const uploadedUrls: string[] = [];

    // Process single file
    if (req.file) {
      const url = await storeFile(req.file);
      uploadedUrls.push(url);
      req.uploadedUrl = url; // Single file URL
    }

    // Process multiple files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await storeFile(file);
        uploadedUrls.push(url);
      }
    }

    // Process files from fields
    if (req.files && !Array.isArray(req.files)) {
      for (const fieldFiles of Object.values(req.files)) {
        const files = Array.isArray(fieldFiles) ? fieldFiles : [fieldFiles];
        for (const file of files) {
          const url = await storeFile(file);
          uploadedUrls.push(url);
        }
      }
    }

    req.uploadedUrls = uploadedUrls;
    next();
  } catch (error) {
    console.error('File upload processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing uploaded files',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Store a single file (S3 or local)
 */
const storeFile = async (file: Express.Multer.File): Promise<string> => {
  if (useS3Storage()) {
    // Upload to S3
    if (!file.buffer) {
      throw new Error('File buffer is required for S3 upload');
    }
    return await uploadToS3(file.buffer, file.originalname, file.mimetype);
  } else {
    // Save locally
    if (!file.path) {
      throw new Error('File path is required for local storage');
    }
    return saveLocally(file);
  }
};

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
        message: `Too many files. Maximum is ${MAX_FILES} files`,
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
 * Complete upload handler middleware chain
 * Combines multer upload + file processing + error handling
 * 
 * Usage:
 *   router.post('/upload', completeUploadHandler('file'), (req, res) => {
 *     res.json({ url: req.uploadedUrl });
 *   });
 */
export const completeUploadHandler = (fieldName: string = 'file', maxCount?: number) => {
  return [
    fieldName.includes('[') || maxCount !== undefined
      ? uploadMultiple(fieldName, maxCount)
      : uploadSingle(fieldName),
    handleUploadError,
    processUploadedFiles,
  ];
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processUploadedFiles,
  handleUploadError,
  completeUploadHandler,
};

