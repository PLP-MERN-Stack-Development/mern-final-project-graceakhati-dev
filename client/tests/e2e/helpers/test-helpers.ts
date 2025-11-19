import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities
 * 
 * Provides consistent test environment setup and utilities
 */

/**
 * Setup page with route blocking and analytics mocking
 */
export async function setupTestPage(page: Page) {
  // Block external CDNs and analytics
  await page.route('**/*', (route) => {
    const url = route.request().url();
    
    // Block analytics endpoints
    if (url.includes('/analytics') || url.includes('/track') || url.includes('/collect')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
      return;
    }
    
    // Block external CDNs (optional - uncomment if needed)
    // if (url.includes('cdn.') || url.includes('google-analytics.com') || url.includes('googletagmanager.com')) {
    //   route.abort();
    //   return;
    // }
    
    // Continue with all other requests
    route.continue();
  });

  // Mock analytics calls specifically
  await page.route('**/api/analytics/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock any analytics tracking
  await page.route('**/analytics/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Reset test environment
 * Clears localStorage, sessionStorage, and cookies
 */
export async function resetTestEnvironment(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

/**
 * Navigate and wait for network idle
 */
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Click with retry - checks actionability first, then clicks
 * Uses trial mode to ensure element is ready before clicking
 * 
 * @param page - Playwright page object
 * @param selector - Test ID selector (without 'data-testid=' prefix)
 * @param options - Optional click options
 */
export async function clickWithRetry(
  page: Page,
  selector: string,
  options?: { timeout?: number }
) {
  const element = page.getByTestId(selector);
  // First check if element is actionable (trial mode - doesn't perform action)
  try {
    await element.click({ trial: true, timeout: options?.timeout || 5000 });
  } catch (e) {
    // If trial fails, wait a bit and try again
    await page.waitForTimeout(500);
  }
  // Then perform the actual click (Playwright will retry automatically)
  await element.click(options);
  await page.waitForLoadState('networkidle');
}

/**
 * Click element with trial check - helper for inline usage
 * Checks readiness with trial, then performs actual click
 */
export async function clickWithTrialCheck(
  element: ReturnType<Page['getByTestId']>,
  options?: { timeout?: number }
) {
  // Check readiness first
  await element.click({ trial: true, timeout: options?.timeout || 5000 });
  // Perform actual click
  await element.click(options);
}

/**
 * Wait for navigation and network idle
 */
export async function waitForNavigationAndIdle(
  page: Page,
  url: string | RegExp,
  options?: { timeout?: number }
) {
  await page.waitForURL(url, { timeout: options?.timeout || 30000, ...options });
  await page.waitForLoadState('networkidle');
}

/**
 * Stable click helper - ensures element is visible and actionable before clicking
 * Handles ProtectedButton and regular buttons
 */
export async function stableClick(
  page: Page,
  element: ReturnType<Page['getByTestId']> | ReturnType<Page['locator']>,
  options?: { timeout?: number; waitAfter?: boolean }
) {
  // Wait for element to be visible
  await element.waitFor({ state: 'visible', timeout: options?.timeout || 10000 });
  
  // Check if element is actionable (trial mode)
  try {
    await element.click({ trial: true, timeout: options?.timeout || 5000 });
  } catch (e) {
    // If trial fails, wait a bit more
    await page.waitForTimeout(1000);
  }
  
  // Perform actual click
  await element.click({ timeout: options?.timeout || 10000 });
  
  // Wait for network idle after click
  if (options?.waitAfter !== false) {
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Login helper - handles login flow with proper redirect verification
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string,
  expectedRole: 'student' | 'instructor' | 'admin' = 'student'
) {
  // Navigate to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Verify we're on login page
  await page.waitForURL(/\/login/, { timeout: 10000 });
  
  // Fill login form
  const emailInput = page.getByTestId('email-input');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);
  
  const passwordInput = page.getByTestId('password-input');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);
  
  // Click login button with stable click
  const loginButton = page.getByTestId('login-submit');
  await stableClick(page, loginButton, { timeout: 15000 });
  
  // Wait for role-based redirect
  const expectedDashboard = expectedRole === 'student' 
    ? '/student/dashboard'
    : expectedRole === 'instructor'
    ? '/instructor/dashboard'
    : '/admin/dashboard';
  
  await waitForNavigationAndIdle(page, expectedDashboard, { timeout: 30000 });
  
  // Verify we're on the correct dashboard
  await page.waitForURL(expectedDashboard, { timeout: 10000 });
  
  // Verify user is authenticated (check for navbar or user menu)
  const navbar = page.getByTestId('navbar');
  await navbar.waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Signup helper - handles signup flow with proper redirect verification
 */
export async function signupUser(
  page: Page,
  name: string,
  email: string,
  password: string,
  role: 'student' | 'instructor' | 'admin' = 'student'
) {
  // Navigate to signup page
  await page.goto('/signup');
  await page.waitForLoadState('networkidle');
  
  // Verify we're on signup page
  await page.waitForURL(/\/signup/, { timeout: 10000 });
  
  // Fill signup form
  await page.fill('input[name="fullName"]', name);
  
  const emailInput = page.getByTestId('email-input');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);
  
  const passwordInput = page.getByTestId('password-input');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);
  
  await page.fill('input[name="confirmPassword"]', password);
  await page.selectOption('select[name="role"]', role);
  
  // Click signup button with stable click
  const signupButton = page.getByTestId('signup-submit');
  await stableClick(page, signupButton, { timeout: 15000 });
  
  // Wait for role-based redirect
  const expectedDashboard = role === 'student' 
    ? '/student/dashboard'
    : role === 'instructor'
    ? '/instructor/dashboard'
    : '/admin/dashboard';
  
  await waitForNavigationAndIdle(page, expectedDashboard, { timeout: 30000 });
  
  // Verify we're on the correct dashboard
  await page.waitForURL(expectedDashboard, { timeout: 10000 });
  
  // Verify user is authenticated
  const navbar = page.getByTestId('navbar');
  await navbar.waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Verify role-based redirect - ensures user is redirected to correct dashboard
 */
export async function verifyRoleRedirect(
  page: Page,
  expectedRole: 'student' | 'instructor' | 'admin'
) {
  const expectedDashboard = expectedRole === 'student' 
    ? '/student/dashboard'
    : expectedRole === 'instructor'
    ? '/instructor/dashboard'
    : '/admin/dashboard';
  
  await page.waitForURL(expectedDashboard, { timeout: 30000 });
  await expect(page).toHaveURL(expectedDashboard);
}

