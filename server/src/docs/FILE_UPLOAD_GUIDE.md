# File Upload Middleware Guide

Complete guide for handling file uploads in Planet Path backend.

## Features

- ✅ Single and multiple file uploads
- ✅ Optional S3 cloud storage (AWS SDK)
- ✅ Local storage fallback (`/server/uploads`)
- ✅ File type validation (images, documents, videos)
- ✅ File size limits (10MB default)
- ✅ Automatic URL generation
- ✅ TypeScript support

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Optional: S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_S3_ENDPOINT=  # Optional: For S3-compatible services

# Local Storage (used if S3 not configured)
UPLOADS_DIR=./server/uploads
```

### 2. Install Dependencies

Already included in `package.json`:
- `multer` - File upload handling
- `@aws-sdk/client-s3` - AWS S3 SDK
- `@types/multer` - TypeScript types

## Usage Examples

### Basic Single File Upload

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadSingle, processUploadedFiles, handleUploadError, FileUploadRequest } from '../middleware/fileUpload.middleware';

const router = Router();

router.post(
  '/upload',
  authenticate,
  uploadSingle('image'), // Field name: 'image'
  handleUploadError,
  processUploadedFiles,
  (req: FileUploadRequest, res) => {
    res.json({
      success: true,
      url: req.uploadedUrl, // Single file URL
    });
  }
);
```

### Multiple Files Upload

```typescript
import { uploadMultiple } from '../middleware/fileUpload.middleware';

router.post(
  '/upload-multiple',
  authenticate,
  uploadMultiple('files', 10), // Field name: 'files', max 10 files
  handleUploadError,
  processUploadedFiles,
  (req: FileUploadRequest, res) => {
    res.json({
      success: true,
      urls: req.uploadedUrls, // Array of URLs
      count: req.uploadedUrls?.length,
    });
  }
);
```

### Simplified Handler (Recommended)

```typescript
import { completeUploadHandler } from '../middleware/fileUpload.middleware';

router.post(
  '/upload',
  authenticate,
  ...completeUploadHandler('file'), // Includes all middleware
  (req: FileUploadRequest, res) => {
    res.json({
      success: true,
      url: req.uploadedUrl,
    });
  }
);
```

### Upload with Form Data

```typescript
router.post(
  '/upload-with-data',
  authenticate,
  uploadSingle('file'),
  handleUploadError,
  processUploadedFiles,
  (req: FileUploadRequest, res) => {
    const { title, description } = req.body;
    const fileUrl = req.uploadedUrl;

    // Save to database
    // await saveToDatabase({ title, description, fileUrl });

    res.json({
      success: true,
      data: { title, description, fileUrl },
    });
  }
);
```

## Client-Side Usage

### Using FormData (JavaScript/TypeScript)

```typescript
// Single file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data.data.url); // File URL
```

### Multiple Files

```typescript
const formData = new FormData();
for (const file of fileInput.files) {
  formData.append('files', file);
}

const response = await fetch('/api/upload-multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data.data.urls); // Array of URLs
```

### With Additional Data

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Document');
formData.append('description', 'Document description');
formData.append('metadata', JSON.stringify({ geotag: { lat: 40.7128, lng: -74.0060 } }));

const response = await fetch('/api/upload/with-data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://s3.amazonaws.com/bucket/uploads/file.jpg",
    "filename": "original-name.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB"
}
```

## Configuration

### File Size Limit

Default: 10MB

To change, modify `MAX_FILE_SIZE` in `fileUpload.middleware.ts`:

```typescript
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

### Allowed File Types

Default: Images, PDFs, Documents, Videos

To modify, update `ALLOWED_MIME_TYPES` array in `fileUpload.middleware.ts`.

### Maximum Files

Default: 10 files

To change, modify `MAX_FILES` or pass `maxCount` parameter:

```typescript
uploadMultiple('files', 20); // Allow up to 20 files
```

## Storage Behavior

### S3 Storage (When Configured)

- Files are uploaded to S3 bucket
- Public URLs are generated automatically
- Format: `https://{bucket}.s3.{region}.amazonaws.com/{key}`

### Local Storage (Fallback)

- Files saved to `/server/uploads` directory
- URLs are relative paths: `/uploads/{filename}`
- Ensure `/server/uploads` directory exists (created automatically)

## Error Handling

The middleware handles common errors:

- **LIMIT_FILE_SIZE**: File exceeds maximum size
- **LIMIT_FILE_COUNT**: Too many files uploaded
- **LIMIT_UNEXPECTED_FILE**: Unexpected file field
- **Invalid file type**: File type not in allowed list

All errors return appropriate HTTP status codes (400) with error messages.

## TypeScript Types

```typescript
import { FileUploadRequest } from '../middleware/fileUpload.middleware';

router.post('/upload', (req: FileUploadRequest, res) => {
  // req.uploadedUrl - Single file URL (string | undefined)
  // req.uploadedUrls - Multiple file URLs (string[] | undefined)
  // req.file - Single file (Express.Multer.File | undefined)
  // req.files - Multiple files (Express.Multer.File[] | undefined)
  // req.user - Authenticated user (IUser | undefined)
});
```

## Best Practices

1. **Always use authentication** for file uploads
2. **Validate file types** on both client and server
3. **Set appropriate file size limits** based on your needs
4. **Use S3 for production** to handle large files and scale better
5. **Clean up old files** periodically if using local storage
6. **Store file metadata** in your database along with URLs
7. **Use unique filenames** to prevent conflicts (handled automatically)

## Troubleshooting

### Files not uploading

1. Check file size is within limit
2. Verify file type is allowed
3. Ensure authentication token is valid
4. Check server logs for errors

### S3 upload fails

1. Verify AWS credentials are correct
2. Check bucket permissions
3. Ensure bucket exists and is accessible
4. Verify region is correct

### Local storage issues

1. Ensure `/server/uploads` directory exists
2. Check file system permissions
3. Verify disk space is available

## Example Route Integration

See `server/src/routes/upload.example.ts` for complete examples.

To use in your app:

```typescript
// In server/src/app.ts
import uploadRoutes from './routes/upload.example';

app.use('/api/upload', uploadRoutes);
```

Then test with:

```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

