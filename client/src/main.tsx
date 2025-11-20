import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { handleGoogleOAuthCallback } from './utils/googleOAuthCallback';
import './index.css';

// Handle Google OAuth callback on app initialization
if (typeof window !== 'undefined') {
  // Call async function without blocking
  handleGoogleOAuthCallback().catch((error) => {
    console.error('Failed to handle Google OAuth callback:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

