import { Page } from '@playwright/test';

/**
 * Helper functions for API mocking and interception in E2E tests
 */

/**
 * Mock API responses for testing
 */
export async function setupApiMocks(page: Page) {
  // Mock auth endpoints
  await page.route('**/api/auth/login', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    // Mock successful login
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'user123',
            name: postData.email.split('@')[0],
            email: postData.email,
            role: 'student',
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
      }),
    });
  });

  await page.route('**/api/auth/register', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'user' + Date.now(),
            name: postData.name,
            email: postData.email,
            role: postData.role || 'student',
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
      }),
    });
  });

  // Mock courses endpoint
  await page.route('**/api/courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          courses: [
            {
              _id: 'course1',
              title: 'Climate Basics',
              description: 'Learn about climate change fundamentals',
              price: 0,
              level: 'beginner',
              tags: ['climate', 'basics'],
              status: 'published',
            },
            {
              _id: 'course2',
              title: 'Renewable Energy',
              description: 'Solar and wind energy technologies',
              price: 1000,
              level: 'intermediate',
              tags: ['energy', 'renewable'],
              status: 'published',
            },
          ],
        },
      }),
    });
  });

  // Mock single course endpoint
  await page.route('**/api/courses/*', async (route) => {
    const courseId = route.request().url().split('/courses/')[1]?.split('?')[0];
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          course: {
            _id: courseId || 'course1',
            title: 'Test Course',
            description: 'Test course description',
            price: 0,
            level: 'beginner',
            modules: [
              { _id: 'module1', title: 'Module 1' },
              { _id: 'module2', title: 'Module 2' },
            ],
            status: 'published',
          },
        },
      }),
    });
  });

  // Mock enrollment endpoint
  await page.route('**/api/enrollments', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          enrollment: {
            _id: 'enrollment' + Date.now(),
            userId: 'user123',
            courseId: postData.courseId,
            enrolledAt: new Date().toISOString(),
          },
        },
      }),
    });
  });

  // Mock check enrollment endpoint
  await page.route('**/api/enrollments/user/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          enrollments: [
            {
              _id: 'enrollment1',
              userId: 'user123',
              courseId: 'course1',
              enrolledAt: new Date().toISOString(),
            },
          ],
        },
      }),
    });
  });

  // Mock submissions endpoint
  await page.route('**/api/submissions', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          submission: {
            _id: 'submission' + Date.now(),
            courseId: 'course1',
            userId: 'user123',
            files: ['https://example.com/image.png'],
            metadata: {
              notes: 'Test submission',
              geotag: { lat: 40.7128, lng: -74.0060 },
            },
            aiScore: 85,
            verified: true,
            verifiedAt: new Date().toISOString(),
            status: 'submitted',
          },
        },
      }),
    });
  });

  // Mock assignments endpoint
  await page.route('**/api/assignments/course/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          assignments: [
            {
              _id: 'assignment1',
              title: 'Project Assignment',
              description: 'Submit your project',
            },
          ],
        },
      }),
    });
  });
}

/**
 * Clear all API mocks
 */
export async function clearApiMocks(page: Page) {
  await page.unroute('**/api/**');
}

