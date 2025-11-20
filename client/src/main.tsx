import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { handleGoogleOAuthCallback } from './utils/googleOAuthCallback';
import { setupGlobalErrorHandler } from './utils/errorHandler';
import './index.css';

// Setup global error handler for URI errors
if (typeof window !== 'undefined') {
  setupGlobalErrorHandler();
}

// Handle Google OAuth callback on app initialization
if (typeof window !== 'undefined') {
  // Call async function without blocking
  handleGoogleOAuthCallback().catch((error) => {
    // Suppress URI errors
    if (!error?.message?.includes('URI malformed') && !error?.message?.includes('decodeURI')) {
      console.error('Failed to handle Google OAuth callback:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

