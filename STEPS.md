# Firestore Authentication Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore enabled
- Firebase service account key (JSON)

## Step 1: Create Firebase Project

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click "Add project" or "Create a project"
   - Enter project name (e.g., "Planet Path")
   - Disable Google Analytics (optional)
   - Click "Create project"

3. **Enable Firestore:**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to you)
   - Click "Enable"

## Step 2: Generate Service Account Key

1. **Go to Project Settings:**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Service Accounts Tab:**
   - Click "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" in the dialog
   - A JSON file will download - **SAVE THIS FILE SECURELY**

3. **Copy the JSON Content:**
   - Open the downloaded JSON file
   - Copy the entire JSON content
   - You'll need this for the backend `.env` file

## Step 3: Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install `firebase-admin` package.

3. **Create `.env` file:**
   Create `server/.env` with the following:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Firestore Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
   FIREBASE_WEB_API_KEY=your-firebase-web-api-key
   
   # JWT Secret (generate a random string, min 32 characters)
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_EXPIRE=7d

   # Frontend URL (for redirects after OAuth)
   FRONTEND_URL=http://localhost:3001
   CLIENT_URL=http://localhost:3001

   # Google OAuth (Optional - for Google Sign-In)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   ```

4. **Important Notes for `.env`:**
   - `FIREBASE_PROJECT_ID`: Found in Firebase Console → Project Settings → General
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Paste the entire JSON from the downloaded service account key file
     - Must be on a single line or properly escaped
     - Example: `FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"my-project",...}`
   - `JWT_SECRET`: Generate a random string (min 32 characters)
     - You can use: `openssl rand -base64 32` (on Mac/Linux)
     - Or use an online generator

5. **Run the backend server:**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:5000`
   - You should see: "✅ Firestore Connection Successful!"

## Step 4: Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Create `client/.env`:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the frontend:**
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:3001`

## Step 5: Test Authentication

1. **Start both servers:**
   - Terminal 1: `cd server && npm run dev`
   - Terminal 2: `cd client && npm run dev`

2. **Test Registration:**
   - Open browser: `http://localhost:3001`
   - Click "Sign up"
   - Fill in name, email, password
   - Submit form
   - Should redirect to dashboard

3. **Test Login:**
   - Go to `http://localhost:3001/login`
   - Enter email and password
   - Should redirect to dashboard

4. **Verify in Firestore:**
   - Go to Firebase Console → Firestore Database
   - You should see a `users` collection
   - Each user document contains: name, email, role, xp, badges, etc.

## Step 6: Google OAuth Setup (Optional)

If you want Google Sign-In:

1. **Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - Select your Firebase project (or create OAuth credentials)
   - Go to "APIs & Services" → "Credentials"
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

2. **Update Backend `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   ```

3. **Test Google OAuth:**
   - Click "Sign up with Google" or "Continue with Google"
   - Should redirect to Google login
   - After login, redirects back to your app

## Troubleshooting

**Issue: "Firestore Connection Failed"**
- ✅ Check `FIREBASE_PROJECT_ID` matches your Firebase project
- ✅ Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON (entire JSON on one line)
- ✅ Ensure service account key file is valid
- ✅ Check Firestore is enabled in Firebase Console

**Issue: "FIREBASE_SERVICE_ACCOUNT_KEY must be a valid JSON string"**
- ✅ Make sure the entire JSON is on one line in `.env`
- ✅ Or properly escape newlines if using multi-line
- ✅ Verify JSON is valid (use JSON validator)

**Issue: "User not found" after login**
- ✅ Check Firestore `users` collection exists
- ✅ Verify user was created successfully
- ✅ Check email is stored in lowercase

**Issue: Frontend can't connect to backend**
- ✅ Check `client/.env` has `VITE_API_URL=http://localhost:5000`
- ✅ Verify backend is running on port 5000
- ✅ Check browser console for CORS errors

## Firestore Security Rules (Development)

**📍 WHERE TO ADD THESE RULES:**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project (`akhati-uno`)

2. **Navigate to Firestore Rules:**
   - Click "Firestore Database" in the left sidebar
   - Click on the "Rules" tab (at the top, next to "Data", "Indexes", "Usage")

