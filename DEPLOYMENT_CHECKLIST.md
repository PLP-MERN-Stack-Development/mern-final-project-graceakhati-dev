# Deployment Checklist

## ✅ Frontend Fixes Applied

### 1. Favicon
- ✅ `favicon.svg` exists in `client/public/`
- ⚠️  `favicon.ico` - Convert from SVG if needed for older browsers
- ✅ HTML updated with favicon links

### 2. Environment Variables
- ✅ `.env` file created/updated
- ✅ `VITE_API_URL=https://planet-path-backend.onrender.com` (no trailing slash)
- ✅ Verified no trailing slashes in environment variables

### 3. Google Login Redirect
- ✅ Updated `Login.tsx` to use simplified redirect logic
- ✅ URL encoding with `encodeURIComponent`
- ✅ Default redirect path: `/student/dashboard`
- ✅ Removes trailing slashes from API URL

### 4. Vite Configuration
- ✅ Disabled overlay: `hmr: { overlay: false }`
- ✅ Prevents URI errors from showing as overlay

---

## ✅ Backend Fixes Applied

### 1. CORS Installation
- ✅ `cors` package already installed (v2.8.5)

### 2. CORS Configuration
- ✅ Updated `app.ts` with allowed origins array
- ✅ Supports multiple origins (CLIENT_URL, FRONTEND_URL, localhost)
- ✅ Credentials enabled for cookies/auth
- ✅ Proper origin validation callback

### 3. Google OAuth Routes
- ✅ Routes exist in `authRoutes.ts`:
  - `GET /api/auth/google` - Initiate OAuth flow
  - `GET /api/auth/google/callback` - Handle callback
- ✅ Controllers imported and configured

### 4. Google Cloud Console Configuration
⚠️ **ACTION REQUIRED:**
- Whitelist redirect URI in Google Cloud Console:
  - `https://your-frontend-domain.com/student/dashboard`
  - `http://localhost:3001/student/dashboard` (for development)
  - Backend callback: `https://planet-path-backend.onrender.com/api/auth/google/callback`

---

## 🔍 Deployment Checks

### Port Availability

**Windows:**
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed (replace <PID> with actual process ID)
kill -9 <PID>
```

### Backend Health Check

**Verify backend is running:**
```bash
curl https://planet-path-backend.onrender.com/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Planet Path API is running",
  "timestamp": "2025-01-XX...",
  "environment": "production",
  "uptime": 123.45
}
```

### Frontend Build

**Build frontend:**
```bash
cd client
npm run build
```

**Verify build output:**
- Check `client/dist/` folder exists
- Verify `favicon.svg` and `favicon.ico` are in `dist/`
- Check `index.html` references favicon correctly

---

## 📝 Environment Variables Summary

### Frontend (`client/.env`)
```env
VITE_API_URL=https://planet-path-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=<your_google_client_id>
VITE_GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_REDIRECT_URI=https://planet-path-backend.onrender.com/api/auth/google/callback
```

---

## 🚀 Next Steps

1. **Restart Backend:**
   ```bash
   cd server
   npm start
   ```

2. **Test Google OAuth:**
   - Navigate to login page
   - Click "Continue with Google"
   - Verify redirect flow works
   - Check token is stored in localStorage

3. **Verify CORS:**
   - Check browser console for CORS errors
   - Verify API requests succeed
   - Check Network tab for proper headers

4. **Test Favicon:**
   - Check browser tab shows favicon
   - Verify no 404 errors for favicon

5. **Monitor Logs:**
   - Check backend logs for errors
   - Monitor frontend console for issues
   - Verify health endpoint responds

---

## ✅ Verification Checklist

- [ ] Backend health check returns success
- [ ] Frontend builds without errors
- [ ] Favicon displays in browser tab
- [ ] Google OAuth redirects correctly
- [ ] CORS allows frontend requests
- [ ] No console errors in browser
- [ ] Token stored after Google login
- [ ] User redirected to dashboard after login

