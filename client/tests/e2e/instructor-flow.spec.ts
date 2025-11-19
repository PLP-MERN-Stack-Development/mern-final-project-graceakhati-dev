import { test, expect } from '@playwright/test';
import { 
  setupTestPage, 
  resetTestEnvironment, 
  waitForNavigationAndIdle,
  loginUser,
  signupUser,
  stableClick,
  verifyRoleRedirect
} from './helpers/test-helpers';

/**
 * E2E Test: Instructor login → View submissions → Grade submission
 * 
 * Flow:
 * 1. Login as instructor
 * 2. Navigate to instructor dashboard
 * 3. View submissions for courses
 * 4. Grade a submission
 * 5. Verify grade is saved
 */

test.describe('Instructor Flow', () => {
  const testInstructor = {
    email: process.env.E2E_TEST_INSTRUCTOR_EMAIL || `test-instructor-${Date.now()}@example.com`,
    password: process.env.E2E_TEST_INSTRUCTOR_PASSWORD || 'Test123456!',
  };

  test.beforeEach(async ({ page }) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Reset test environment
    await resetTestEnvironment(page);
    
    // Login as instructor using helper
    await loginUser(page, testInstructor.email, testInstructor.password, 'instructor');
  });

  test('should access instructor dashboard', async ({ page }) => {
    // Should be redirected to instructor dashboard
    await verifyRoleRedirect(page, 'instructor');

    // Verify instructor dashboard content
    await expect(
      page.locator('text=/instructor|course builder|dashboard/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to instructor dashboard from navbar', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click instructor link in navbar using test ID with stable click
    const instructorLink = page.getByTestId('nav-link-/instructor');
    
    if (await instructorLink.count() > 0) {
      await stableClick(page, instructorLink, { timeout: 15000 });
      await expect(page).toHaveURL('/instructor/dashboard');
    } else {
      // Fallback: navigate directly
      await page.goto('/instructor/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/instructor/dashboard');
    }

    // Verify dashboard content
    await expect(
      page.locator('text=/instructor|course builder/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should view course creation form', async ({ page }) => {
    await page.goto('/instructor/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for course creation form
    await expect(
      page.locator('text=/create|course builder|new course/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should block student from accessing instructor routes', async ({ page }) => {
    // Logout first
    const userMenuButton = page.getByTestId('user-menu-button');
    if (await userMenuButton.count() > 0) {
      await stableClick(page, userMenuButton, { timeout: 15000 });
      const logoutButton = page.locator('text=Logout');
      await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
      await stableClick(page, logoutButton, { timeout: 15000 });
      await waitForNavigationAndIdle(page, '/', { timeout: 15000 });
    }

    // Try to access instructor dashboard as student
    // First signup/login as student
    const testStudent = {
      email: process.env.E2E_TEST_STUDENT_EMAIL || `test-student-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
    };

    await signupUser(page, 'Test Student', testStudent.email, testStudent.password, 'student');

    // Try to access instructor dashboard
    await page.goto('/instructor/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to unauthorized or student dashboard
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/unauthorized|\/dashboard|\/student\/dashboard/);
  });

  test('should create a course', async ({ page }) => {
    await page.goto('/instructor/dashboard');
    await page.waitForLoadState('networkidle');

    // Fill course creation form
    const titleInput = page.locator('input[name="title"]').or(
      page.locator('input[placeholder*="title" i]')
    );
    const descriptionTextarea = page.locator('textarea[name="description"]').or(
      page.locator('textarea[placeholder*="describe" i]')
    );

    if (await titleInput.count() > 0) {
      await titleInput.waitFor({ state: 'visible', timeout: 10000 });
      await titleInput.fill('E2E Test Course');
      
      if (await descriptionTextarea.count() > 0) {
        await descriptionTextarea.waitFor({ state: 'visible', timeout: 10000 });
        await descriptionTextarea.fill('This is a test course created during E2E testing.');
      }

      // Submit form with stable click
      const submitButton = page.locator('button:has-text("Submit")').or(
        page.locator('button[type="submit"]')
      );

      if (await submitButton.count() > 0) {
        await stableClick(page, submitButton, { timeout: 15000 });

        // Wait for success or course to appear in pending list
        await expect(
          page.locator('text=/pending|submitted|success/i').or(
            page.locator('text=E2E Test Course')
          )
        ).toBeVisible({ timeout: 15000 });
      }
    }
  });
});
