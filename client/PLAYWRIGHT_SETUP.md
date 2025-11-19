# Playwright E2E Test Suite Setup

## Installation

1. **Install Playwright and dependencies:**
   ```bash
   npm install -D @playwright/test dotenv
   npx playwright install
   ```

2. **Create test environment file:**
   ```bash
   cp .env.test.example .env.test
   ```
   
   Edit `.env.test` and add your test account credentials:
   ```env
   E2E_TEST_STUDENT_EMAIL=test-student@example.com
   E2E_TEST_STUDENT_PASSWORD=Test123456!
   E2E_TEST_INSTRUCTOR_EMAIL=test-instructor@example.com
   E2E_TEST_INSTRUCTOR_PASSWORD=Test123456!
   E2E_TEST_ADMIN_EMAIL=test-admin@example.com
   E2E_TEST_ADMIN_PASSWORD=Test123456!
   PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
   ```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth-flow.spec.ts
```

## Test Structure

```
tests/e2e/
├── auth-flow.spec.ts          # Signup, login, logout flows
├── student-course-flow.spec.ts # View courses, enroll, start course
├── submit-project-flow.spec.ts # Submit project with image/geolocation
├── instructor-flow.spec.ts     # Instructor dashboard, submissions
├── admin-flow.spec.ts          # Admin dashboard, role protection
├── helpers/
│   ├── auth-helpers.ts         # Authentication helpers
│   └── api-helpers.ts          # API mocking helpers
└── README.md                   # Documentation
```

## Test Flows

### 1. Authentication Flow (`auth-flow.spec.ts`)
- User signup → Login → Dashboard loads
- Invalid login credentials
- Persist authentication after refresh
- Logout functionality

### 2. Student Course Flow (`student-course-flow.spec.ts`)
- View courses list
- Enroll in a course
- Access enrolled course
- Navigate from dashboard to courses

### 3. Submit Project Flow (`submit-project-flow.spec.ts`)
- Submit project with image and description
- Submit project with geolocation
- Validation errors for missing fields

### 4. Instructor Flow (`instructor-flow.spec.ts`)
- Access instructor dashboard
- View course creation form
- Create a course
- Role protection (block students)

### 5. Admin Flow (`admin-flow.spec.ts`)
- Access admin dashboard
- View analytics
- Approve/reject courses
- Role protection (block students/instructors)
- Access admin pages (users, courses, reports)

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Automatic dev server startup
- Screenshot and video on failure
- Trace collection for debugging

## API Mocking

Tests use mocked backend API responses for stability. The `api-helpers.ts` file provides:
- Mocked auth endpoints (login, register)
- Mocked courses endpoints
- Mocked enrollment endpoints
- Mocked submissions endpoints

To use real API, comment out the `setupApiMocks()` calls in test files.

## Notes

- Tests run against `http://localhost:3000` by default
- All tests include proper cleanup and isolation
- Tests use `data-testid` attributes where available
- Fallback selectors use text content and CSS selectors
- Tests skip gracefully if required elements are not found

