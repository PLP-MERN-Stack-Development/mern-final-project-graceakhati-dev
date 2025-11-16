# File Upload Configuration Guide

This guide explains how to configure file uploads for the Planet Path API, including both S3 (AWS) and local storage options.

## Environment Variables

### S3 Configuration (Optional - for cloud storage)

Add these to your `.env` file to enable S3 uploads:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Optional: Custom S3-compatible endpoint (e.g., DigitalOcean Spaces, MinIO)
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

### Local Storage Configuration (Fallback)

If S3 is not configured, files will be saved locally:

```env
# Local uploads directory (default: ./uploads)
UPLOADS_DIR=./uploads
```

## Configuration Examples

### Example 1: AWS S3 Configuration

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=planet-path-uploads
AWS_REGION=us-east-1
```

**Result:** Files will be uploaded to S3 and return public URLs like:
```
https://planet-path-uploads.s3.us-east-1.amazonaws.com/uploads/1234567890-photo.jpg
```

### Example 2: DigitalOcean Spaces Configuration

```env
AWS_ACCESS_KEY_ID=your-spaces-key
AWS_SECRET_ACCESS_KEY=your-spaces-secret
AWS_S3_BUCKET=planet-path-uploads
AWS_REGION=nyc3
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

**Result:** Files will be uploaded to DigitalOcean Spaces and return public URLs like:
```
https://nyc3.digitaloceanspaces.com/planet-path-uploads/uploads/1234567890-photo.jpg
```

### Example 3: Local Storage (No S3)

```env
# No AWS variables set
UPLOADS_DIR=./uploads
```

**Result:** Files will be saved locally and return URLs like:
```
/uploads/1234567890-photo.jpg
```

## Usage Examples

### Example 1: Upload Multiple Files

```typescript
import { uploadFiles, handleUploadError } from './middleware/upload.middleware';
import { storeFilesFromRequest } from './services/storage.service';

router.post('/upload', uploadFiles, handleUploadError, async (req, res) => {
  try {
    const urls = await storeFilesFromRequest(req);
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Example 2: Upload Single Image

```typescript
import { uploadImage, handleUploadError } from './middleware/upload.middleware';
import { storeFilesFromRequest } from './services/storage.service';

router.post('/upload-image', uploadImage, handleUploadError, async (req, res) => {
  try {
    const urls = await storeFilesFromRequest(req);
    res.json({ success: true, url: urls[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Example 3: Upload Files and Image Together

```typescript
import { uploadFilesAndImage, handleUploadError } from './middleware/upload.middleware';
import { storeFilesFromRequest } from './services/storage.service';

router.post('/upload', uploadFilesAndImage, handleUploadError, async (req, res) => {
  try {
    const urls = await storeFilesFromRequest(req);
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## File Validation

- **Max file size:** 10MB
- **Allowed types:**
  - Images: JPEG, JPG, PNG, GIF, WebP, SVG
  - Videos: MP4, MPEG, QuickTime, AVI, WebM
  - Documents: PDF

## Error Handling

The middleware automatically handles:
- File size validation
- File type validation
- Too many files
- Unexpected file fields

Errors are returned as JSON responses with appropriate HTTP status codes.

## Dependencies

Make sure to install required packages:

```bash
npm install multer @aws-sdk/client-s3
npm install --save-dev @types/multer
```

## Security Notes

1. **S3 Bucket Policy:** Ensure your S3 bucket has proper CORS and public-read ACL policies if needed
2. **File Validation:** Always validate file types and sizes on the server side
3. **Rate Limiting:** Consider implementing rate limiting for upload endpoints
4. **Virus Scanning:** Consider adding virus scanning for uploaded files in production

## Troubleshooting

### S3 Upload Fails
- Check AWS credentials are correct
- Verify bucket name and region
- Ensure bucket has proper permissions
- Check IAM policy allows PutObject

### Local Storage Issues
- Ensure `UPLOADS_DIR` directory exists or is writable
- Check disk space availability
- Verify file permissions

### File Type Errors
- Check file MIME type matches allowed types
- Verify file extension matches content type
- Some browsers may send incorrect MIME types

