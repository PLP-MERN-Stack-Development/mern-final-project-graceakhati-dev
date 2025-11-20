// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoR_u8nG7MIhdcMdNGNWA0ZWamRiPwAKc",
  authDomain: "akhati-uno.firebaseapp.com",
  projectId: "akhati-uno",
  storageBucket: "akhati-uno.firebasestorage.app",
  messagingSenderId: "640491975596",
  appId: "1:640491975596:web:389b6fe6450897026b4009",
  measurementId: "G-YCZHH3BZLF"
};

// Initialize Firebase
let app;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Firebase Analytics initialization failed:', analyticsError);
      // Analytics is optional, continue without it
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Don't crash the app if Firebase fails to initialize
}

export { app, analytics };

