import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

/**
 * Passport Google OAuth Strategy Configuration
 * Only initializes if Google OAuth credentials are provided
 */
let GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
let GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI?.trim();

// Auto-construct redirect URI if not provided or if it points to frontend
// The redirect URI MUST point to the backend, not the frontend
if (!GOOGLE_REDIRECT_URI || GOOGLE_REDIRECT_URI.includes('netlify.app') || GOOGLE_REDIRECT_URI.includes('localhost:3001')) {
  // Construct backend URL from environment or use default
  const BACKEND_URL = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'https://planet-path-backend.onrender.com';
  GOOGLE_REDIRECT_URI = `${BACKEND_URL}/api/auth/google/callback`;
  console.log(`ℹ️  Auto-constructed GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}`);
}

// Fix common mistake: Remove http:// or https:// prefix from Client ID if present
if (GOOGLE_CLIENT_ID) {
  GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID.replace(/^https?:\/\//, '');
}

// Check if all credentials are provided and not empty
// Also check they're not placeholder values
const hasGoogleCredentials = 
  GOOGLE_CLIENT_ID && 
  GOOGLE_CLIENT_SECRET && 
  GOOGLE_REDIRECT_URI &&
  GOOGLE_CLIENT_ID.length > 0 &&
  GOOGLE_CLIENT_SECRET.length > 0 &&
  GOOGLE_REDIRECT_URI.length > 0 &&
  !GOOGLE_CLIENT_ID.includes('<') && // Not a placeholder like <your_google_client_id>
  !GOOGLE_CLIENT_SECRET.includes('<') &&
  !GOOGLE_REDIRECT_URI.includes('<') &&
  !GOOGLE_CLIENT_ID.startsWith('http://') && // Not a URL (common mistake)
  !GOOGLE_CLIENT_ID.startsWith('https://');

if (hasGoogleCredentials) {
  try {
    // Initialize GoogleStrategy only if all credentials are available
    // Double-check that values are not empty before passing to Strategy
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error('Google OAuth credentials are incomplete');
    }
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_REDIRECT_URI,
        },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          // Extract user information from Google profile
          const { id: googleId, emails, name } = profile;
          const email = emails?.[0]?.value;
          const displayName = name?.displayName || `${name?.givenName || ''} ${name?.familyName || ''}`.trim();

          if (!email) {
            return done(new Error('Email not provided by Google'), null);
          }

          // Find user by email or googleId
          let user = await User.findByEmailOrGoogleId(email.toLowerCase(), googleId);

          if (user) {
            // Update googleId if not set
            if (!user.googleId) {
              await User.update(user.id, { googleId });
              user = await User.findById(user.id);
              if (!user) throw new Error('Failed to update user');
            }
          } else {
            // Create new user
            user = await User.create({
              name: displayName || email.split('@')[0],
              email: email.toLowerCase(),
              password: '', // Google users don't need password
              googleId,
              role: 'student',
              xp: 0,
              badges: [],
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
      )
    );
    console.log('✅ Google OAuth Strategy initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Google OAuth Strategy:', error);
    console.warn('⚠️  Google OAuth will be disabled.');
  }
} else {
  // Google OAuth is disabled - silently skip initialization
  // No warning needed since we're using Firestore authentication only
}

/**
 * Serialize user for session (not used with JWT, but required by Passport)
 */
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id || user._id);
});

/**
 * Deserialize user from session (not used with JWT, but required by Passport)
 */
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

