# Certificate Generation Setup Guide

This guide explains how to set up and use the certificate generation system.

## Installation

Install the required dependency:

```bash
npm install pdfkit
npm install --save-dev @types/pdfkit
```

## Dependencies

The certificate service requires:
- `pdfkit` - For PDF generation
- `storage.service` - For storing certificates (S3 or local)
- `User` and `Course` models - For fetching user and course data

## API Endpoints

### Generate Certificate
```http
POST /api/certificates/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "507f191e810c19729de860ea"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "url": "https://s3.amazonaws.com/bucket/certificate-123.pdf",
    "issuedAt": "2024-01-01T00:00:00.000Z",
    "userId": "507f1f77bcf86cd799439011",
    "courseId": "507f191e810c19729de860ea"
  }
}
```

### Get Certificate by ID
```http
GET /api/certificates/:id
Authorization: Bearer <token>
```

### Get User's Certificates
```http
GET /api/certificates/user/:userId
Authorization: Bearer <token>
```

### Get Course Certificates (Instructor/Admin Only)
```http
GET /api/certificates/course/:courseId
Authorization: Bearer <token>
```

## Usage Examples

### Example 1: Generate Certificate After Course Completion

```typescript
// In your course completion controller
import { generateCertificate } from '../controllers/certificate.controller';

export const completeCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!._id.toString();
    
    // Mark course as completed in database
    // ... your completion logic ...
    
    // Generate certificate
    const certificateResponse = await fetch('http://localhost:5000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, courseId }),
    });
    
    const certificate = await certificateResponse.json();
    
    res.json({
      success: true,
      message: 'Course completed!',
      data: {
        certificate: certificate.data,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Example 2: Direct Service Usage

```typescript
import { generateAndStoreCertificate } from '../services/certificate.service';
import Certificate from '../models/Certificate';

// Generate certificate
const certificateUrl = await generateAndStoreCertificate(userId, courseId);

// Save to database
const certificate = new Certificate({
  userId,
  courseId,
  url: certificateUrl,
  issuedAt: new Date(),
});

await certificate.save();
```

## Certificate Design

The certificate includes:
- User's name
- Course title
- Issue date
- Unique certificate ID
- Planet Path branding
- Decorative elements

## Storage

Certificates are stored using the `storage.service`:
- **S3**: If AWS credentials are configured
- **Local**: Falls back to local storage in `./uploads` directory

## Security

- Users can only generate certificates for themselves (unless admin/instructor)
- Duplicate certificates are prevented (unique constraint on userId + courseId)
- Certificate URLs are protected by authentication

## Error Handling

Common errors:
- `400`: Missing userId or courseId
- `401`: User not authenticated
- `403`: User not authorized to generate certificate
- `404`: User or course not found
- `500`: PDF generation or storage error

## Testing

```typescript
// Test certificate generation
import { generateCertificatePDF } from '../services/certificate.service';

const pdfBuffer = await generateCertificatePDF({
  userName: 'John Doe',
  courseTitle: 'Climate Change Basics',
  issuedDate: new Date(),
  certificateId: 'CERT-123',
});

// Save to file for testing
fs.writeFileSync('test-certificate.pdf', pdfBuffer);
```

## Troubleshooting

### PDF Generation Fails
- Check that `pdfkit` is installed
- Verify user and course exist in database
- Check storage service configuration

### Storage Issues
- Verify S3 credentials if using S3
- Check `UPLOADS_DIR` exists and is writable if using local storage
- Ensure storage service is properly configured

### Duplicate Certificate Error
- Certificates are unique per user-course combination
- Use GET endpoint to retrieve existing certificate instead of generating new one

