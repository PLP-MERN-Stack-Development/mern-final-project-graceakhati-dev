# Playwright E2E Test Fixes

## Summary

Fixed unstable button selectors and non-deterministic routing in Login/Signup pages to make Playwright tests stable and reliable.

## Changes Made

### 1. Login.tsx

**Added stable test ID:**
- Added `data-testid="login-submit"` to the submit button
- Tests can now use: `await page.getByTestId("login-submit").click()`

**Fixed redirect paths:**
- Changed from `/dashboard` → `/student/dashboard` (for students)
- Changed from `/instructor` → `/instructor/dashboard` (for instructors)
- Changed from `/admin` → `/admin/dashboard` (for admins)

**Made redirects deterministic:**
- Await API call completion before navigation
- Update Zustand store synchronously before navigation
- Call `navigate()` synchronously after state is set

**Loading state:**
- Already has `isSubmitting` state with spinner
- Button shows "Logging in..." during submission
- Button is disabled during submission

### 2. Signup.tsx

**Added stable test ID:**
- Added `data-testid="signup-submit"` to the submit button
- Tests can now use: `await page.getByTestId("signup-submit").click()`

**Fixed redirect paths:**
- Changed from `/dashboard` → `/student/dashboard` (for students)
- Changed from `/instructor` → `/instructor/dashboard` (for instructors)
- Changed from `/admin` → `/admin/dashboard` (for admins)

**Made redirects deterministic:**
- Same pattern as Login.tsx
- Await API call, update store, then navigate

### 3. ProtectedRoute.tsx

**No changes needed:**
- Already uses Zustand store correctly
- Already handles loading state
- Already redirects properly based on authentication

## Test Usage

### Before (Unstable):
```typescript
await page.click('button[type="submit"]'); // ❌ Unstable selector
await page.waitForURL(/\/dashboard/); // ❌ Non-deterministic path
```

### After (Stable):
```typescript
// Login
await page.getByTestId("login-submit").click();
await page.waitForURL("/student/dashboard"); // ✅ Deterministic path

// Signup
await page.getByTestId("signup-submit").click();
await page.waitForURL("/student/dashboard"); // ✅ Deterministic path
```

## Redirect Paths

| Role | Old Path | New Path |
|------|----------|----------|
| Student | `/dashboard` | `/student/dashboard` |
| Instructor | `/instructor` | `/instructor/dashboard` |
| Admin | `/admin` | `/admin/dashboard` |

## Flow Guarantees

1. **API call completes** → `await authService.login()` finishes
2. **State updated** → Zustand store updated synchronously
3. **Navigation happens** → `navigate()` called immediately after
4. **URL is deterministic** → Always `/role/dashboard` format

## Files Modified

- `client/src/pages/auth/Login.tsx`
- `client/src/pages/auth/Signup.tsx`

## Files Reviewed (No Changes Needed)

- `client/src/components/auth/ProtectedRoute.tsx` - Already correct

