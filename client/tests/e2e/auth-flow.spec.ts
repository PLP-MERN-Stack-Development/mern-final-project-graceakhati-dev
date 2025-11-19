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
 * E2E Test: User Signup → Login → Dashboard loads
 * 
 * Flow:
 * 1. Navigate to signup page
 * 2. Fill signup form and submit
 * 3. Verify redirect to dashboard (role-based)
 * 4. Logout
 * 5. Login with same credentials
 * 6. Verify dashboard loads
 */

test.describe('Authentication Flow', () => {
  const testUser = {
    name: process.env.E2E_TEST_STUDENT_NAME || 'Test Student',
    email: process.env.E2E_TEST_STUDENT_EMAIL || `test-student-${Date.now()}@example.com`,
    password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
    role: 'student' as const,
  };

  test.beforeEach(async ({ page }) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Reset test environment
    await resetTestEnvironment(page);
    
    // Navigate to home and wait for network idle
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete signup flow and redirect to student dashboard', async ({ page }) => {
    // Use signup helper which handles form filling and redirect verification
    await signupUser(page, testUser.name, testUser.email, testUser.password, testUser.role);
    
    // Verify role-based redirect to student dashboard
    await verifyRoleRedirect(page, 'student');
    
    // Verify dashboard content is visible
    const dashboardContent = page.locator('text=My Learning Dashboard').or(page.locator('text=Welcome'));
    await expect(dashboardContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should login with existing credentials and redirect to student dashboard', async ({ page }) => {
    // Use login helper which handles form filling and redirect verification
    await loginUser(page, testUser.email, testUser.password, 'student');
    
    // Verify role-based redirect to student dashboard
    await verifyRoleRedirect(page, 'student');
    
    // Verify user is authenticated
    const userMenuButton = page.getByTestId('user-menu-button');
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/login/);

    // Fill with invalid credentials using test IDs
    const emailInput = page.getByTestId('email-input');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('invalid@example.com');
    
    const passwordInput = page.getByTestId('password-input');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('wrongpassword');

    // Submit form using stable click
    const loginButton = page.getByTestId('login-submit');
    await stableClick(page, loginButton, { timeout: 15000 });

    // Wait for error message
    await expect(page.locator('text=/invalid|error|failed/i').first()).toBeVisible({ timeout: 10000 });

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist authentication after page refresh', async ({ page }) => {
    // Login first
    await loginUser(page, testUser.email, testUser.password, 'student');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated and on dashboard
    await expect(page).toHaveURL('/student/dashboard');
    
    const userMenuButton = page.getByTestId('user-menu-button');
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
  });

  test('should logout and redirect to home', async ({ page }) => {
    // Login first
    await loginUser(page, testUser.email, testUser.password, 'student');

    // Click user menu with stable click
    const userMenuButton = page.getByTestId('user-menu-button');
    await userMenuButton.waitFor({ state: 'visible', timeout: 10000 });
    await stableClick(page, userMenuButton, { timeout: 15000 });

    // Click logout with stable click
    const logoutButton = page.locator('text=Logout');
    await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
    await stableClick(page, logoutButton, { timeout: 15000 });

    // Should redirect to home
    await waitForNavigationAndIdle(page, '/', { timeout: 15000 });
    await expect(page).toHaveURL('/');
    
    // Should not see user menu
    await expect(userMenuButton).not.toBeVisible();
  });

  test('should redirect instructor to instructor dashboard after login', async ({ page }) => {
    const instructorEmail = process.env.E2E_TEST_INSTRUCTOR_EMAIL || `test-instructor-${Date.now()}@example.com`;
    const instructorPassword = process.env.E2E_TEST_INSTRUCTOR_PASSWORD || 'Test123456!';
    
    // Signup as instructor
    await signupUser(page, 'Test Instructor', instructorEmail, instructorPassword, 'instructor');
    
    // Verify role-based redirect to instructor dashboard
    await verifyRoleRedirect(page, 'instructor');
  });

  test('should redirect admin to admin dashboard after login', async ({ page }) => {
    const adminEmail = process.env.E2E_TEST_ADMIN_EMAIL || `test-admin-${Date.now()}@example.com`;
    const adminPassword = process.env.E2E_TEST_ADMIN_PASSWORD || 'Test123456!';
    
    // Signup as admin
    await signupUser(page, 'Test Admin', adminEmail, adminPassword, 'admin');
    
    // Verify role-based redirect to admin dashboard
    await verifyRoleRedirect(page, 'admin');
  });
});
