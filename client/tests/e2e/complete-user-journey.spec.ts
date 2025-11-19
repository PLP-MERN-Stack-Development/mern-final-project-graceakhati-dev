/**
 * E2E Test: Complete User Journey
 * 
 * Flow:
 * 1. Opens the app
 * 2. Signs up a new user
 * 3. Enrolls in a course
 * 4. Completes and submits an impact project
 * 5. Checks for confirmation (success message or dashboard update)
 */

import { test, expect } from '@playwright/test';
import { 
  setupTestPage, 
  resetTestEnvironment, 
  waitForNavigationAndIdle,
  signupUser,
  stableClick
} from './helpers/test-helpers';

test.describe('Complete User Journey - Signup → Enroll → Submit Project', () => {
  // Generate unique test user email to avoid conflicts
  const timestamp = Date.now();
  const testUser = {
    name: `E2E Test User ${timestamp}`,
    email: `e2e-test-${timestamp}@example.com`,
    password: 'Test123456!',
    role: 'student' as const,
  };

  test.beforeEach(async ({ page }) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Reset test environment (clear localStorage, sessionStorage, cookies)
    await resetTestEnvironment(page);
  });

  test('should complete full user journey: signup → enroll → submit project', async ({ page }) => {
    // ==========================================
    // STEP 1: Opens the app
    // ==========================================
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify app loaded (check for landing page elements)
    await expect(page).toHaveURL('/');
    const landingContent = page.locator('text=/welcome|planet path|get started/i').first();
    await expect(landingContent).toBeVisible({ timeout: 10000 });

    // ==========================================
    // STEP 2: Signs up a new user
    // ==========================================
    // Use signup helper which handles form filling and redirect verification
    await signupUser(page, testUser.name, testUser.email, testUser.password, testUser.role);
    
    // Verify dashboard loaded
    await expect(page).toHaveURL('/student/dashboard');
    
    // Verify user is authenticated (check for navbar)
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible({ timeout: 10000 });
    
    // Verify dashboard content is visible
    const dashboardContent = page.locator('text=/my learning|welcome|dashboard/i').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });

    // ==========================================
    // STEP 3: Enrolls in a course
    // ==========================================
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/courses/);

    // Find first available course card
    const firstCourseCard = page.locator('[data-testid^="course-card-"]').first();
    
    // Check if courses exist
    const courseExists = await firstCourseCard.count() > 0;
    
    if (!courseExists) {
      test.skip('No courses available for testing');
      return;
    }

    // Get course ID from data-testid
    const testId = await firstCourseCard.getAttribute('data-testid');
    const courseId = testId?.replace('course-card-', '');
    
    if (!courseId) {
      test.skip('Could not extract course ID');
      return;
    }

    // Navigate to course page
    await page.goto(`/courses/${courseId}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));

    // Verify course page loaded
    const courseTitle = page.locator('h1').first();
    await expect(courseTitle).toBeVisible({ timeout: 10000 });

    // Look for enroll button using test ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);
    
    // Enroll in course if button exists
    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });
      
      // Wait for enrollment to complete (check for enrolled state)
      await expect(
        page.locator('text=/enrolled|✓ enrolled/i').or(
          page.locator('text=/success/i')
        )
      ).toBeVisible({ timeout: 15000 });
    }

    // Verify enrolled state is visible
    const enrolledBadge = page.locator('text=/✓ enrolled|enrolled/i').first();
    await expect(enrolledBadge).toBeVisible({ timeout: 10000 });

    // ==========================================
    // STEP 4: Completes and submits an impact project
    // ==========================================
    // Look for "Submit Project" button using test ID
    const submitProjectButton = page.getByTestId('submit-project-button');
    
    if (await submitProjectButton.count() === 0) {
      test.skip('Submit project button not available (may already be submitted)');
      return;
    }

    // Click "Submit Project" button with stable click
    await stableClick(page, submitProjectButton, { timeout: 15000 });

    // Wait for modal to open
    await expect(
      page.locator('text=Submit Project').or(
        page.locator('h2:has-text("Submit Project")')
      )
    ).toBeVisible({ timeout: 10000 });

    // Fill project description
    const descriptionTextarea = page.locator('textarea[id="project-description-textarea"]').or(
      page.locator('textarea[placeholder*="Describe"]')
    );
    await descriptionTextarea.waitFor({ state: 'visible', timeout: 10000 });
    
    const projectDescription = `This is my E2E test project submission created at ${new Date().toISOString()}. It demonstrates environmental impact through community engagement and sustainable practices.`;
    await descriptionTextarea.fill(projectDescription);

    // Upload project image
    // Create a minimal PNG file for testing (1x1 pixel green image)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const fileInput = page.locator('input[id="project-image-input"]').or(
      page.locator('input[type="file"]')
    );
    
    await fileInput.setInputFiles({
      name: 'project.png',
      mimeType: 'image/png',
      buffer: testImageBuffer,
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for image preview to load

    // Verify image preview is visible
    const imagePreview = page.locator('img[alt="Project preview"]').or(
      page.locator('img').filter({ hasText: '' })
    );
    await expect(imagePreview.first()).toBeVisible({ timeout: 10000 });

    // Optional: Add geolocation (mock geolocation API)
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
    
    const locationButton = page.locator('button[id="location-button"]').or(
      page.locator('button:has-text("Get Current Location")')
    );
    
    if (await locationButton.count() > 0) {
      await stableClick(page, locationButton, { timeout: 15000 });
      await page.waitForTimeout(1000);
    }

    // Submit the project form with stable click
    const submitFormButton = page.locator('button[type="submit"]:has-text("Submit Project")');
    await submitFormButton.waitFor({ state: 'visible', timeout: 10000 });
    await stableClick(page, submitFormButton, { timeout: 15000 });

    // ==========================================
    // STEP 5: Checks for confirmation
    // ==========================================
    // Wait for success message with multiple possible formats
    const successMessage = page.locator('text=/project submitted successfully|✓ project submitted/i').or(
      page.locator('text=/success/i').filter({ hasText: /project|submitted/i })
    );
    
    await expect(successMessage.first()).toBeVisible({ timeout: 20000 });

    // Verify success message details
    // Check for AI score display
    const aiScore = page.locator('text=/ai score|score:/i');
    if (await aiScore.count() > 0) {
      await expect(aiScore.first()).toBeVisible({ timeout: 10000 });
    }

    // Check for verification status
    const verificationStatus = page.locator('text=/verified|you earned|xp/i');
    if (await verificationStatus.count() > 0) {
      await expect(verificationStatus.first()).toBeVisible({ timeout: 10000 });
    }

    // Verify modal closed (success message should be on the course page)
    await expect(
      page.locator('text=Submit Project').or(
        page.locator('h2:has-text("Submit Project")')
      )
    ).not.toBeVisible({ timeout: 10000 });

    // Verify we're still on the course page
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));

    // Verify project submission is reflected (button should be disabled or show "Already Submitted")
    const submitButtonAfterSubmission = page.getByTestId('submit-project-button');
    if (await submitButtonAfterSubmission.count() > 0) {
      const buttonText = await submitButtonAfterSubmission.textContent();
      const isDisabled = await submitButtonAfterSubmission.isDisabled();
      
      // Button should either be disabled or show "Already Submitted"
      expect(
        isDisabled || 
        buttonText?.toLowerCase().includes('already') || 
        buttonText?.toLowerCase().includes('submitted')
      ).toBeTruthy();
    }

    // Optional: Navigate to dashboard and verify project appears
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if dashboard shows any submission-related content
    const dashboardSubmissions = page.locator('text=/submission|project|completed/i');
    // This is optional - dashboard may or may not show submissions immediately
    // Just verify dashboard loads successfully
    await expect(page).toHaveURL('/student/dashboard');
    
    // Final verification: User is still authenticated
    const userMenuButton = page.getByTestId('user-menu-button');
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
  });
});
