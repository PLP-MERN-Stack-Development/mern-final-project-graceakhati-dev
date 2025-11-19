import { Page } from '@playwright/test';

/**
 * Helper functions for authentication in E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
  role?: 'student' | 'instructor' | 'admin';
}

/**
 * Login a user
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect based on role
  if (user.role === 'admin') {
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  } else if (user.role === 'instructor') {
    await page.waitForURL(/\/instructor/, { timeout: 10000 });
  } else {
    await page.waitForURL(/\/dashboard|\/student\/dashboard/, { timeout: 10000 });
  }
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  const userMenuButton = page.locator('[data-testid="user-menu-button"]');
  
  if (await userMenuButton.count() > 0) {
    await userMenuButton.click();
    await page.click('text=Logout');
    await page.waitForURL('/', { timeout: 5000 });
  }
  
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
}

/**
 * Signup a new user
 */
export async function signup(page: Page, user: TestUser): Promise<void> {
  await page.goto('/signup');
  await page.fill('input[name="fullName"]', user.name || 'Test User');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  if (user.role) {
    await page.selectOption('select[name="role"]', user.role);
  }
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL(/\/dashboard|\/instructor|\/admin/, { timeout: 10000 });
}

/**
 * Get test users from environment variables
 */
export function getTestUsers() {
  return {
    student: {
      email: process.env.E2E_TEST_STUDENT_EMAIL || `test-student-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
      name: process.env.E2E_TEST_STUDENT_NAME || 'Test Student',
      role: 'student' as const,
    },
    instructor: {
      email: process.env.E2E_TEST_INSTRUCTOR_EMAIL || `test-instructor-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_INSTRUCTOR_PASSWORD || 'Test123456!',
      name: process.env.E2E_TEST_INSTRUCTOR_NAME || 'Test Instructor',
      role: 'instructor' as const,
    },
    admin: {
      email: process.env.E2E_TEST_ADMIN_EMAIL || `test-admin-${Date.now()}@example.com`,
      password: process.env.E2E_TEST_ADMIN_PASSWORD || 'Test123456!',
      name: process.env.E2E_TEST_ADMIN_NAME || 'Test Admin',
      role: 'admin' as const,
    },
  };
}

