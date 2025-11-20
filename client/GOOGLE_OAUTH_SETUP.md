# Google OAuth Setup Guide

## Overview

This project uses **backend OAuth flow** for Google authentication. The frontend redirects users to the backend OAuth endpoint, which handles the OAuth flow and redirects back to the frontend with a JWT token.

## Architecture

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to: /api/auth/google
    ↓
Backend redirects to: Google OAuth consent screen
    ↓
User authorizes
    ↓
Google redirects to: /api/auth/google/callback
    ↓
Backend exchanges code for token, creates/logs in user
    ↓
Backend redirects to: Frontend URL with JWT token
    ↓
Frontend saves token and redirects to dashboard
```

## Setup Steps

### 1. Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google Identity Services**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity Services" or "Google+ API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in:
     - **App name**: Planet Path (or your app name)
     - **User support email**: your-email@example.com
     - **Developer contact information**: your-email@example.com
   - Click "Save and Continue"
   - Add scopes:
     - `openid`
     - `email`
     - `profile`
   - Click "Save and Continue"
   - Add test users (if in testing mode):
     - Add your email addresses that will test the app
   - Click "Save and Continue"

4. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose **Application type**: "Web application"
   - **Name**: Planet Path Web Client (or your name)
   - **Authorized JavaScript origins**:
     - Development: `http://localhost:5173`
     - Production: `https://your-frontend-domain.com`
   - **Authorized redirect URIs** (CRITICAL - must match exactly):
     - Development: `http://localhost:5000/api/auth/google/callback`
     - Production: `https://your-backend-domain.com/api/auth/google/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these)

### 2. Backend Environment Variables

Edit `server/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL (for redirect after OAuth)
FRONTEND_URL=http://localhost:5173

# CORS (must include frontend URL)
CLIENT_URL=http://localhost:5173
```

**IMPORTANT**: 
- Remove any quotes, spaces, or extra characters
- The redirect URI must match EXACTLY (including http vs https, port numbers, trailing slashes)
- For production, update all URLs to your production domains

### 3. Frontend Environment Variables (Optional)

Edit `client/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

The frontend doesn't need Google OAuth credentials because it uses the backend OAuth flow.

### 4. Testing

1. **Start the backend server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Test Google Login**:
   - Go to http://localhost:5173/login
   - Click "Sign in with Google"
   - You should be redirected to Google OAuth consent screen
   - After authorizing, you should be redirected back to the app

## Troubleshooting

### Error 401: invalid_client

This error means Google cannot verify your OAuth client. Check:

1. **Client ID matches exactly**:
   - No spaces, quotes, or extra characters in `GOOGLE_CLIENT_ID`
   - Format: `xxxxxx-xxxxxx.apps.googleusercontent.com`

2. **Client Secret matches exactly**:
   - No spaces, quotes, or extra characters in `GOOGLE_CLIENT_SECRET`
   - Format: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

3. **Redirect URI matches exactly**:
   - Check `GOOGLE_REDIRECT_URI` matches "Authorized redirect URIs" in Google Cloud Console
   - Check for:
     - `http` vs `https`
     - Port numbers (`:5000`, `:5173`)
     - Trailing slashes
     - Exact path: `/api/auth/google/callback`

4. **OAuth Consent Screen configured**:
   - Go to Google Cloud Console > OAuth consent screen
   - Ensure app name, email, and scopes are set
   - If in testing mode, ensure your email is in test users

5. **API Enabled**:
   - Go to Google Cloud Console > APIs & Services > Library
   - Ensure "Google Identity Services" or "Google+ API" is enabled

6. **Restart server**:
   - After changing `.env` variables, restart the backend server

### Other Common Issues

- **CORS errors**: Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- **Redirect loop**: Check that `FRONTEND_URL` in backend `.env` is correct
- **Token not received**: Check browser console and backend logs for errors

## Production Deployment

### Vercel (Frontend)

1. **Set environment variables in Vercel**:
   - Go to your Vercel project > Settings > Environment Variables
   - Add: `VITE_API_URL=https://your-backend-domain.com/api`

2. **Deploy**:
   - Push to your repository
   - Vercel will automatically deploy

### Backend Deployment

1. **Set environment variables**:
   - Use your hosting platform's environment variable settings
   - Set all variables from `server/.env`

2. **Update Google Cloud Console**:
   - Add production URLs to "Authorized redirect URIs":
     - `https://your-backend-domain.com/api/auth/google/callback`
   - Add production frontend URL to "Authorized JavaScript origins":
     - `https://your-frontend-domain.com`

3. **Update `.env` variables**:
   - `GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/auth/google/callback`
   - `FRONTEND_URL=https://your-frontend-domain.com`
   - `CLIENT_URL=https://your-frontend-domain.com`

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different OAuth clients** for development and production
3. **Rotate secrets regularly** in production
4. **Use HTTPS** in production (required for OAuth)
5. **Limit OAuth scopes** to only what you need
6. **Monitor OAuth usage** in Google Cloud Console

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

