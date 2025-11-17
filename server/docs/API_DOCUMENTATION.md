# Planet Path API Documentation

Complete API documentation for the Planet Path backend.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth](#auth-endpoints)
  - [Courses](#courses-endpoints)
  - [Modules](#modules-endpoints)
  - [Lessons](#lessons-endpoints)
  - [Quizzes](#quizzes-endpoints)
  - [Assignments](#assignments-endpoints)
  - [Submissions](#submissions-endpoints)
  - [Enrollments](#enrollments-endpoints)
  - [Leaderboard](#leaderboard-endpoints)
  - [Certificates](#certificates-endpoints)
- [Error Responses](#error-responses)
- [File Uploads](#file-uploads)

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.planetpath.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Getting a Token

1. **Register** a new user:
   ```http
   POST /api/auth/register
   Content-Type: application/json

   {
     "name": "John Doe",
     "email": "john.doe@example.com",
     "password": "password123",
     "role": "student"
   }
   ```

2. **Login** with existing credentials:
   ```http
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "john.doe@example.com",
     "password": "password123"
   }
   ```

Both endpoints return a JWT token in the response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Endpoints

### Auth Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Courses Endpoints

#### Get All Courses
```http
GET /api/courses?status=published&page=1&limit=10
```

Query Parameters:
- `status` (optional): `draft`, `published`, `archived`
- `impact_type` (optional): `climate`, `waste`, `energy`, `water`, `community`, `other`
- `tags` (optional): Array of tag strings
- `authorId` (optional): Author's user ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field, prefix with `-` for descending (default: `-createdAt`)

#### Get Course by ID or Slug
```http
GET /api/courses/:id
```

#### Create Course (Instructor/Admin Only)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Climate Change Basics",
  "description": "Learn the fundamentals of climate change",
  "tags": ["climate", "environment"],
  "price": 0,
  "impact_type": "climate",
  "status": "draft"
}
```

#### Update Course (Author/Admin Only)
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}
```

#### Delete Course (Author/Admin Only)
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

### Modules Endpoints

#### Create Module (Instructor/Admin Only)
```http
POST /api/modules
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Climate Change",
  "courseId": "507f1f77bcf86cd799439011",
  "order": 1
}
```

#### Get Modules by Course
```http
GET /api/modules/course/:courseId
```

#### Get Module by ID
```http
GET /api/modules/:id
```

#### Update Module (Instructor/Admin Only)
```http
PUT /api/modules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Module Title",
  "order": 2
}
```

#### Delete Module (Instructor/Admin Only)
```http
DELETE /api/modules/:id
Authorization: Bearer <token>
```

### Lessons Endpoints

#### Create Lesson (Instructor/Admin Only)
```http
POST /api/lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "What is Climate Change?",
  "content": "Climate change refers to long-term shifts...",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 10,
  "order": 1,
  "moduleId": "507f1f77bcf86cd799439011"
}
```

#### Get Lessons by Module
```http
GET /api/lessons/module/:moduleId
```

#### Update Lesson (Instructor/Admin Only)
```http
PUT /api/lessons/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Lesson Title",
  "content": "Updated content..."
}
```

#### Delete Lesson (Instructor/Admin Only)
```http
DELETE /api/lessons/:id
Authorization: Bearer <token>
```

### Quizzes Endpoints

#### Create Quiz (Instructor/Admin Only)
```http
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Climate Change Quiz",
  "lessonId": "507f1f77bcf86cd799439011",
  "questions": [
    {
      "question": "Is the greenhouse effect natural?",
      "options": [
        {"text": "Yes, it is a natural process", "correct": true},
        {"text": "No, it is man-made", "correct": false}
      ],
      "points": 10
    }
  ]
}
```

#### Get Quiz by ID
```http
GET /api/quizzes/:id
```

#### Get Quiz by Lesson
```http
GET /api/quizzes/lesson/:lessonId
```

#### Update Quiz (Instructor/Admin Only)
```http
PUT /api/quizzes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Quiz Title",
  "questions": [...]
}
```

#### Delete Quiz (Instructor/Admin Only)
```http
DELETE /api/quizzes/:id
Authorization: Bearer <token>
```

### Assignments Endpoints

#### Create Assignment (Instructor/Admin Only)
```http
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Plant a Tree Assignment",
  "description": "Plant a tree and document the process",
  "courseId": "507f1f77bcf86cd799439011",
  "dueDate": "2024-12-31T23:59:59Z",
  "maxScore": 100
}
```

#### List Assignments by Course
```http
GET /api/assignments/course/:courseId
```

#### Get Assignment by ID
```http
GET /api/assignments/:id
```

#### Update Assignment (Instructor/Admin Only)
```http
PUT /api/assignments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Assignment Title",
  "dueDate": "2025-01-31T23:59:59Z"
}
```

#### Delete Assignment (Instructor/Admin Only)
```http
DELETE /api/assignments/:id
Authorization: Bearer <token>
```

### Submissions Endpoints

#### Submit Assignment (Multipart/Form-Data)
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: multipart/form-data

assignmentId: 507f1f77bcf86cd799439011
courseId: 507f1f77bcf86cd799439012
files: [file1.jpg, file2.pdf]
metadata: {"geotag":{"lat":40.7128,"lng":-74.0060},"notes":"Completed at Central Park"}
```

**Note**: The `files` field accepts multiple files. The `metadata` field should be a JSON string.

#### List Submissions by Assignment (Instructor/Admin Only)
```http
GET /api/submissions/assignment/:assignmentId
Authorization: Bearer <token>
```

#### Get Submission by ID
```http
GET /api/submissions/:id
Authorization: Bearer <token>
```

#### Grade Submission (Instructor/Admin Only)
```http
PUT /api/submissions/:id/grade
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "Great work! Well documented.",
  "status": "graded"
}
```

### Enrollments Endpoints

#### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "507f1f77bcf86cd799439011"
}
```

#### Get User Enrollments
```http
GET /api/enrollments/user/:userId
Authorization: Bearer <token>
```

#### Get Course Enrollments (Instructor/Admin Only)
```http
GET /api/enrollments/course/:courseId
Authorization: Bearer <token>
```

#### Update Enrollment Progress
```http
PUT /api/enrollments/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 75,
  "status": "active"
}
```

#### Drop Enrollment
```http
DELETE /api/enrollments/:id
Authorization: Bearer <token>
```

### Leaderboard Endpoints

#### Add XP
```http
POST /api/leaderboard/xp
Authorization: Bearer <token>
Content-Type: application/json

{
  "xp": 50
}
```

#### Get Top Users
```http
GET /api/leaderboard/top?limit=10
```

#### Get User Rank
```http
GET /api/leaderboard/rank/:userId
Authorization: Bearer <token>
```

#### Get Rank Range (Pagination)
```http
GET /api/leaderboard/range?start=11&end=20
```

### Certificates Endpoints

#### Generate Certificate
```http
POST /api/certificates/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "507f1f77bcf86cd799439012"
}
```

#### Get Certificate by ID
```http
GET /api/certificates/:id
Authorization: Bearer <token>
```

#### Get User Certificates
```http
GET /api/certificates/user/:userId
Authorization: Bearer <token>
```

#### Get Course Certificates (Instructor/Admin Only)
```http
GET /api/certificates/course/:courseId
Authorization: Bearer <token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ],
  "error": "Detailed error (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## File Uploads

Some endpoints accept `multipart/form-data` for file uploads:

### Supported File Types
- Images: JPEG, PNG, GIF, WebP, SVG
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- Videos: MP4, MPEG, QuickTime, AVI, WebM

### File Size Limit
- Maximum: 10MB per file
- Maximum files: 10 files per request

### Example: Submit Assignment with Files

Using `curl`:
```bash
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer <token>" \
  -F "assignmentId=507f1f77bcf86cd799439011" \
  -F "courseId=507f1f77bcf86cd799439012" \
  -F "files=@image1.jpg" \
  -F "files=@document.pdf" \
  -F 'metadata={"geotag":{"lat":40.7128,"lng":-74.0060},"notes":"Completed"}'
```

Using JavaScript `FormData`:
```javascript
const formData = new FormData();
formData.append('assignmentId', '507f1f77bcf86cd799439011');
formData.append('courseId', '507f1f77bcf86cd799439012');
formData.append('files', fileInput.files[0]);
formData.append('files', fileInput.files[1]);
formData.append('metadata', JSON.stringify({
  geotag: { lat: 40.7128, lng: -74.0060 },
  notes: 'Completed at Central Park'
}));

fetch('http://localhost:5000/api/submissions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Importing into Postman

1. Import the OpenAPI spec:
   - Open Postman
   - Click "Import"
   - Select `openapi.yaml` file
   - Postman will automatically create a collection with all endpoints

2. Or import the Postman collection directly:
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json`
   - Collection will be imported with pre-configured requests

3. Set up environment variables:
   - Create a new environment in Postman
   - Add variable `base_url` = `http://localhost:5000`
   - Add variable `jwt_token` = (will be auto-populated after login)

## Testing Tips

1. **Auto-save JWT token**: The Postman collection includes test scripts that automatically save the JWT token from login/register responses to the `jwt_token` variable.

2. **Use environment variables**: Set up different environments for development, staging, and production.

3. **Test authentication first**: Always test login/register endpoints first to get a valid token.

4. **Check response codes**: Pay attention to HTTP status codes to understand what went wrong.

5. **File uploads**: When testing file uploads, ensure files are within size limits and of supported types.

## Rate Limiting

API requests may be rate-limited. Check response headers for rate limit information:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Support

For API support, contact: support@planetpath.com

