# ✅ Google OAuth with Passport.js - Complete Setup

## Date: 2025-01-27

---

## ✅ Status: Already Configured!

Your project already has Passport.js Google OAuth configured! Here's what's in place:

---

## 1️⃣ Backend Routes ✅

**File:** `server/src/routes/authRoutes.ts`

**Status:** ✅ **ALREADY CONFIGURED**

```typescript
import { googleAuth, googleAuthCallback } from '../controllers/googleAuthController';

// Routes are already set up:
router.get('/google', googleAuth);                    // GET /api/auth/google
router.get('/google/callback', googleAuthCallback);  // GET /api/auth/google/callback
```

**Routes Available:**
- ✅ `GET /api/auth/google` - Initiates Google OAuth
- ✅ `GET /api/auth/google/callback` - Handles OAuth callback

---

## 2️⃣ Google OAuth Controller ✅

**File:** `server/src/controllers/googleAuthController.ts`

**Status:** ✅ **ALREADY EXISTS**

**Current Implementation:**
```typescript
import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const googleAuth = (req: Request, res: Response) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res);
};

export const googleAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);
    
    // Redirect back to frontend with token
    const redirectParam = req.query.redirect as string | undefined;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = redirectParam || '/student/dashboard';
    
    res.redirect(`${FRONTEND_URL}${redirectUrl}?token=${encodeURIComponent(token)}`);
  })(req, res);
};
```

---

## 3️⃣ Passport Configuration ✅

**File:** `server/src/config/passport.ts`

**Status:** ✅ **ALREADY CONFIGURED**

**Google Strategy:**
- ✅ Uses `passport-google-oauth20`
- ✅ Configured with environment variables
- ✅ Handles user creation/update
- ✅ Returns user to callback handler

**App Integration:**
- ✅ Passport initialized in `server/src/app.ts`
- ✅ `app.use(passport.initialize())`

---

## 4️⃣ Dependencies ✅

**File:** `server/package.json`

**Status:** ✅ **ALREADY INSTALLED**

```json
{
  "dependencies": {
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0"
  }
}
```

---

## 5️⃣ Frontend Login Handler ✅

**File:** `client/src/pages/auth/Login.tsx`

**Status:** ✅ **ALREADY CONFIGURED**

**Current Implementation:**
```typescript
const handleGoogleLogin = () => {
  setIsGoogleLoading(true);
  setErrors({});

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const googleAuthUrl = `${apiUrl}/auth/google`;
    
    const redirectParam = searchParams.get('redirect');
    const redirectUrl = redirectParam || '/student/dashboard';

    window.location.href = `${googleAuthUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
  } catch (error: any) {
    setErrors({
      general: error.message || 'Google login failed. Please try again.',
    });
    setIsGoogleLoading(false);
  }
};
```

---

## 6️⃣ Environment Variables

### Backend (`server/.env`):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=https://your-frontend.onrender.com

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
```

### Frontend (`client/.env`):

```env
# Backend API URL
VITE_API_URL=https://your-backend.onrender.com/api
```

**Note:** For Render deployment, use your Render backend URL:
```env
VITE_API_URL=https://planet-path-backend.onrender.com/api
```

---

## 🔄 OAuth Flow

### Complete Flow:

1. **User clicks "Continue with Google"**
   - Frontend: `handleGoogleLogin()` called
   - Redirects to: `https://backend.onrender.com/api/auth/google?redirect=/student/dashboard`

2. **Backend initiates OAuth**
   - Route: `GET /api/auth/google`
   - Controller: `googleAuth()`
   - Passport redirects to Google consent screen

3. **User authenticates with Google**
   - Google shows consent screen
   - User grants permissions
   - Google redirects to: `https://backend.onrender.com/api/auth/google/callback?code=...`

4. **Backend processes callback**
   - Route: `GET /api/auth/google/callback`
   - Controller: `googleAuthCallback()`
   - Passport authenticates with Google
   - Creates/updates user in MongoDB
   - Generates JWT token

5. **Backend redirects to frontend**
   - Redirects to: `https://frontend.onrender.com/student/dashboard?token=jwt_token_here`

6. **Frontend processes token**
   - `handleGoogleOAuthCallback()` extracts token
   - Saves to localStorage
   - Updates auth store
   - Redirects to dashboard

---

## ✅ Verification Checklist

- [x] Passport.js installed ✅
- [x] `passport-google-oauth20` installed ✅
- [x] Passport configured ✅
- [x] Google OAuth routes exist ✅
- [x] Google OAuth controller exists ✅
- [x] Frontend login handler configured ✅
- [x] Environment variables documented ✅

---

## 🚀 Deployment Checklist

### Before Deploying:

1. **Set Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-backend.onrender.com/api/auth/google/callback`

2. **Set Environment Variables in Render:**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (must match Google Console)
   - `FRONTEND_URL`
   - `JWT_SECRET`
   - `MONGO_URI`

3. **Update Frontend `.env`:**
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

4. **Test Locally First:**
   - Start backend: `cd server && npm run dev`
   - Start frontend: `cd client && npm run dev`
   - Test Google login flow

---

## 📝 Summary

✅ **Everything is already configured!**

Your project has:
- ✅ Passport.js Google OAuth strategy configured
- ✅ Routes set up correctly
- ✅ Controllers implemented
- ✅ Frontend handler ready
- ✅ Dependencies installed

**Next Steps:**
1. Set environment variables in Render
2. Update frontend `.env` with Render backend URL
3. Deploy and test!

---

**Status:** ✅ **READY FOR DEPLOYMENT**

