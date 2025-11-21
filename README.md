# Planet Path

**Planet Path** is a comprehensive MERN full-stack e-learning platform designed to mobilize climate action through education, verified impact projects, and micro-grants. By combining interactive courses with real-world environmental projects, Planet Path empowers learners to gain practical skills while contributing to measurable climate outcomes. The platform bridges the gap between learning and action, enabling users to earn badges and certificates for completing courses, participating in verified local projects, and achieving measurable environmental impact.

## Table of Contents

1. [Project Title & Description](#1-project-title--description)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Getting Started](#5-getting-started)
6. [API Documentation](#6-api-documentation)
7. [Testing Documentation](#7-testing-documentation)
8. [Deployment](#8-deployment)
9. [Demo Video](#9-demo-video)
10. [Screenshots](#10-screenshots)
11. [Roadmap](#11-roadmap)
12. [Lessons Learned](#12-lessons-learned)
13. [License](#13-license)

---

## 1. Project Title & Description

### Planet Path: Climate Action E-Learning Platform

**Problem Statement:**
Climate action in Africa faces a critical disconnect: millions of motivated learners lack pathways from education to verified impact. Traditional e-learning platforms deliver knowledge but fail to connect learning to real-world environmental outcomes. Meanwhile, community climate projects struggle to find skilled participants, and learners cannot prove their impact to employers or grant providers.

**Solution:**
Planet Path bridges the learning-to-action gap through an integrated platform combining interactive climate courses with verified community micro-projects. Learners earn blockchain-verified badges and certificates that demonstrate both knowledge and proven impact, creating portable credentials recognized by employers, grant providers, and carbon market platforms.

**Key Features:**
- Interactive climate education courses
- Verified impact project submissions
- Badge and certificate system
- Leaderboard and gamification
- Micro-grant application system
- Mobile-first Progressive Web App (PWA) with offline support

**Target Users:**
- **Primary**: Youth aged 18-35 seeking green skills and climate careers
- **Secondary**: Community groups and environmental clubs organizing local action
- **Tertiary**: NGOs and educators needing scalable climate education solutions
- **Enterprise**: Corporations and government agencies seeking team training

**SDG Alignment:**
- **SDG 13: Climate Action** - Core mission: Training and mobilizing learners into verified local projects
- **SDG 4: Quality Education** - Providing accessible, comprehensive climate education
- **SDG 8: Decent Work and Economic Growth** - Supporting learners through micro-grants and green skills development

---

## 2. Features

### Core Features

#### Authentication
- **JWT Authentication**: Secure token-based authentication with password hashing
- **Google OAuth**: Social login integration for seamless user onboarding
- **Role-Based Access Control**: Student, Instructor, and Admin roles with appropriate permissions
- **Session Persistence**: JWT tokens stored in localStorage with automatic refresh

#### Course Catalog
- **Course Browsing**: Filter and search courses by status, impact type, tags, and author
- **Course Details**: Comprehensive course information with modules, lessons, and prerequisites
- **Course Management**: Instructors and admins can create, update, and publish courses
- **Course Status**: Draft, Published, and Archived states for content management

#### Enrollment
- **Self-Enrollment**: Students can enroll in published courses
- **Progress Tracking**: Real-time progress monitoring with completion percentages
- **Enrollment Management**: View enrolled courses, drop enrollments, and track completion

#### Course Player
- **Module-Based Learning**: Courses organized into modules with sequential lessons
- **Video Integration**: Video lessons with Mux streaming support
- **Interactive Content**: Text, images, and multimedia learning materials
- **Quiz Integration**: Embedded quizzes for knowledge assessment
- **Progress Persistence**: Save progress automatically as users complete lessons

#### Impact Project Submission
- **Assignment Creation**: Instructors create assignments linked to courses
- **File Uploads**: Support for images, documents, and videos (up to 10MB per file)
- **Geolocation Tagging**: Optional geotagging for project location verification
- **Metadata Support**: Additional notes and project details
- **Submission Review**: Instructors can grade and provide feedback on submissions

#### Leaderboard
- **XP System**: Experience points awarded for course completion and project participation
- **Top Users**: Public leaderboard showing top performers
- **User Rankings**: Individual rank tracking and position in leaderboard
- **Gamification**: Badge system for achievements and milestones

#### Certificate Verification
- **Certificate Generation**: Automatic certificate generation upon course completion
- **Certificate Display**: View and download certificates
- **Verification System**: Unique certificate IDs for verification
- **Course Certificates**: Track certificates by course and user

#### Admin Features
- **User Management**: View and manage all users
- **Course Approval**: Approve or reject course submissions
- **Content Moderation**: Manage courses, assignments, and submissions
- **Analytics Dashboard**: View platform statistics and user engagement metrics

#### Testing Coverage
- **Unit Tests**: Backend API endpoints tested with Jest and Supertest
- **Integration Tests**: Full API workflow testing with MongoDB Memory Server
- **Component Tests**: React components tested with Vitest and React Testing Library
- **E2E Tests**: End-to-end user flows tested with Playwright
- **Test Coverage**: Comprehensive coverage of critical paths (>70% target)

---

## 3. Tech Stack

### Backend
- **Node.js** (v18+) - JavaScript runtime environment
- **Express.js** - Web application framework for RESTful APIs
- **TypeScript** - Type-safe JavaScript development
- **MongoDB** - NoSQL database for flexible data storage
- **MongoDB Atlas** - Cloud-hosted database solution
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing and security
- **Passport.js** - Authentication middleware
- **passport-google-oauth20** - Google OAuth integration
- **Multer** - File upload handling
- **Express Validator** - Input validation and sanitization
- **Redis (ioredis)** - Caching and session management (optional)
- **BullMQ** - Job queue management (optional)

### Frontend
- **React.js** (v18) - Modern UI library for building interactive interfaces
- **TypeScript** - Type-safe React development
- **React Router** (v6) - Client-side routing and navigation
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API requests
- **PWA Support** - Progressive Web App capabilities

### Testing
- **Jest** - Backend unit and integration testing
- **Supertest** - HTTP assertion library for API testing
- **Vitest** - Fast unit test framework for frontend
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing framework
- **MongoDB Memory Server** - In-memory MongoDB for testing

### DevOps & Tools
- **Git & GitHub** - Version control and collaboration
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-reload
- **dotenv** - Environment variable management

### Deployment
- **Render** - Backend deployment platform
- **Vercel/Netlify** - Frontend deployment platform
- **MongoDB Atlas** - Cloud database hosting
- **CI/CD** - GitHub Actions for automated testing and deployment

---

## 4. System Architecture

### Folder Structure

```
mern-final-project-graceakhati-dev/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   └── assets/                  # Images, icons, illustrations
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── courses/             # Course-related components
│   │   │   └── common/              # Shared components
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/                # Login, Signup pages
│   │   │   ├── student/             # Student dashboard and pages
│   │   │   ├── instructor/          # Instructor dashboard and pages
│   │   │   └── admin/               # Admin dashboard and pages
│   │   ├── context/                 # React Context providers
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── services/                # API service layer
│   │   │   ├── authService.ts       # Authentication API calls
│   │   │   └── courseService.ts     # Course API calls
│   │   ├── store/                   # Zustand state management
│   │   │   └── useAuthStore.ts      # Auth state store
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # App entry point
│   ├── tests/                       # Test files
│   │   └── e2e/                     # End-to-end tests
│   ├── playwright.config.ts        # Playwright configuration
│   ├── vitest.config.ts             # Vitest configuration
│   ├── vite.config.ts               # Vite configuration
│   └── package.json
│
├── server/                          # Backend Express application
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.ts    # Authentication logic
│   │   │   ├── courseController.ts  # Course CRUD operations
│   │   │   ├── enrollmentController.ts
│   │   │   ├── submissionController.ts
│   │   │   └── certificateController.ts
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts              # User model
│   │   │   ├── Course.ts            # Course model
│   │   │   ├── Module.ts            # Module model
│   │   │   ├── Lesson.ts            # Lesson model
│   │   │   ├── Quiz.ts              # Quiz model
│   │   │   ├── Assignment.ts        # Assignment model
│   │   │   ├── Submission.ts        # Submission model
│   │   │   ├── Enrollment.ts        # Enrollment model
│   │   │   └── Certificate.ts       # Certificate model
│   │   ├── routes/                  # Express routes
│   │   │   ├── authRoutes.ts        # Authentication routes
│   │   │   ├── googleAuthRoutes.ts  # Google OAuth routes
│   │   │   ├── courseRoutes.ts      # Course routes
│   │   │   ├── enrollmentRoutes.ts
│   │   │   ├── submissionRoutes.ts
│   │   │   └── certificateRoutes.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # JWT authentication middleware
│   │   │   └── errorHandler.ts      # Error handling middleware
│   │   ├── services/                # Business logic services
│   │   ├── utils/                   # Utility functions
│   │   ├── app.ts                   # Express app configuration
│   │   └── server.ts                # Server entry point
│   ├── tests/                       # Test files
│   │   ├── auth.test.ts             # Auth endpoint tests
│   │   ├── courses.test.ts          # Course endpoint tests
│   │   └── setup.ts                 # Test setup utilities
│   ├── docs/                        # API documentation
│   │   └── API_DOCUMENTATION.md     # Complete API docs
│   ├── jest.config.js               # Jest configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── package.json
│
├── docs/                            # Project documentation
│   ├── concept-note.md              # Project concept
│   ├── problem-statement.md         # Problem definition
│   └── wireframes/                  # UI wireframes
│
├── package.json                     # Root package.json (workspaces)
├── LICENSE                          # MIT License
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Pages  │  │Components│  │ Services │  │  Store   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
│                          │ HTTP/REST API                     │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   Backend (Express.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │→ │Middleware│→ │Controller│→ │ Services │   │
│  └──────────┘  └──────────┘  └────┬─────┘  └────┬─────┘   │
│                                    │             │          │
│                                    │             │          │
└────────────────────────────────────┼─────────────┼──────────┘
                                     │             │
                          ┌───────────┴──┐  ┌──────┴──────┐
                          │   MongoDB    │  │   Redis    │
                          │   (Atlas)    │  │  (Cache)    │
                          └──────────────┘  └─────────────┘
```

### API Flow Summary

1. **Client Request** → Frontend makes HTTP request via Axios
2. **Route Handler** → Express routes match request to appropriate handler
3. **Authentication Middleware** → JWT token validated (if protected route)
4. **Authorization Check** → Role-based permissions verified
5. **Controller** → Business logic executed
6. **Service Layer** → Database operations and external API calls
7. **Database** → MongoDB queries executed
8. **Response** → JSON response sent back to client

### Database Schema Overview

#### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['student', 'instructor', 'admin'],
  xp: Number (default: 0),
  badges: [String],
  googleId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### Course Collection
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique, indexed),
  description: String,
  authorId: ObjectId (ref: User),
  modules: [ObjectId] (ref: Module),
  tags: [String],
  price: Number,
  impact_type: Enum ['climate', 'waste', 'energy', 'water', 'community', 'other'],
  status: Enum ['draft', 'published', 'archived'],
  createdAt: Date,
  updatedAt: Date
}
```

#### Enrollment Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  progress: Number (0-100),
  status: Enum ['active', 'completed', 'dropped'],
  enrolledAt: Date,
  completedAt: Date
}
```

#### Submission Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  assignmentId: ObjectId (ref: Assignment),
  courseId: ObjectId (ref: Course),
  files: [String] (file URLs),
  metadata: {
    geotag: { lat: Number, lng: Number },
    notes: String
  },
  score: Number,
  feedback: String,
  status: Enum ['submitted', 'graded', 'rejected'],
  submittedAt: Date,
  gradedAt: Date
}
```

#### Certificate Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  certificateId: String (unique),
  issuedAt: Date,
  verified: Boolean
}
```

---

## 5. Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (or local MongoDB installation)
- **Git** for version control
- **Google Cloud Console** account (for OAuth - optional)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/PLP-MERN-Stack-Development/mern-final-project-graceakhati-dev.git
cd mern-final-project-graceakhati-dev
```

#### 2. Install Dependencies

**Option A: Install from root (recommended)**
```bash
npm install
```

**Option B: Install individually**
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

#### 3. Environment Variables Setup

**Backend Environment Variables** (`server/.env`)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string
# Example: mongodb+srv://username:password@cluster.mongodb.net/planetpath?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3001

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Redis (Optional - for caching)
REDIS_URL=your_redis_connection_string

# File Upload (Optional - for S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
```

**Frontend Environment Variables** (`client/.env`)

Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5001
```

#### 4. Database Setup

**MongoDB Atlas Setup:**
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `MONGODB_URI`

**Local MongoDB Setup:**
```bash
# Install MongoDB locally (if not using Atlas)
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
mongod
```

#### 5. Run Development Servers

**Option A: Run both servers from root**
```bash
npm run dev
```

**Option B: Run servers individually**

**Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Frontend Server:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3001
```

#### 6. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Documentation**: See `server/docs/API_DOCUMENTATION.md`

---

## 6. API Documentation

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-backend-url.render.com`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "xp": 0,
      "badges": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
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

**Response:** Same as register endpoint

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Google OAuth
```http
GET /api/auth/google
```

Redirects to Google OAuth, then back to frontend with token.

### Course Endpoints

#### Get All Courses
```http
GET /api/courses?status=published&page=1&limit=10&impact_type=climate
```

**Query Parameters:**
- `status`: `draft`, `published`, `archived`
- `impact_type`: `climate`, `waste`, `energy`, `water`, `community`, `other`
- `tags`: Array of tag strings
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field, prefix with `-` for descending

#### Get Course by ID
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

### Enrollment Endpoints

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

### Submission Endpoints

#### Submit Assignment (Multipart/Form-Data)
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: multipart/form-data

assignmentId: 507f1f77bcf86cd799439011
courseId: 507f1f77bcf86cd799439012
files: [file1.jpg, file2.pdf]
metadata: {"geotag":{"lat":40.7128,"lng":-74.0060},"notes":"Completed"}
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

### Leaderboard Endpoints

#### Get Top Users
```http
GET /api/leaderboard/top?limit=10
```

#### Get User Rank
```http
GET /api/leaderboard/rank/:userId
Authorization: Bearer <token>
```

### Certificate Endpoints

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

#### Get User Certificates
```http
GET /api/certificates/user/:userId
Authorization: Bearer <token>
```

### Error Responses

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
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

For complete API documentation, see `server/docs/API_DOCUMENTATION.md`.

---

## 7. Testing Documentation

### Testing Tools

- **Jest** - Backend unit and integration testing
- **Supertest** - HTTP assertion library for API testing
- **Vitest** - Fast unit test framework for frontend
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing framework
- **MongoDB Memory Server** - In-memory MongoDB for isolated testing

### Running Tests

#### Backend Tests

**Run all backend tests:**
```bash
cd server
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run specific test file:**
```bash
npm test -- auth.test.ts
npm test -- courses.test.ts
```

#### Frontend Tests

**Run all frontend unit tests:**
```bash
cd client
npm test
```

**Run tests with UI:**
```bash
npm run test:ui
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run specific test file:**
```bash
npm test CourseCard.test.tsx
```

#### End-to-End Tests

**Run all E2E tests:**
```bash
cd client
npm run test:e2e
```

**Run E2E tests with UI:**
```bash
npm run test:e2e:ui
```

**Run E2E tests in headed mode:**
```bash
npm run test:e2e:headed
```

**Run E2E tests in debug mode:**
```bash
npm run test:e2e:debug
```

**Run specific E2E test file:**
```bash
npx playwright test tests/e2e/auth-flow.spec.ts
```

### Test Coverage

#### Backend Test Coverage

**Auth Endpoints (`auth.test.ts`):**
- ✅ User registration with validation
- ✅ User login with credentials
- ✅ Password hashing verification
- ✅ JWT token generation
- ✅ Duplicate email prevention
- ✅ Invalid credentials handling

**Course Endpoints (`courses.test.ts`):**
- ✅ Get all courses with filtering
- ✅ Get course by ID or slug
- ✅ Create course (authorized users only)
- ✅ Update course (author/admin only)
- ✅ Delete course (author/admin only)
- ✅ Validation error handling
- ✅ Unauthorized access prevention

**Total Backend Tests:** 50+ tests covering all critical endpoints

#### Frontend Test Coverage

**Component Tests:**
- ✅ CourseCard component rendering and interactions
- ✅ CoursePlayer component with enrollment flow
- ✅ SubmitProjectModal component with file uploads
- ✅ ProtectedRoute component with role-based access
- ✅ NavBar component with authentication states
- ✅ Layout component structure

**Service Tests:**
- ✅ AuthService API calls
- ✅ CourseService API calls
- ✅ Error handling in services

**Total Frontend Tests:** 35+ component and service tests

#### E2E Test Coverage

**User Flows:**
- ✅ Authentication flow (signup, login, logout)
- ✅ Student course flow (browse, enroll, start course)
- ✅ Project submission flow (submit with files and geolocation)
- ✅ Instructor flow (dashboard, view submissions, grade)
- ✅ Admin flow (dashboard, role protection, course approval)

**Total E2E Tests:** 15+ end-to-end user journey tests

### Test Configuration

**Backend Test Setup:**
- Uses MongoDB Memory Server for isolated testing
- Database cleared between tests
- JWT tokens generated with test secret
- Test data created in `beforeEach` hooks

**Frontend Test Setup:**
- Uses Vitest with jsdom environment
- React Testing Library for component testing
- Mocked API responses for service tests
- Isolated component rendering

**E2E Test Setup:**
- Playwright configured for Chromium, Firefox, and WebKit
- Mobile viewport testing included
- Automatic dev server startup
- Screenshot and video capture on failure

### Expected Test Coverage Summary

- **Backend API Endpoints:** >80% coverage
- **Frontend Components:** >70% coverage
- **Critical User Flows:** 100% E2E coverage
- **Authentication & Authorization:** 100% coverage
- **Error Handling:** >90% coverage

---

## 8. Deployment

### Deployment Links

- **Frontend**: https://the-planet-path.netlify.app/
- **Backend API**: https://planet-path-backend.onrender.com/
- **API Documentation**: See `server/docs/API_DOCUMENTATION.md`
- **Project oresentation**: https://www.canva.com/design/DAG46vhw0rA/qxY9srYk8bB2q3jLfOYgQQ/edit?utm_content=DAG46vhw0rA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

### Deployment Platforms

#### Backend Deployment (Render)

1. **Create Render Account**
   - Sign up at https://render.com
   - Connect your GitHub repository

2. **Create Web Service**
   - Select "New Web Service"
   - Connect repository: `mern-final-project-graceakhati-dev`
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment: `Node`

3. **Configure Environment Variables**
   - Add all variables from `server/.env`
   - Set `NODE_ENV=production`
   - Update `CLIENT_URL` to frontend URL
   - Add MongoDB Atlas connection string
   - Add JWT_SECRET (generate strong secret)

4. **Deploy**
   - Render will automatically deploy on push to main branch
   - Check deployment logs for any issues

#### Frontend Deployment (Netlify)

1. **Create Netlify Account**
   - Sign up at https://netlify.com
   - Connect your GitHub repository

2. **Build Settings**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

3. **Environment Variables**
   - Add `VITE_API_URL` in Site settings
   - Add `VITE_SOCKET_URL` if needed

4. **Deploy**
   - Netlify will automatically deploy on push to main branch

### Build & Deploy Instructions

#### Backend Build

```bash
cd server
npm install
npm run build
npm start
```

#### Frontend Build

```bash
cd client
npm install
npm run build
# Output: client/dist/
```

### Production Checklist

- [ ] Environment variables configured in deployment platform
- [ ] MongoDB Atlas connection string set
- [ ] JWT_SECRET set to strong random string
- [ ] CORS configured to allow frontend domain
- [ ] Google OAuth redirect URIs updated in Google Console
- [ ] Frontend API URL points to production backend
- [ ] Database indexes created for performance
- [ ] Error logging configured (optional: Sentry)
- [ ] Monitoring set up (optional: Uptime monitoring)

### CI/CD Pipeline

**GitHub Actions** (optional):

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd server && npm test
      - run: cd client && npm test
```

---




## 10. Screenshots

### Landing Page
![Landing Page](screenshots/landing-page.png)
*Welcome page with course highlights and call-to-action*

### Landing Page
![Landing Page](screenshots/student-profile.png)
*Profile page with student information*

### Course Catalog
![Course Catalog](screenshots/course-catalog.png)
*Browse available courses with filtering options*

### Certification Page
![Certification](screenshots/certification.png)
*Generated certificate with verification ID*

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)
*Student dashboard with enrolled courses and progress*

### Student Achievements
![Instructor Dashboard](screenshots/student-achievements.png)
*Page showing student badges for completing mini-courses*
---

## 11. Roadmap

### Phase 1: Core Features (Completed ✅)
- [x] User authentication (JWT + Google OAuth)
- [x] Course catalog and browsing
- [x] Course enrollment and progress tracking
- [x] Course player with video integration
- [x] Impact project submission system
- [x] Leaderboard and XP system
- [x] Certificate generation and verification

### Phase 2: Enhanced Features (In Progress)
- [ ] AI-powered impact verification assistant
- [ ] Advanced search and filtering
- [ ] Course recommendations based on user interests
- [ ] Social features (comments, discussions)
- [ ] Mobile app (React Native)
- [ ] Offline course downloading
- [ ] Push notifications

### Phase 3: Monetization & Scaling
- [ ] Premium subscription tier
- [ ] Micro-grant application system
- [ ] Payment integration (M-PESA, IntaSend)
- [ ] Enterprise partnerships and bulk licenses
- [ ] White-label solutions for organizations
- [ ] Advanced analytics dashboard

### Phase 4: Advanced Features
- [ ] Blockchain-verified certificates
- [ ] Carbon credit tracking
- [ ] Community project marketplace
- [ ] Mentorship program
- [ ] Job board integration
- [ ] Multi-language support

### Phase 5: Expansion
- [ ] Expand to other African countries
- [ ] Partner with more NGOs and environmental organizations
- [ ] Integration with carbon market platforms
- [ ] Government partnerships for climate education
- [ ] Research and impact measurement tools

---

## 12. Lessons Learned

### Technical Challenges

#### 1. Authentication & Authorization
**Challenge:** Implementing secure JWT authentication with role-based access control across frontend and backend.

**Solution:** 
- Used `jsonwebtoken` library for token generation and verification
- Created reusable authentication middleware for Express routes
- Implemented ProtectedRoute component in React for frontend route protection
- Stored JWT tokens in localStorage with automatic refresh mechanism

**Key Learnings:**
- Always validate tokens on both client and server side
- Use secure HTTP-only cookies for production (instead of localStorage)
- Implement token expiration and refresh strategies
- Role-based access control requires careful middleware design

#### 2. File Upload Handling
**Challenge:** Handling multipart/form-data file uploads with validation, storage, and metadata.

**Solution:**
- Used Multer middleware for file upload handling
- Implemented file type and size validation
- Created metadata parsing for geolocation and notes
- Set up both local storage and S3 integration options

**Key Learnings:**
- Always validate file types and sizes on server side
- Use streaming for large files to avoid memory issues
- Implement proper error handling for upload failures
- Consider CDN for file serving in production

#### 3. State Management
**Challenge:** Managing authentication state across React components and persisting across page refreshes.

**Solution:**
- Used Zustand for lightweight state management
- Implemented React Context for authentication
- Synced state with localStorage for persistence
- Created custom hooks for easy state access

**Key Learnings:**
- Choose state management solution based on complexity
- Always persist critical state (like auth) to localStorage
- Avoid prop drilling with Context API
- Keep state management simple and predictable

#### 4. Database Schema Design
**Challenge:** Designing flexible MongoDB schemas that support complex relationships and queries.

**Solution:**
- Used Mongoose for schema definition and validation
- Implemented proper indexing for frequently queried fields
- Created reference relationships between collections
- Used virtual fields for computed properties

**Key Learnings:**
- Plan indexes early based on query patterns
- Use references for relationships, not embedded documents
- Validate data at schema level, not just application level
- Consider denormalization for read-heavy operations

### Debugging Insights

#### 1. CORS Issues
**Problem:** Frontend couldn't make API requests due to CORS errors.

**Solution:** 
- Configured Express CORS middleware with proper origin
- Added credentials support for authenticated requests
- Set up environment-specific CORS configurations

**Insight:** Always configure CORS correctly from the start, and test with actual frontend URL, not just localhost.

#### 2. Environment Variables
**Problem:** Environment variables not loading correctly in different environments.

**Solution:**
- Used `dotenv` for local development
- Created `.env.example` files as templates
- Documented all required environment variables
- Used different configs for dev, test, and production

**Insight:** Environment variable management is critical - always document required variables and provide examples.

#### 3. Async/Await Errors
**Problem:** Unhandled promise rejections causing crashes.

**Solution:**
- Always wrapped async functions in try-catch blocks
- Used proper error handling middleware in Express
- Implemented error boundaries in React
- Added comprehensive error logging

**Insight:** Proper error handling prevents production crashes and improves debugging experience.

### Testing Lessons

#### 1. Test Isolation
**Challenge:** Tests interfering with each other due to shared state.

**Solution:**
- Used MongoDB Memory Server for isolated test databases
- Cleared database between tests
- Created test data factories for consistent test data
- Used beforeEach/afterEach hooks for cleanup

**Insight:** Test isolation is crucial for reliable, repeatable tests. Always clean up test data.

#### 2. E2E Test Stability
**Challenge:** E2E tests flaky due to timing issues and async operations.

**Solution:**
- Increased timeouts for slow operations
- Used Playwright's waitFor methods instead of fixed delays
- Ran tests sequentially to avoid race conditions
- Added proper test data setup and teardown

**Insight:** E2E tests require careful timing and proper waits. Avoid fixed delays, use proper wait strategies.

#### 3. Mocking Strategy
**Challenge:** Deciding what to mock vs. what to test with real implementations.

**Solution:**
- Mocked external APIs (Google OAuth, payment gateways)
- Used real database for integration tests
- Mocked API responses for component tests
- Used real API calls for E2E tests

**Insight:** Mock external dependencies, but test real implementations for your own code. Balance speed vs. realism.

### Deployment Lessons

#### 1. Environment Configuration
**Challenge:** Different configurations needed for development, staging, and production.

**Solution:**
- Used environment variables for all configuration
- Created separate config files for each environment
- Documented all required environment variables
- Used platform-specific deployment configs (Render, Vercel)

**Insight:** Environment-based configuration is essential. Never hardcode values that differ between environments.

#### 2. Build Optimization
**Challenge:** Large bundle sizes causing slow load times.

**Solution:**
- Used Vite for fast builds and code splitting
- Implemented lazy loading for routes
- Optimized images and assets
- Used production builds with minification

**Insight:** Build optimization is crucial for user experience. Monitor bundle sizes and optimize continuously.

#### 3. Database Migrations
**Challenge:** Schema changes needed careful migration strategy.

**Solution:**
- Used Mongoose schema versioning
- Created migration scripts for schema changes
- Tested migrations on staging before production
- Documented all schema changes

**Insight:** Plan for database migrations from the start. Test migrations thoroughly before production.

### General Best Practices

1. **Code Organization:** Keep code modular and organized. Separate concerns (routes, controllers, services, models).

2. **Error Handling:** Always handle errors gracefully. Provide meaningful error messages to users.

3. **Security:** Never trust client-side validation alone. Always validate on server side. Use HTTPS in production.

4. **Documentation:** Document code, APIs, and setup processes. Future you (and others) will thank you.

5. **Testing:** Write tests as you develop, not after. Tests catch bugs early and serve as documentation.

6. **Version Control:** Commit often with meaningful messages. Use branches for features and fixes.

7. **Performance:** Monitor performance from the start. Optimize queries, use caching, and minimize API calls.

8. **User Experience:** Always consider the user's perspective. Make interfaces intuitive and error messages helpful.

---

## 13. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Grace Akhati**
- GitHub: [@graceakhati-dev](https://github.com/graceakhati-dev)
- Repository: [mern-final-project-graceakhati-dev](https://github.com/PLP-MERN-Stack-Development/mern-final-project-graceakhati-dev)

---

## Acknowledgments

- Power Learn Project (PLP) - MERN Stack Development 

---

**Built with ❤️ for Climate Action**
