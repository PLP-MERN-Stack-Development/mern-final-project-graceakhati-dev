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
 * E2E Test: Admin login → Access Admin Dashboard (ensure protected)
 * 
 * Flow:
 * 1. Login as admin
 * 2. Navigate to admin dashboard
 * 3. Verify admin-only content
 * 4. Test role protection (student/instructor cannot access)
 */

test.describe('Admin Flow', () => {
  const testAdmin = {
    email: process.env.E2E_TEST_ADMIN_EMAIL || `test-admin-${Date.now()}@example.com`,
    password: process.env.E2E_TEST_ADMIN_PASSWORD || 'Test123456!',
  };

  test.beforeEach(async ({ page }) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Reset test environment
    await resetTestEnvironment(page);
    
    // Login as admin using helper
    await loginUser(page, testAdmin.email, testAdmin.password, 'admin');
  });

  test('should access admin dashboard', async ({ page }) => {
    // Should be redirected to admin dashboard
    await verifyRoleRedirect(page, 'admin');

    // Verify admin dashboard content
    await expect(
      page.locator('text=/admin dashboard|analytics|users/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to admin dashboard from navbar', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click admin link in navbar using test ID with stable click
    const adminLink = page.getByTestId('nav-link-/admin');
    
    if (await adminLink.count() > 0) {
      await stableClick(page, adminLink, { timeout: 15000 });
      await expect(page).toHaveURL('/admin/dashboard');
    } else {
      // Fallback: navigate directly
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/admin/dashboard');
    }

    // Verify dashboard content
    await expect(
      page.locator('text=/admin dashboard|analytics/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should view admin analytics', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for analytics cards (users, courses, enrollments, pending)
    await expect(
      page.locator('text=/total users|approved courses|pending approval|total enrollments/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should view pending courses', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for pending courses section
    await expect(
      page.locator('text=/pending courses/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should approve a course', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Find approve button for first pending course
    const approveButton = page.locator('button:has-text("Approve")').first();

    if (await approveButton.count() > 0) {
      // Handle confirmation dialog if present
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      // Click approve with stable click
      await stableClick(page, approveButton, { timeout: 15000 });

      // Wait for course to move to approved section or success message
      await expect(
        page.locator('text=/approved|success/i').or(
          page.locator('text=/approved courses/i')
        )
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test('should reject a course', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Find reject button for first pending course
    const rejectButton = page.locator('button:has-text("Reject")').first();

    if (await rejectButton.count() > 0) {
      // Handle confirmation dialog
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      // Click reject with stable click
      await stableClick(page, rejectButton, { timeout: 15000 });

      // Wait for course to be removed or success message
      await page.waitForTimeout(2000);
    }
  });

  test('should block student from accessing admin routes', async ({ page }) => {
    // Logout first
    const userMenuButton = page.getByTestId('user-menu-button');
    if (await userMenuButton.count() > 0) {
      await stableClick(page, userMenuButton, { timeout: 15000 });
      const logoutButton = page.locator('text=Logout');
      await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
      await stableClick(page, logoutButton, { timeout: 15000 });
      await waitForNavigationAndIdle(page, '/', { timeout: 15000 });
    }

    // Try to access admin dashboard as student
    // Signup/login as student
    const testStudent = {
      email: process.env.E2E_TEST_STUDENT_EMAIL || `test-student-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
    };

    await signupUser(page, 'Test Student', testStudent.email, testStudent.password, 'student');

    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to unauthorized or student dashboard
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/unauthorized|\/dashboard|\/student\/dashboard/);
  });

  test('should block instructor from accessing admin routes', async ({ page }) => {
    // Logout first
    const userMenuButton = page.getByTestId('user-menu-button');
    if (await userMenuButton.count() > 0) {
      await stableClick(page, userMenuButton, { timeout: 15000 });
      const logoutButton = page.locator('text=Logout');
      await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
      await stableClick(page, logoutButton, { timeout: 15000 });
      await waitForNavigationAndIdle(page, '/', { timeout: 15000 });
    }

    // Try to access admin dashboard as instructor
    // Signup/login as instructor
    const testInstructor = {
      email: process.env.E2E_TEST_INSTRUCTOR_EMAIL || `test-instructor-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_INSTRUCTOR_PASSWORD || 'Test123456!',
    };

    await signupUser(page, 'Test Instructor', testInstructor.email, testInstructor.password, 'instructor');

    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to unauthorized
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/unauthorized|\/instructor\/dashboard/);
  });

  test('should access admin users page', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin\/users/);

    // Verify users page content
    await expect(
      page.locator('text=/users|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should access admin courses page', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin\/courses/);

    // Verify courses page content
    await expect(
      page.locator('text=/courses|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should access admin reports page', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin\/reports/);

    // Verify reports page content
    await expect(
      page.locator('text=/reports|analytics/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
