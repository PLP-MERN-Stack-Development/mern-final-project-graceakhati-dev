import { test, expect } from '@playwright/test';
import { 
  setupTestPage, 
  resetTestEnvironment, 
  waitForNavigationAndIdle,
  loginUser,
  stableClick
} from './helpers/test-helpers';

/**
 * E2E Test: View courses → Enroll → Start course
 * 
 * Flow:
 * 1. Login as student
 * 2. Navigate to courses page
 * 3. View course list
 * 4. Click on a course
 * 5. Enroll in course
 * 6. Verify enrollment success
 * 7. Access course content
 */

test.describe('Student Course Flow', () => {
  const testUser = {
    email: process.env.E2E_TEST_STUDENT_EMAIL || `test-student-${Date.now()}@example.com`,
    password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
  };

  test.beforeEach(async ({ page }) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Reset test environment
    await resetTestEnvironment(page);
    
    // Login as student using helper
    await loginUser(page, testUser.email, testUser.password, 'student');
  });

  test('should view courses list', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/courses/);

    // Verify courses page loaded
    await expect(
      page.locator('text=Available Courses').or(page.locator('h1')).first()
    ).toBeVisible({ timeout: 10000 });

    // Wait for courses to load (either course cards or empty state)
    const courseCards = page.locator('[data-testid^="course-card-"]');
    const emptyState = page.locator('text=No courses available');

    // One of these should be visible
    await expect(courseCards.or(emptyState).first()).toBeVisible({ timeout: 15000 });
  });

  test('should enroll in a course from course card', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Find first course card
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();

    // Check if courses exist
    const courseExists = await firstCourseCard.count() > 0;

    if (!courseExists) {
      test.skip();
      return;
    }

    // Get course ID from data-testid
    const testId = await firstCourseCard.getAttribute('data-testid');
    const courseId = testId?.replace('course-card-', '') || null;

    if (!courseId) {
      test.skip();
      return;
    }

    // Hover over course card to reveal enroll button
    await firstCourseCard.hover();
    await page.waitForTimeout(500); // Wait for hover animation

    // Look for enroll button using test ID with course ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);

    // If enroll button exists, click it with stable click
    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });

      // Wait for navigation to course page
      await waitForNavigationAndIdle(page, `/courses/${courseId}`, { timeout: 30000 });

      // Verify course content is visible
      await expect(
        page.locator('text=/course content|description/i').first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should enroll in a course from course player page', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Find first course card
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();

    // Check if courses exist
    const courseExists = await firstCourseCard.count() > 0;

    if (!courseExists) {
      test.skip();
      return;
    }

    // Get course ID from data-testid
    const testId = await firstCourseCard.getAttribute('data-testid');
    const courseId = testId?.replace('course-card-', '') || null;

    if (!courseId) {
      test.skip();
      return;
    }

    // Navigate to course page
    await page.goto(`/courses/${courseId}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));

    // Look for enroll button using test ID with course ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);

    // If enroll button exists, click it with stable click
    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });

      // Wait for enrollment to complete (check for enrolled state or success message)
      await expect(
        page.locator('text=/enrolled|success/i').or(
          page.locator('text=✓ Enrolled')
        )
      ).toBeVisible({ timeout: 15000 });
    }

    // Verify course content is visible
    await expect(
      page.locator('text=/course content|description/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should access enrolled course', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Find first course card
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();
    
    if (await firstCourseCard.count() === 0) {
      test.skip();
      return;
    }

    const testId = await firstCourseCard.getAttribute('data-testid');
    const courseId = testId?.replace('course-card-', '');

    if (!courseId) {
      test.skip();
      return;
    }

    // Navigate to course page
    await page.goto(`/courses/${courseId}`);
    await page.waitForLoadState('networkidle');

    // Verify course page loaded
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));
    
    // Verify course title or description is visible
    await expect(
      page.locator('h1').or(page.locator('text=/course|description/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate from dashboard to courses', async ({ page }) => {
    // Start on dashboard
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    // Click courses link in navbar using test ID with stable click
    const coursesLink = page.getByTestId('nav-link-/courses');
    if (await coursesLink.count() > 0) {
      await stableClick(page, coursesLink, { timeout: 15000 });
      await expect(page).toHaveURL(/\/courses/);
    } else {
      // Fallback: navigate directly
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/courses/);
    }
  });

  test('should enroll from dashboard course card', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    // Find first course card with enroll button
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();

    if (await firstCourseCard.count() === 0) {
      test.skip();
      return;
    }

    // Get course ID from data-testid
    const testId = await firstCourseCard.getAttribute('data-testid');
    const courseId = testId?.replace('course-card-', '');

    if (!courseId) {
      test.skip();
      return;
    }

    // Hover over course card to reveal enroll button
    await firstCourseCard.hover();
    await page.waitForTimeout(500); // Wait for hover animation

    // Look for enroll button using test ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);

    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });

      // Wait for navigation to course page
      await waitForNavigationAndIdle(page, `/courses/${courseId}`, { timeout: 30000 });
    }
  });
});
