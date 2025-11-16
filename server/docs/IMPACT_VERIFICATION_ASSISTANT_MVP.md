# Impact Verification Assistant — MVP Technical Design

**Version:** 1.0  
**Date:** 2024  
**Status:** Draft

---

## 1. Purpose

The Impact Verification Assistant is an MVP feature designed to help verify and score user-submitted environmental impact projects (e.g., tree planting, beach cleanups, water conservation initiatives). The system provides automated scoring and flagging to assist human reviewers in validating project submissions, reducing manual review time while maintaining quality control.

**Key Goals:**
- Provide automated verification scoring (0-100) for project submissions
- Flag potential issues or inconsistencies for human review
- Support scalable verification workflow without heavy AI infrastructure
- Enable students to submit proof of their environmental actions

---

## 2. Inputs

Each verification submission requires the following inputs:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectPhoto` | string (URL) | Yes | URL to uploaded project photo |
| `geolocation` | object | Yes | `{ lat: number, lng: number }` - Project location coordinates |
| `description` | string | Yes | Text description of the project (min 20 chars, max 1000 chars) |
| `userId` | string (ObjectId) | Yes | ID of the user submitting the project |
| `projectId` | string (ObjectId) | Yes | ID of the associated project/course |

**Example Input:**
```json
{
  "projectPhoto": "https://storage.example.com/projects/photo-123.jpg",
  "geolocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "description": "Planted 10 native trees in local park as part of reforestation project",
  "userId": "507f1f77bcf86cd799439011",
  "projectId": "507f191e810c19729de860ea"
}
```

---

## 3. Processing Approach

### 3.1 Heuristic Scoring (Primary Method)

The MVP uses rule-based heuristics to score submissions without requiring ML infrastructure:

**Image Analysis (via Image Metadata & Basic Checks):**
- **Lighting Score (0-25 points):** Check image brightness/exposure metadata
  - Well-lit images: 20-25 points
  - Moderate lighting: 10-19 points
  - Poor lighting: 0-9 points
- **Clarity Score (0-25 points):** Check image resolution and blur detection
  - High resolution (>1920x1080) and sharp: 20-25 points
  - Medium resolution (1280x720): 10-19 points
  - Low resolution or blurry: 0-9 points
- **Content Presence (0-30 points):** Basic keyword matching on image filename/metadata
  - Filename contains keywords (tree, plant, cleanup, trash, water): +10 points
  - Image dimensions suggest landscape/outdoor photo: +10 points
  - Image size indicates real photo (not placeholder): +10 points

**Text Analysis (0-20 points):**
- **Keyword Matching:** Count relevant keywords in description
  - Keywords: `tree`, `plant`, `planting`, `cleanup`, `trash`, `waste`, `water`, `conservation`, `recycle`, `compost`, `solar`, `energy`
  - 3+ keywords: 15-20 points
  - 1-2 keywords: 8-14 points
  - 0 keywords: 0-7 points

**Geolocation Validation (0-10 points):**
- Valid coordinates (lat: -90 to 90, lng: -180 to 180): +5 points
- Coordinates within reasonable range (not 0,0 or extreme values): +5 points

**Total Score Calculation:**
```
verification_score = lighting_score + clarity_score + content_presence + text_score + geolocation_score
```

### 3.2 Optional Lightweight ML Model (Future Enhancement)

For MVP+, consider integrating a small open-source image classification model:
- **Model:** MobileNetV2 or EfficientNet-Lite (TensorFlow.js compatible)
- **Purpose:** Detect objects in images (trees, trash, tools, people)
- **Deployment:** Client-side or lightweight server-side inference
- **Fallback:** If ML model unavailable, use heuristic scoring only

### 3.3 Flag Generation

Flags are generated based on scoring thresholds and rule violations:

| Flag | Condition | Severity |
|------|-----------|----------|
| `low_score` | Score < 50 | Warning |
| `poor_lighting` | Lighting score < 10 | Warning |
| `low_resolution` | Clarity score < 10 | Warning |
| `missing_keywords` | Text score < 8 | Warning |
| `invalid_location` | Geolocation validation failed | Error |
| `suspicious_coordinates` | Coordinates are 0,0 or extreme | Error |
| `description_too_short` | Description < 20 characters | Error |
| `no_image` | Image URL invalid or inaccessible | Error |

---

## 4. Output

The verification system returns:

```typescript
{
  verification_score: number,        // 0-100
  flags: string[],                    // Array of flag codes
  recommended_action: string,        // Human-readable recommendation
  breakdown: {                        // Optional score breakdown
    lighting: number,
    clarity: number,
    content: number,
    text: number,
    geolocation: number
  }
}
```

**Example Output:**
```json
{
  "verification_score": 72,
  "flags": ["low_resolution"],
  "recommended_action": "Submission looks good. Consider uploading a higher resolution photo for better verification.",
  "breakdown": {
    "lighting": 22,
    "clarity": 12,
    "content": 25,
    "text": 18,
    "geolocation": 10
  }
}
```

**Recommended Actions:**
- `"approved"` - Score ≥ 70, no error flags
- `"needs_review"` - Score 50-69, or has warning flags
- `"rejected"` - Score < 50, or has error flags
- `"resubmit"` - Critical errors (invalid location, no image)

---

## 5. Storage Schema

### MongoDB Collection: `impact_submissions`

```typescript
{
  _id: ObjectId,
  submissionId: string,              // Unique submission identifier
  projectId: ObjectId,                // Reference to project/course
  userId: ObjectId,                   // Reference to user
  projectPhoto: string,               // URL to photo
  geolocation: {
    lat: number,
    lng: number
  },
  description: string,
  verification_score: number,          // 0-100
  flags: string[],                     // Array of flag codes
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_review',
  reviewerNotes: string,               // Optional notes from human reviewer
  reviewerId: ObjectId,               // Optional: ID of reviewer
  breakdown: {
    lighting: number,
    clarity: number,
    content: number,
    text: number,
    geolocation: number
  },
  createdAt: Date,
  updatedAt: Date,
  reviewedAt: Date                    // When human review completed
}
```

**Indexes:**
- `{ userId: 1, createdAt: -1 }` - User submissions
- `{ projectId: 1, createdAt: -1 }` - Project submissions
- `{ reviewStatus: 1, createdAt: 1 }` - Pending reviews
- `{ submissionId: 1 }` - Unique lookup

---

## 6. API Endpoints (Future Implementation)

### POST /api/impact/submit
**Description:** Submit a new impact verification request

**Authentication:** Required (Bearer token)

**Authorization:** Roles: `student`, `verifier`, `admin`

**Request Body:**
```json
{
  "projectPhoto": "https://...",
  "geolocation": { "lat": 40.7128, "lng": -74.0060 },
  "description": "Project description...",
  "projectId": "507f191e810c19729de860ea"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission received",
  "data": {
    "submissionId": "sub_123456",
    "verification_score": 72,
    "flags": ["low_resolution"],
    "recommended_action": "needs_review",
    "reviewStatus": "pending"
  }
}
```

**Status Codes:**
- `201` - Submission created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (invalid role)

---

### GET /api/impact/:projectId/submissions
**Description:** Get all submissions for a project

**Authentication:** Required (Bearer token)

**Authorization:** Roles: `student` (own submissions), `verifier`, `admin` (all)

**Query Parameters:**
- `status` - Filter by `reviewStatus` (optional)
- `userId` - Filter by user ID (optional, admin/verifier only)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Project not found

---

### PUT /api/impact/:submissionId/review (Future)
**Description:** Update review status (verifier/admin only)

**Request Body:**
```json
{
  "reviewStatus": "approved",
  "reviewerNotes": "Verified - looks good!"
}
```

---

## 7. Security Notes

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `student` | Submit own impact submissions, view own submissions |
| `verifier` | Submit submissions, view all submissions, review submissions |
| `admin` | Full access (submit, view, review, delete) |

### Security Considerations

1. **Image URL Validation:**
   - Validate image URLs are from trusted domains
   - Check image accessibility before processing
   - Implement rate limiting on image fetching

2. **Geolocation Validation:**
   - Sanitize coordinates to prevent injection
   - Validate coordinate ranges
   - Optional: Check coordinates against known project locations

3. **Input Sanitization:**
   - Sanitize description text (XSS prevention)
   - Validate projectId and userId are valid ObjectIds
   - Enforce description length limits

4. **Rate Limiting:**
   - Limit submissions per user (e.g., 10 per day)
   - Implement request throttling

5. **Authentication:**
   - All endpoints require JWT Bearer token
   - Verify user role before processing

---

## 8. MVP Implementation Notes

### Phase 1: Core Functionality (MVP)
- ✅ Heuristic scoring system
- ✅ Flag generation
- ✅ Basic storage schema
- ✅ Submit endpoint
- ✅ Role-based access control

### Phase 2: Enhancements (Post-MVP)
- Optional ML model integration
- Image upload handling (currently accepts URLs)
- Review workflow endpoints
- Email notifications
- Dashboard for verifiers

### Dependencies (MVP)
- Express.js (existing)
- MongoDB/Mongoose (existing)
- Image metadata library (e.g., `sharp` or `image-size`)
- Basic text processing (built-in JavaScript)

### Dependencies (Future)
- TensorFlow.js (for ML model)
- Image storage service (AWS S3, Cloudinary, etc.)

---

## 9. Success Metrics

- **Automation Rate:** % of submissions auto-approved (score ≥ 70)
- **Review Time:** Average time from submission to review
- **Accuracy:** % of auto-approved submissions that pass human review
- **User Engagement:** Number of submissions per user per month

---

**Document Owner:** Product Engineering Team  
**Last Updated:** 2024

