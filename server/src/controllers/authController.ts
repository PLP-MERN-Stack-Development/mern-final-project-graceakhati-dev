import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import { validationResult } from 'express-validator';
import { getAuth } from 'firebase-admin/auth';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

interface FirebaseSignInResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const signInWithFirebasePassword = async (email: string, password: string): Promise<FirebaseSignInResponse> => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;

  if (!apiKey) {
    throw new Error('FIREBASE_WEB_API_KEY is not defined in environment variables');
  }

  try {
    const response = await axios.post<FirebaseSignInResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      'Firebase sign-in failed';
    throw new Error(message);
  }
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase();
    const auth = getAuth();

    // Ensure Firebase user does not already exist
    try {
      await auth.getUserByEmail(normalizedEmail);
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    } catch (firebaseError: any) {
      if (firebaseError.code !== 'auth/user-not-found') {
        throw firebaseError;
      }
    }

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: normalizedEmail,
      password,
      displayName: name,
    });

    // Create Firestore profile
    const user = await User.create({
      firebaseUid: firebaseUser.uid,
      name,
      email: normalizedEmail,
      password,
      role: role || 'student',
    });

    // Sign in to retrieve ID token
    const firebaseTokens = await signInWithFirebasePassword(normalizedEmail, password);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          firebaseUid: firebaseUser.uid,
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          badges: user.badges,
        },
        token: firebaseTokens.idToken,
        refreshToken: firebaseTokens.refreshToken,
        expiresIn: firebaseTokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    let firebaseSignIn: FirebaseSignInResponse;

    // Check if Firebase Web API Key is configured
    if (!process.env.FIREBASE_WEB_API_KEY) {
      console.error('FIREBASE_WEB_API_KEY is not configured');
      res.status(500).json({
        success: false,
        message: 'Authentication service is not properly configured. Please contact support.',
      });
      return;
    }

    try {
      firebaseSignIn = await signInWithFirebasePassword(normalizedEmail, password);
    } catch (firebaseError) {
      const errorMessage = firebaseError instanceof Error ? firebaseError.message : 'Unknown error';
      console.error('Firebase login error:', errorMessage);
      
      // Provide more specific error messages
      if (errorMessage.includes('INVALID_PASSWORD') || errorMessage.includes('EMAIL_NOT_FOUND')) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      } else if (errorMessage.includes('API key')) {
        res.status(500).json({
          success: false,
          message: 'Authentication service configuration error. Please contact support.',
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Login failed. Please try again.',
          error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        });
      }
      return;
    }

    const auth = getAuth();
    const firebaseUid = firebaseSignIn.localId;

    // Ensure Firestore profile exists
    let user =
      (firebaseUid && (await User.findByFirebaseUid(firebaseUid))) ||
      (await User.findByEmail(normalizedEmail));

    if (!user) {
      const firebaseUser = await auth.getUser(firebaseUid);
      user = await User.create({
        firebaseUid: firebaseUid,
        name: firebaseUser.displayName || firebaseUser.email || normalizedEmail,
        email: firebaseUser.email || normalizedEmail,
        role: 'student',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          badges: user.badges,
        },
        token: firebaseSignIn.idToken,
        refreshToken: firebaseSignIn.refreshToken,
        expiresIn: firebaseSignIn.expiresIn,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Cast req to AuthRequest to access user property
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: authReq.user.id,
          name: authReq.user.name,
          email: authReq.user.email,
          role: authReq.user.role,
          xp: authReq.user.xp,
          badges: authReq.user.badges,
          createdAt: authReq.user.createdAt,
          updatedAt: authReq.user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
    next(error);
  }
};


