# Environment Variables Setup - COMPLETE ✅

## Phase 1: Environment Variable Repair - COMPLETED

### Server `.env` File Created ✅

**Location:** `server/.env`

**Variables Configured:**
- ✅ `PORT=5000` - Backend server port
- ✅ `NODE_ENV=development` - Environment mode
- ✅ `MONGO_URI=mongodb://localhost:27017/planetpath` - MongoDB connection
- ✅ `MONGODB_URI=mongodb://localhost:27017/planetpath` - Alternative MongoDB URI (backward compatibility)
- ✅ `JWT_SECRET=supersecretkey123` - JWT token secret
- ✅ `JWT_EXPIRE=7d` - JWT token expiration
- ✅ `CLIENT_URL=http://localhost:3001` - Frontend URL for CORS
- ✅ `FRONTEND_URL=http://localhost:3001` - Frontend URL for redirects
- ✅ `GOOGLE_CLIENT_ID=<your_google_client_id>` - **REQUIRES UPDATE**
- ✅ `GOOGLE_CLIENT_SECRET=<your_google_client_secret>` - **REQUIRES UPDATE**
- ✅ `GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback` - Google OAuth callback
- ✅ `UPLOADS_DIR=./server/uploads` - File upload directory
- ✅ `REDIS_URL=redis://localhost:6379` - Redis connection (optional)
- ✅ `ENABLE_REDIS=false` - Redis enabled flag

### Client `.env` File Created ✅

**Location:** `client/.env`

**Variables Configured:**
- ✅ `VITE_API_URL=http://localhost:5000` - Backend API URL
- ✅ `VITE_GOOGLE_CLIENT_ID=<your_google_client_id>` - **REQUIRES UPDATE**
- ✅ `VITE_GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback` - Google OAuth callback

### Configuration Updates ✅

- ✅ Updated `client/vite.config.ts` - Changed port from 3000 to 3001 to match CLIENT_URL
- ✅ All URLs aligned: Frontend runs on port 3001, Backend on port 5000

---

## ⚠️ ACTION REQUIRED: Google OAuth Setup

### Steps to Configure Google OAuth:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project:**
   - Create a new project or select existing one

3. **Enable Google+ API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`

5. **Update `.env` Files:**
   - Copy the Client ID to both `server/.env` and `client/.env`
     - Replace `<your_google_client_id>` in `GOOGLE_CLIENT_ID` (server)
     - Replace `<your_google_client_id>` in `VITE_GOOGLE_CLIENT_ID` (client)
   - Copy the Client Secret to `server/.env`
     - Replace `<your_google_client_secret>` in `GOOGLE_CLIENT_SECRET`

---

## MongoDB Setup

### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. `.env` already configured: `MONGO_URI=mongodb://localhost:27017/planetpath`

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGO_URI` in `server/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/planetpath?retryWrites=true&w=majority
   ```
   **Important:** URL-encode special characters in password (@ = %40, # = %23, etc.)

---

## Verification Checklist

### Server Environment Variables
- [x] `.env` file created in `server/` directory
- [x] All required variables present
- [x] MongoDB URI configured
- [x] JWT secret set
- [x] CORS URL matches frontend port
- [ ] Google OAuth credentials updated (ACTION REQUIRED)

### Client Environment Variables
- [x] `.env` file created in `client/` directory
- [x] API URL configured
- [x] Google OAuth redirect URI configured
- [ ] Google OAuth client ID updated (ACTION REQUIRED)

### Configuration Alignment
- [x] Frontend port (3001) matches CLIENT_URL
- [x] Backend port (5000) matches VITE_API_URL
- [x] Google redirect URI matches in both files

---

## Next Steps

1. **Update Google OAuth Credentials:**
   - Follow the Google OAuth setup steps above
   - Update both `.env` files with actual credentials

2. **Set Up MongoDB:**
   - Choose local or Atlas
   - Update `MONGO_URI` if using Atlas

3. **Test Configuration:**
   ```bash
   # Start backend
   cd server
   npm run dev
   
   # Start frontend (in new terminal)
   cd client
   npm run dev
   ```

4. **Verify:**
   - Backend runs on http://localhost:5000
   - Frontend runs on http://localhost:3001
   - API calls work from frontend to backend
   - Google OAuth login works

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Rotate JWT_SECRET regularly
- Keep Google OAuth credentials secure
- Use environment-specific values for different deployments

---

## Status: ✅ ENVIRONMENT VARIABLES CREATED

**Date:** 2025-01-27  
**Phase 1 Status:** COMPLETE  
**Action Required:** Update Google OAuth credentials

