# E2E Test Setup Instructions

## Quick Setup

1. **Install Playwright browsers:**
   ```powershell
   npx playwright install
   ```
   
   This will download Chromium, Firefox, and WebKit browsers (~500MB).

2. **Create test environment file:**
   ```powershell
   Copy-Item .env.test.example .env.test
   ```
   
   Then edit `.env.test` with your actual test account credentials.

3. **Run tests:**
   ```powershell
   npm run test:e2e
   ```

## Troubleshooting

### Error: "Executable doesn't exist"
**Solution:** Run `npx playwright install` to download browsers.

### Error: ".env.test.example not found"
**Solution:** The file should be in the `client/` directory. If missing, create `.env.test` manually with the variables from `.env.test.example`.

### Tests fail with authentication errors
**Solution:** Make sure `.env.test` has valid test account credentials that exist in your backend database.

### Dev server not starting
**Solution:** Make sure port 3000 is available. The Playwright config will try to start `npm run dev` automatically.

## Test Account Setup

Before running E2E tests, ensure you have test accounts created in your backend:

1. **Student account** - Used for student flow tests
2. **Instructor account** - Used for instructor flow tests  
3. **Admin account** - Used for admin flow tests

Update `.env.test` with the actual credentials for these accounts.

## Running Specific Tests

```powershell
# Run only auth tests
npx playwright test tests/e2e/auth-flow.spec.ts

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug
```

