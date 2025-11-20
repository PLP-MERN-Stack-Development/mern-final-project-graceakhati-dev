import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setupGlobalErrorHandler } from './utils/errorHandler';
import './index.css';

// Initialize Firebase (non-blocking - wrapped in try-catch to prevent app crash)
if (typeof window !== 'undefined') {
  try {
    import('./config/firebase').catch((error) => {
      console.warn('Firebase initialization failed, continuing without Firebase:', error);
    });
  } catch (error) {
    console.warn('Firebase import failed:', error);
  }
}

// Setup global error handler for URI errors
if (typeof window !== 'undefined') {
  setupGlobalErrorHandler();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

