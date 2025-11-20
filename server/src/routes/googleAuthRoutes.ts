import { Router, Request, Response } from 'express';
import axios, { AxiosError, AxiosResponse } from 'axios';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface GoogleTokenInfo {
  iss: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  aud: string;
  exp: string;
  iat: string;
}

interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

interface GoogleErrorResponse {
  error?: string;
  error_description?: string;
}

function isGoogleTokenResponse(data: unknown): data is GoogleTokenResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return typeof obj.access_token === 'string' && typeof obj.id_token === 'string';
}

function isGoogleTokenInfo(data: unknown): data is GoogleTokenInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.sub === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string'
  );
}

function isGoogleUserProfile(data: unknown): data is GoogleUserProfile {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string'
  );
}

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

router.get('/', (_req: Request, res: Response): void => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      res.status(500).json({
        success: false,
        message: 'Google OAuth configuration missing',
      });
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to Google OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redirect to Google OAuth',
    });
  }
});

router.get('/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const queryCode = req.query.code;
    const code: string | undefined = typeof queryCode === 'string' ? queryCode : undefined;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Authorization code not provided',
      });
      return;
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      console.error('Missing Google OAuth environment variables');
      res.status(500).json({
        success: false,
        message: 'Google OAuth configuration incomplete',
      });
      return;
    }

    let tokenResponse: AxiosResponse<GoogleTokenResponse>;
    try {
      tokenResponse = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (error) {
      const axiosError = error as AxiosError<GoogleErrorResponse>;
      const errorData: GoogleErrorResponse = axiosError.response?.data || {};
      console.error('Google token exchange failed:', {
        status: axiosError.response?.status,
        data: errorData,
      });
      res.status(401).json({
        success: false,
        message: 'Failed to exchange authorization code',
        error: process.env.NODE_ENV === 'development' ? errorData.error_description : undefined,
      });
      return;
    }

    const tokensData: GoogleTokenResponse = tokenResponse.data;
    if (!isGoogleTokenResponse(tokensData)) {
      console.error('Invalid token response structure:', tokensData);
      res.status(500).json({
        success: false,
        message: 'Invalid token response from Google',
      });
      return;
    }

    const tokens: GoogleTokenResponse = tokensData;
    const { access_token, id_token } = tokens;

    if (!access_token || !id_token) {
      res.status(500).json({
        success: false,
        message: 'Access token or ID token not received from Google',
      });
      return;
    }

    let tokenInfoResponse: AxiosResponse<GoogleTokenInfo>;
    try {
      tokenInfoResponse = await axios.get<GoogleTokenInfo>(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
      );
    } catch (error) {
      const axiosError = error as AxiosError<GoogleErrorResponse>;
      const errorData: GoogleErrorResponse = axiosError.response?.data || {};
      console.error('Google token validation failed:', {
        status: axiosError.response?.status,
        data: errorData,
      });
      res.status(401).json({
        success: false,
        message: 'Failed to validate Google token',
        error: process.env.NODE_ENV === 'development' ? errorData.error_description : undefined,
      });
      return;
    }

    const tokenInfoData: GoogleTokenInfo = tokenInfoResponse.data;
    if (!isGoogleTokenInfo(tokenInfoData)) {
      console.error('Invalid token info structure:', tokenInfoData);
      res.status(500).json({
        success: false,
        message: 'Invalid token info response from Google',
      });
      return;
    }

    const tokenInfo: GoogleTokenInfo = tokenInfoData;
    const googleId: string = tokenInfo.sub;
    const email: string = tokenInfo.email;
    const name: string = tokenInfo.name;

    if (!email || !name || !googleId) {
      res.status(500).json({
        success: false,
        message: 'Incomplete user data from Google token',
      });
      return;
    }

    let userInfoResponse: AxiosResponse<GoogleUserProfile>;
    try {
      userInfoResponse = await axios.get<GoogleUserProfile>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    } catch (error) {
      const axiosError = error as AxiosError<GoogleErrorResponse>;
      const errorData: GoogleErrorResponse = axiosError.response?.data || {};
      console.error('Google user info fetch failed:', {
        status: axiosError.response?.status,
        data: errorData,
      });
      res.status(401).json({
        success: false,
        message: 'Failed to fetch user info from Google',
        error: process.env.NODE_ENV === 'development' ? errorData.error_description : undefined,
      });
      return;
    }

    const userData: GoogleUserProfile = userInfoResponse.data;
    if (!isGoogleUserProfile(userData)) {
      console.error('Invalid user profile structure:', userData);
      res.status(500).json({
        success: false,
        message: 'Invalid user profile response from Google',
      });
      return;
    }

    const googleUser: GoogleUserProfile = userData;
    const userEmail: string = googleUser.email || email;
    const userName: string = googleUser.name || name;
    const userId: string = googleUser.id || googleId;

    if (!userEmail || !userName || !userId) {
      res.status(500).json({
        success: false,
        message: 'Incomplete user profile data from Google',
      });
      return;
    }

    let user: IUser | null = await User.findOne({
      $or: [{ email: userEmail.toLowerCase() }, { googleId: userId }],
    });

    if (!user) {
      user = new User({
        name: userName,
        email: userEmail.toLowerCase(),
        googleId: userId,
        password: '',
        role: 'student',
        xp: 0,
        badges: [],
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = userId;
      await user.save();
    }

    const token: string = generateToken(user._id.toString(), user.email, user.role);

    res.redirect(`${FRONTEND_URL}/auth/success?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
    res.redirect(
      `${FRONTEND_URL}/auth/error?error=${encodeURIComponent(errorMessage)}`
    );
  }
});

export default router;
