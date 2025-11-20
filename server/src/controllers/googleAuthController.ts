import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * Generate JWT Token
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT token string
 */
const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: jwtExpire } as jwt.SignOptions
  );
};

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 * Redirects user to Google OAuth consent screen
 */
export const googleAuth = (req: Request, res: Response) => {
  // Check if Google OAuth is configured
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI || 
      GOOGLE_CLIENT_ID.length === 0 || GOOGLE_REDIRECT_URI.length === 0 ||
      GOOGLE_CLIENT_ID.includes('<')) {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${FRONTEND_URL}/login?error=google_oauth_not_configured`);
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res);
};

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback
 * Processes Google OAuth callback and redirects to frontend with JWT token
 */
export const googleAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user: IUser | null, info: any) => {
    // Get frontend URL from environment variables
    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3001';

    if (err || !user) {
      const errorMessage = err?.message || info?.message || 'OAuth authentication failed';
      console.error('Google OAuth error:', errorMessage);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id.toString(), user.email, user.role);

      // Get redirect URL from query params or use default
      const redirectParam = req.query.redirect as string | undefined;
      const defaultRedirect = redirectParam || `${FRONTEND_URL}/student/dashboard`;
      
      // Construct redirect URL (handle both relative and absolute paths)
      const redirectUrl = defaultRedirect.startsWith('http') 
        ? defaultRedirect 
        : `${FRONTEND_URL}${defaultRedirect}`;

      // Redirect back to frontend with token
      res.redirect(`${redirectUrl}?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error('Error generating token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Token generation failed';
      res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`);
    }
  })(req, res);
};

