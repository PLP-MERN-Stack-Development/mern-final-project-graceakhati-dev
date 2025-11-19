import { test as base } from '@playwright/test';
import { setupTestPage, resetTestEnvironment } from './test-helpers';

/**
 * Extended test fixture with automatic page setup
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Setup page with route blocking and analytics mocking
    await setupTestPage(page);
    
    // Use the page
    await use(page);
    
    // Cleanup after test
    await resetTestEnvironment(page);
  },
});

export { expect } from '@playwright/test';

