# E2E Test Suite

End-to-end tests for Planet Path using Playwright.

## Setup

1. **Install Playwright:**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Create test environment file:**
   ```bash
   cp .env.test.example .env.test
   ```
   
   Edit `.env.test` and add your test account credentials.

3. **Run tests:**
   ```bash
   # Run all E2E tests
   npm run test:e2e

   # Run with UI
   npm run test:e2e:ui

   # Run in headed mode (see browser)
   npm run test:e2e:headed

   # Debug tests
   npm run test:e2e:debug
   ```

## Test Files

- `auth-flow.spec.ts` - User signup, login, logout flows
- `student-course-flow.spec.ts` - View courses, enroll, start course
- `submit-project-flow.spec.ts` - Submit project with image and geolocation
- `instructor-flow.spec.ts` - Instructor dashboard, view submissions, grade
- `admin-flow.spec.ts` - Admin dashboard, role protection, course approval

## Helpers

- `helpers/auth-helpers.ts` - Authentication helper functions
- `helpers/api-helpers.ts` - API mocking helpers

## Test Accounts

Test accounts are configured via `.env.test`:

- `E2E_TEST_STUDENT_EMAIL` - Student test account email
- `E2E_TEST_STUDENT_PASSWORD` - Student test account password
- `E2E_TEST_INSTRUCTOR_EMAIL` - Instructor test account email
- `E2E_TEST_INSTRUCTOR_PASSWORD` - Instructor test account password
- `E2E_TEST_ADMIN_EMAIL` - Admin test account email
- `E2E_TEST_ADMIN_PASSWORD` - Admin test account password

## Notes

- Tests use mocked backend API responses for stability
- Tests run against `http://localhost:3000` by default
- All tests include proper cleanup and isolation
- Tests use `data-testid` attributes where available

