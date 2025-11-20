import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Playwright Global Setup
 * 
 * Runs once before all tests to:
 * 1. Create test users (admin, instructor, student) via test API endpoint
 * 2. Store credentials in environment for use in tests
 * 
 * This ensures test users exist before E2E tests run.
 */
async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

  const baseURL = config.projects[0]?.use?.baseURL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001';
  const apiURL = process.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  console.log('🔧 Playwright Global Setup: Creating test users...');
  console.log(`   API URL: ${apiURL}`);

  // Test user configurations
  const testUsers = [
    {
      email: process.env.E2E_TEST_STUDENT_EMAIL || 'test-student@example.com',
      password: process.env.E2E_TEST_STUDENT_PASSWORD || 'Test123456!',
      role: 'student',
      name: 'Test Student',
    },
    {
      email: process.env.E2E_TEST_INSTRUCTOR_EMAIL || 'test-instructor@example.com',
      password: process.env.E2E_TEST_INSTRUCTOR_PASSWORD || 'Test123456!',
      role: 'instructor',
      name: 'Test Instructor',
    },
    {
      email: process.env.E2E_TEST_ADMIN_EMAIL || 'test-admin@example.com',
      password: process.env.E2E_TEST_ADMIN_PASSWORD || 'Test123456!',
      role: 'admin',
      name: 'Test Admin',
    },
  ];

  // Create test users via API
  for (const userConfig of testUsers) {
    try {
      console.log(`   Creating ${userConfig.role} user: ${userConfig.email}`);

      const response = await fetch(`${apiURL}/test/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userConfig.email,
          password: userConfig.password,
          role: userConfig.role,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Failed to create ${userConfig.role} user:`, errorText);
        throw new Error(`Failed to create ${userConfig.role} user: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`   ✅ ${userConfig.role} user ready: ${data.data?.email || userConfig.email}`);
    } catch (error) {
      console.error(`   ❌ Error creating ${userConfig.role} user:`, error);
      // Don't fail the entire setup - tests can handle missing users
      console.warn(`   ⚠️  Continuing without ${userConfig.role} user. Tests may fail if user is required.`);
    }
  }

  console.log('✅ Global setup complete. Test users are ready.');
}

export default globalSetup;
