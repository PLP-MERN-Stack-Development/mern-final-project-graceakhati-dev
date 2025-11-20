# 🔧 Fix TypeScript Route Handler Types

## Issue: AuthRequest Type Mismatch

Many route files have TypeScript errors because `AuthRequest` handlers don't match Express's `RequestHandler` type.

---

## ✅ Solution: Use RequestHandler Type Casting

### For `authRoutes.ts` - Already Fixed ✅

**File:** `server/src/routes/authRoutes.ts`

**Status:** ✅ **ALREADY FIXED**

```typescript
import { Router, RequestHandler } from 'express';

// Route with type casting:
router.get('/me', authenticate as RequestHandler, getMe as RequestHandler);
```

---

## 🔧 Fix Other Route Files

### Pattern to Apply:

**BEFORE:**
```typescript
router.get('/route', authenticate, controller);
```

**AFTER:**
```typescript
import { Router, RequestHandler } from 'express';

router.get('/route', authenticate as RequestHandler, controller as RequestHandler);
```

---

## 📋 Files That Need Fixing

Based on build errors, these files need the same fix:

1. `server/src/routes/assignmentRoutes.ts`
2. `server/src/routes/certificateRoutes.ts`
3. `server/src/routes/courseRoutes.ts`
4. `server/src/routes/enrollmentRoutes.ts`
5. `server/src/routes/leaderboardRoutes.ts`
6. `server/src/routes/lessonRoutes.ts`
7. `server/src/routes/moduleRoutes.ts`
8. `server/src/routes/quizRoutes.ts`
9. `server/src/routes/submissionRoutes.ts`

---

## 🚀 Quick Fix Script

For each route file:

1. **Add import:**
   ```typescript
   import { Router, RequestHandler } from 'express';
   ```

2. **Cast handlers:**
   ```typescript
   // For routes with authenticate middleware
   router.get('/route', authenticate as RequestHandler, controller as RequestHandler);
   
   // For routes without authenticate (if they use AuthRequest)
   router.get('/route', controller as RequestHandler);
   ```

---

## ✅ Verification

After fixing, run:
```bash
cd server
npm run build
```

All TypeScript errors should be resolved.

---

**Status:** `authRoutes.ts` is already fixed! ✅

