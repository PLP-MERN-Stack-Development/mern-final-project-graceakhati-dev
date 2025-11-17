/**
 * Example Routes for File Upload Middleware
 * 
 * This file demonstrates how to use the file upload middleware
 * Copy these examples to your actual route files
 */

import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processUploadedFiles,
  handleUploadError,
  completeUploadHandler,
  FileUploadRequest,
} from '../middleware/fileUpload.middleware';

const router = Router();

/**
 * Example 1: Upload single file (image)
 * POST /api/upload/image
 * Form field: 'image'
 */
const handleImageUpload = (req: FileUploadRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: req.uploadedUrl,
      filename: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype,
    },
  });
};

router.post(
  '/image',
  authenticate,
  uploadSingle('image') as any,
  handleUploadError as any,
  processUploadedFiles as any,
  handleImageUpload as any
);

/**
 * Example 2: Upload multiple files
 * POST /api/upload/files
 * Form field: 'files' (array)
 */
const handleMultipleUpload = (req: FileUploadRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    data: {
      urls: req.uploadedUrls,
      count: req.uploadedUrls?.length || 0,
      files: req.files?.map((file) => ({
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      })),
    },
  });
};

router.post(
  '/files',
  authenticate,
  uploadMultiple('files', 10) as any,
  handleUploadError as any,
  processUploadedFiles as any,
  handleMultipleUpload as any
);

/**
 * Example 3: Upload multiple fields (image + documents)
 * POST /api/upload/mixed
 * Form fields: 'image' (single), 'documents' (array)
 */
const handleMixedUpload = (req: FileUploadRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    data: {
      urls: req.uploadedUrls,
      imageUrl: req.uploadedUrls?.[0],
      documentUrls: req.uploadedUrls?.slice(1),
    },
  });
};

router.post(
  '/mixed',
  authenticate,
  uploadFields([
    { name: 'image', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]) as any,
  handleUploadError as any,
  processUploadedFiles as any,
  handleMixedUpload as any
);

/**
 * Example 4: Using complete handler (simplified)
 * POST /api/upload/simple
 * Form field: 'file'
 */
const handleSimpleUpload = (req: FileUploadRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: req.uploadedUrl,
    },
  });
};

router.post(
  '/simple',
  authenticate,
  ...(completeUploadHandler('file') as any[]),
  handleSimpleUpload as any
);

/**
 * Example 5: Upload with additional form data
 * POST /api/upload/with-data
 * Form fields: 'file', 'title', 'description'
 */
const handleUploadWithData = (req: FileUploadRequest, res: Response): void => {
  const { title, description } = req.body;

  res.status(200).json({
    success: true,
    message: 'File and data saved successfully',
    data: {
      url: req.uploadedUrl,
      title,
      description,
    },
  });
};

router.post(
  '/with-data',
  authenticate,
  uploadSingle('file') as any,
  handleUploadError as any,
  processUploadedFiles as any,
  handleUploadWithData as any
);

/**
 * Example 6: Upload for assignment submission
 * POST /api/upload/assignment
 * Form fields: 'files' (array), 'assignmentId', 'courseId', 'metadata'
 */
const handleAssignmentUpload = async (req: FileUploadRequest, res: Response): Promise<void> => {
  const { assignmentId, courseId, metadata } = req.body;

  let parsedMetadata: any = {};
  if (metadata) {
    try {
      parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid metadata format',
      });
      return;
    }
  }

  res.status(201).json({
    success: true,
    message: 'Assignment files uploaded successfully',
    data: {
      urls: req.uploadedUrls,
      assignmentId,
      courseId,
      metadata: parsedMetadata,
    },
  });
};

router.post(
  '/assignment',
  authenticate,
  uploadMultiple('files', 10) as any,
  handleUploadError as any,
  processUploadedFiles as any,
  handleAssignmentUpload as any
);

export default router;