3. **Replace the existing rules** with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if true; // Allow public read for development
    }
  }
}
```

4. **Click "Publish"** button to save the rules

**⚠️ Important:** 
- These rules allow public read access for development
- Update for production to restrict access appropriately
- Rules are NOT added to your codebase - they're configured in Firebase Console

## Deployment to Render

### Backend Deployment (Render)

1. **Create a Render Account:**
   - Go to https://render.com
   - Sign up or log in

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure Build Settings:**
   - **Name:** `planet-path-backend` (or your preferred name)
   - **Root Directory:** `server` (important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier is fine for development

4. **Set Environment Variables in Render:**
   Click "Environment" tab and add these variables:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-url.onrender.com
   FIREBASE_PROJECT_ID=akhati-uno
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"akhati-uno",...}
   ```
   
   **⚠️ Important for FIREBASE_SERVICE_ACCOUNT_KEY:**
   - Copy the ENTIRE JSON content from your service account key file
   - Paste it as a single line (no line breaks)
   - Escape any quotes if needed, or Render will handle it automatically
   - Example format: `{"type":"service_account","project_id":"akhati-uno","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}`

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)
   - Your backend URL will be: `https://your-service-name.onrender.com`

### Frontend Deployment (Render)

1. **Create Another Web Service:**
   - Click "New +" → "Web Service"
   - Select the same GitHub repository

2. **Configure Build Settings:**
   - **Name:** `planet-path-frontend` (or your preferred name)
   - **Root Directory:** `client` (important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview` (or use a static site if preferred)
   - **Instance Type:** Free tier is fine

3. **Set Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend-service-name.onrender.com
   ```
   Replace `your-backend-service-name` with your actual backend service name from Render

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your frontend URL will be: `https://your-frontend-service-name.onrender.com`

### Post-Deployment Checklist

- [ ] Backend is accessible at `https://your-backend.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] Frontend can connect to backend API
- [ ] User registration works
- [ ] User login works
- [ ] Users appear in Firestore database

### Troubleshooting Firestore Connection

**If users aren't appearing in Firestore:**

1. **Check Backend Logs in Render:**
   - Go to your backend service in Render
   - Click "Logs" tab
   - Look for Firestore connection messages
   - Should see: `✅ Firestore Connection Successful!`

2. **Verify Environment Variables:**
   - Check that `FIREBASE_PROJECT_ID` matches your Firebase project
   - Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is the complete JSON (no truncation)
   - The JSON should start with `{"type":"service_account",...}`

3. **Test Firestore Connection Locally:**
   ```bash
   cd server
   npm run dev
   ```
   - Check console for Firestore connection success message
   - Try registering a user
   - Check Firebase Console → Firestore Database → `users` collection

4. **Common Issues:**
   - **Missing FIREBASE_SERVICE_ACCOUNT_KEY:** Backend will fail to start
   - **Invalid JSON:** Check that the entire JSON is on one line in Render
   - **Wrong Project ID:** Users won't appear in the correct Firestore database
   - **Firestore not initialized:** Check server logs for initialization errors

5. **Verify in Firebase Console:**
   - Go to Firebase Console → Firestore Database
   - Click on "Data" tab
   - Look for `users` collection
   - New users should appear here after registration

## Production Deployment (General)

1. **Update Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Update rules to restrict access appropriately:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Update Frontend Environment Variables:**
   - Change `VITE_API_URL` to your production backend URL
   - Rebuild and redeploy frontend

## Quick Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Service account key downloaded
- [ ] Backend `.env` has `FIREBASE_PROJECT_ID`
- [ ] Backend `.env` has `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON)
- [ ] Backend `.env` has `JWT_SECRET` (min 32 characters)
- [ ] Frontend `.env` has `VITE_API_URL=http://localhost:5000`
- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Users appear in Firestore `users` collection

---

## Summary

**Firestore Authentication Flow:**
1. User registers/logs in → Backend validates
2. Backend creates/updates user in Firestore `users` collection
3. Backend generates JWT token
4. Frontend stores token and uses it for authenticated requests
5. Backend middleware verifies token and fetches user from Firestore

**Key Files:**
- `server/src/config/firestore.ts` - Firestore initialization
- `server/src/models/User.ts` - User model (Firestore operations)
- `server/src/controllers/authController.ts` - Auth logic
- `server/src/middleware/auth.ts` - JWT verification
