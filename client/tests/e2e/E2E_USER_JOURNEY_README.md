# E2E Test: Complete User Journey

**Test File:** `complete-user-journey.spec.ts`  
**Framework:** Playwright  
**Status:** ✅ Ready for Execution

---

## Overview

This E2E test covers the complete user journey from signup to project submission, verifying the entire flow works correctly end-to-end.

---

## Test Flow

### 1. Opens the App ✅
- Navigates to home page (`/`)
- Verifies landing page loads
- Checks for welcome/hero content

### 2. Signs Up a New User ✅
- Navigates to signup page (`/signup`)
- Fills signup form:
  - Full name
  - Email (unique timestamp-based)
  - Password
  - Confirm password
  - Role (student)
- Submits form
- Verifies redirect to student dashboard
- Verifies authentication state

### 3. Enrolls in a Course ✅
- Navigates to courses page (`/courses`)
- Finds first available course
- Clicks on course card
- Navigates to course page
- Clicks "Enroll in Course" button
- Verifies enrollment success
- Verifies "Enrolled" badge appears

### 4. Completes and Submits an Impact Project ✅
- Clicks "Submit Project" button
- Waits for modal to open
- Fills project form:
  - Description (detailed project description)
  - Image upload (test PNG image)
  - Geolocation (optional, mocked)
- Submits project form
- Waits for submission to complete

### 5. Checks for Confirmation ✅
- Verifies success message appears
- Checks for AI score display
- Checks for verification status
- Verifies modal closes
- Verifies still on course page
- Verifies submit button disabled/shows "Already Submitted"
- Optionally checks dashboard for submission

---

## Test Scenarios

### Test 1: Complete User Journey
**Description:** Full flow from signup to project submission  
**Steps:**
1. Open app
2. Sign up new user
3. Enroll in course
4. Submit project
5. Verify confirmation

**Expected Result:** All steps complete successfully with proper confirmations

---

### Test 2: Project Submission with All Fields
**Description:** Detailed test of project submission with all optional fields  
**Steps:**
1. Sign up and enroll (setup)
2. Submit project with:
   - Description
   - Image
   - Geolocation
3. Verify success

**Expected Result:** Project submitted successfully with all fields

---

## Test Data

### Test User
- **Name:** `E2E Test User {timestamp}`
- **Email:** `e2e-test-{timestamp}@example.com`
- **Password:** `Test123456!`
- **Role:** `student`

**Note:** Email includes timestamp to ensure uniqueness and avoid conflicts

---

## Prerequisites

1. **Backend Server Running**
   - API server must be running on configured port
   - Database must be accessible
   - Test data should be available (courses, assignments)

2. **Frontend Server Running**
   - Dev server on `http://localhost:3000` (or configured base URL)
   - Playwright will start server automatically if configured

3. **Test Environment**
   - `.env.test` file configured (optional)
   - Test user credentials (if using existing accounts)

---

## Running the Test

### Run All E2E Tests
```bash
cd client
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test complete-user-journey.spec.ts
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Run with Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Test Configuration

### Base URL
- Default: `http://localhost:3000`
- Configurable via `PLAYWRIGHT_TEST_BASE_URL` environment variable

### Timeouts
- **Action Timeout:** 15 seconds
- **Navigation Timeout:** 30 seconds
- **Success Message Wait:** 15 seconds

### Retries
- **CI:** 2 retries
- **Local:** 0 retries

---

## Test Helpers Used

### `setupTestPage(page)`
- Blocks analytics endpoints
- Mocks external services
- Sets up route interception

### `resetTestEnvironment(page)`
- Clears localStorage
- Clears sessionStorage
- Clears cookies

### `waitForNavigationAndIdle(page, url, options)`
- Waits for URL navigation
- Waits for network idle state
- Handles timeouts

---

## Assertions

### Authentication
- ✅ User redirected to dashboard after signup
- ✅ Navbar visible (authenticated state)
- ✅ User menu button visible

### Course Enrollment
- ✅ Course page loads
- ✅ Enroll button visible
- ✅ Enrollment success message/badge
- ✅ "Enrolled" state visible

### Project Submission
- ✅ Submit modal opens
- ✅ Form fields accessible
- ✅ Image upload works
- ✅ Geolocation capture works (optional)
- ✅ Form submission succeeds
- ✅ Success message appears
- ✅ AI score displayed (if available)
- ✅ Verification status shown (if score >= 60)
- ✅ Modal closes after submission
- ✅ Submit button disabled/shows "Already Submitted"

---

## Known Limitations

1. **Test Data Dependency**
   - Requires at least one course in database
   - Requires course to have assignments
   - May skip if no courses available

2. **Geolocation**
   - Uses mocked geolocation API
   - May not work in all browsers
   - Optional field, test continues if unavailable

3. **AI Score**
   - Depends on backend AI scoring service
   - May not be available in test environment
   - Test verifies display if present

4. **Dashboard Updates**
   - Dashboard may not immediately show submissions
   - Verification is optional
   - Focus is on submission confirmation

---

## Troubleshooting

### Test Fails at Signup
- Check backend API is running
- Verify signup endpoint is accessible
- Check for duplicate email conflicts
- Verify form fields have correct test IDs

### Test Fails at Enrollment
- Verify courses exist in database
- Check course API endpoint
- Verify enrollment endpoint works
- Check for authentication issues

### Test Fails at Project Submission
- Verify assignments exist for course
- Check submission API endpoint
- Verify file upload works
- Check for validation errors

### Success Message Not Appearing
- Increase timeout in test
- Check backend response
- Verify success message text matches
- Check for JavaScript errors in console

---

## Best Practices

1. **Unique Test Data**
   - Uses timestamp-based emails
   - Avoids conflicts between test runs
   - Cleans up environment before each test

2. **Robust Selectors**
   - Uses test IDs where available
   - Falls back to text/content selectors
   - Handles multiple possible formats

3. **Error Handling**
   - Skips tests if prerequisites not met
   - Handles optional elements gracefully
   - Provides clear error messages

4. **Wait Strategies**
   - Uses `waitForLoadState('networkidle')`
   - Waits for specific elements
   - Uses appropriate timeouts

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    cd client
    npx playwright test
  env:
    PLAYWRIGHT_TEST_BASE_URL: ${{ secrets.TEST_BASE_URL }}
```

### Environment Variables
- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for tests
- `E2E_TEST_STUDENT_EMAIL` - Test student email (optional)
- `E2E_TEST_STUDENT_PASSWORD` - Test student password (optional)

---

## Test Reports

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
- Location: `test-results/results.json`
- Format: Playwright JSON format
- Contains: Test results, screenshots, videos

---

## Maintenance

### When to Update
- When UI elements change (test IDs, text)
- When flow changes (new steps, different order)
- When API endpoints change
- When error messages change

### How to Update
1. Identify failing assertions
2. Update selectors/text matches
3. Adjust timeouts if needed
4. Update expected behaviors
5. Re-run tests to verify

---

**Last Updated:** 2024  
**Status:** ✅ Production Ready

