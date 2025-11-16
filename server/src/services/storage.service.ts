import { S3Client, PutObjectCommand, PutObjectCommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { getUploadedFiles } from '../middleware/upload.middleware';
import { UploadRequest } from '../middleware/upload.middleware';

/**
 * File-like object interface for storage service compatibility
 */
export interface FileLike {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

/**
 * S3 Configuration Interface
 */
interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint?: string; // For S3-compatible services (e.g., DigitalOcean Spaces)
}

/**
 * Check if S3 is configured
 */
const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION
  );
};

/**
 * Get S3 client instance
 */
const getS3Client = (): S3Client | null => {
  if (!isS3Configured()) {
    return null;
  }

  const config: S3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: process.env.AWS_S3_BUCKET!,
    region: process.env.AWS_REGION!,
  };

  const s3Config: any = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };

  // Optional: Custom endpoint for S3-compatible services
  if (process.env.AWS_S3_ENDPOINT) {
    s3Config.endpoint = process.env.AWS_S3_ENDPOINT;
    s3Config.forcePathStyle = true; // Required for some S3-compatible services
  }

  return new S3Client(s3Config);
};

/**
 * Upload file to S3
 * @param buffer - File buffer
 * @param filename - Original filename
 * @param mimeType - MIME type of the file
 * @param folder - Optional folder path in S3 bucket (default: 'uploads')
 * @returns Public URL of uploaded file
 */
export const uploadToS3 = async (
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<string> => {
  const s3Client = getS3Client();

  if (!s3Client) {
    throw new Error('S3 is not configured. Please set AWS environment variables.');
  }

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION!;
  const key = `${folder}/${Date.now()}-${filename}`;

  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read', // Make file publicly accessible
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    // Construct public URL
    const endpoint = process.env.AWS_S3_ENDPOINT;
    let publicUrl: string;

    if (endpoint) {
      // Custom endpoint (e.g., DigitalOcean Spaces)
      publicUrl = `${endpoint}/${bucket}/${key}`;
    } else {
      // Standard AWS S3 URL
      publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return publicUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${(error as Error).message}`);
  }
};

/**
 * Save file locally to uploads directory
 * @param file - File-like object
 * @returns Local URL path (e.g., /uploads/filename.jpg)
 */
export const saveLocally = (file: FileLike): string => {
  const uploadsDir = process.env.UPLOADS_DIR || './uploads';

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // If file is already saved to disk (diskStorage), return its path
  if (file.path) {
    // Convert absolute path to relative URL path
    const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }

  // If file is in memory (memoryStorage), save it to disk
  if (file.buffer) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    // Return URL path
    const relativePath = `/uploads/${filename}`;
    return relativePath;
  }

  throw new Error('File has neither path nor buffer');
};

/**
 * Store files (decides between S3 and local storage)
 * @param files - Array of file-like objects
 * @returns Array of public URLs
 */
export const storeFiles = async (
  files: FileLike[]
): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  const urls: string[] = [];

  if (isS3Configured()) {
    // Upload to S3
    for (const file of files) {
      try {
        const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : Buffer.alloc(0));
        const filename = file.originalname;
        const mimeType = file.mimetype;

        const url = await uploadToS3(buffer, filename, mimeType);
        urls.push(url);

        // Clean up local file if it was saved temporarily
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.originalname} to S3:`, error);
        // Fallback to local storage if S3 upload fails
        try {
          const localUrl = saveLocally(file);
          urls.push(localUrl);
        } catch (localError) {
          console.error(`Failed to save ${file.originalname} locally:`, localError);
          throw new Error(`Failed to store file ${file.originalname}`);
        }
      }
    }
  } else {
    // Save locally
    for (const file of files) {
      try {
        const url = saveLocally(file);
        urls.push(url);
      } catch (error) {
        console.error(`Failed to save ${file.originalname} locally:`, error);
        throw new Error(`Failed to store file ${file.originalname}`);
      }
    }
  }

  return urls;
};

/**
 * Helper function to store files from request
 * Extracts files from UploadRequest and stores them
 * @param req - Express request with uploaded files
 * @returns Array of public URLs
 */
export const storeFilesFromRequest = async (req: UploadRequest): Promise<string[]> => {
  const files = getUploadedFiles(req);
  return await storeFiles(files);
};

/**
 * Delete file from S3
 * @param key - S3 object key
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  const s3Client = getS3Client();

  if (!s3Client) {
    throw new Error('S3 is not configured');
  }

  const bucket = process.env.AWS_S3_BUCKET!;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`Failed to delete file from S3: ${(error as Error).message}`);
  }
};

/**
 * Delete local file
 * @param filePath - Local file path
 */
export const deleteLocalFile = (filePath: string): void => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Local file delete error:', error);
    throw new Error(`Failed to delete local file: ${(error as Error).message}`);
  }
};

export default {
  uploadToS3,
  saveLocally,
  storeFiles,
  storeFilesFromRequest,
  deleteFromS3,
  deleteLocalFile,
  isS3Configured,
};

