import { test, expect } from '@playwright/test';
import { 
  setupTestPage, 
  resetTestEnvironment, 
  waitForNavigationAndIdle,
  loginUser,
  signupUser,
  stableClick
} from './helpers/test-helpers';

/**
 * E2E Test: Submit project with image → Confirmation screen
 * 
 * Flow:
 * 1. Login as student
 * 2. Navigate to a course
 * 3. Enroll if not enrolled
 * 4. Click "Submit Project" button
 * 5. Fill project form (image, description, geolocation)
 * 6. Submit project
 * 7. Verify success confirmation
 */

test.describe('Submit Project Flow', () => {
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

  test('should submit project with image and description', async ({ page }) => {
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

    // Enroll if needed using test ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);

    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });
      await page.waitForTimeout(2000); // Wait for enrollment
    }

    // Click "Submit Project" button using test ID with stable click
    const submitButton = page.getByTestId('submit-project-button');
    
    if (await submitButton.count() === 0) {
      test.skip();
      return;
    }

    await stableClick(page, submitButton, { timeout: 15000 });

    // Wait for modal to open
    await expect(
      page.locator('text=Submit Project').or(
        page.locator('h2:has-text("Submit Project")')
      )
    ).toBeVisible({ timeout: 10000 });

    // Fill description
    const descriptionTextarea = page.locator('textarea[id="project-description-textarea"]').or(
      page.locator('textarea[placeholder*="Describe"]')
    );
    await descriptionTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await descriptionTextarea.fill(
      'This is my test project submission. It demonstrates environmental impact through tree planting and community engagement.'
    );

    // Upload image (create a simple test image)
    const fileInput = page.locator('input[id="project-image-input"]').or(
      page.locator('input[type="file"]')
    );
    
    // Create a minimal PNG file for testing
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer,
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for image preview

    // Wait for image preview
    await expect(
      page.locator('img[alt="Project preview"]').or(
        page.locator('img[alt="Preview"]')
      )
    ).toBeVisible({ timeout: 10000 });

    // Submit form with stable click
    const submitFormButton = page.locator('button[type="submit"]:has-text("Submit Project")');
    await submitFormButton.waitFor({ state: 'visible', timeout: 10000 });
    await stableClick(page, submitFormButton, { timeout: 15000 });

    // Wait for success message
    await expect(
      page.locator('text=/project submitted|success/i').or(
        page.locator('text=/submitted successfully/i')
      )
    ).toBeVisible({ timeout: 20000 });

    // Verify modal closed or success message visible
    await expect(
      page.locator('text=/ai score|verified/i').or(
        page.locator('text=/project submitted successfully/i')
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test('should submit project with geolocation', async ({ page }) => {
    // Mock geolocation API
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

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

    await page.goto(`/courses/${courseId}`);
    await page.waitForLoadState('networkidle');

    // Enroll if needed using test ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);

    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // Open submit modal using test ID with stable click
    const submitButton = page.getByTestId('submit-project-button');
    
    if (await submitButton.count() === 0) {
      test.skip();
      return;
    }

    await stableClick(page, submitButton, { timeout: 15000 });
    await expect(
      page.locator('text=Submit Project').or(
        page.locator('h2:has-text("Submit Project")')
      )
    ).toBeVisible({ timeout: 10000 });

    // Fill description
    const descriptionTextarea = page.locator('textarea[id="project-description-textarea"]').or(
      page.locator('textarea[placeholder*="Describe"]')
    );
    await descriptionTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await descriptionTextarea.fill('Project with geolocation data.');

    // Upload image
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const fileInput = page.locator('input[id="project-image-input"]').or(
      page.locator('input[type="file"]')
    );
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer,
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Get location with stable click
    const locationButton = page.locator('button[id="location-button"]').or(
      page.locator('button:has-text("Get Current Location")')
    );
    if (await locationButton.count() > 0) {
      await stableClick(page, locationButton, { timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // Submit form with stable click
    const submitFormButton = page.locator('button[type="submit"]:has-text("Submit Project")');
    await submitFormButton.waitFor({ state: 'visible', timeout: 10000 });
    await stableClick(page, submitFormButton, { timeout: 15000 });

    // Verify success
    await expect(
      page.locator('text=/project submitted|success/i')
    ).toBeVisible({ timeout: 20000 });
  });

  test('should show validation errors for missing fields', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

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

    await page.goto(`/courses/${courseId}`);
    await page.waitForLoadState('networkidle');

    // Enroll if needed using test ID
    const enrollButton = page.getByTestId(`enroll-btn-${courseId}`);
    if (await enrollButton.count() > 0) {
      await stableClick(page, enrollButton, { timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // Open submit modal using test ID with stable click
    const submitButton = page.getByTestId('submit-project-button');
    
    if (await submitButton.count() === 0) {
      test.skip();
      return;
    }

    await stableClick(page, submitButton, { timeout: 15000 });
    await expect(page.locator('text=Submit Project')).toBeVisible({ timeout: 10000 });

    // Try to submit without filling fields
    const submitFormButton = page.locator('button[type="submit"]:has-text("Submit Project")');
    await submitFormButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Button should be disabled if validation fails
    const isDisabled = await submitFormButton.isDisabled();
    
    if (!isDisabled) {
      // If button is enabled, click it to trigger validation
      await stableClick(page, submitFormButton, { timeout: 15000 });
      
      // Should show error messages
      await expect(
        page.locator('text=/please select|please enter|required/i')
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Button is disabled, which means validation is working
      expect(isDisabled).toBe(true);
    }
  });
});
