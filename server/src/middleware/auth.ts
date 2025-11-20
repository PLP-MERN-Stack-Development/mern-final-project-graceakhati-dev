import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import User, { IUser } from '../models/User';

/**
 * Extended Request interface with user property
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const resolveUserFromFirebase = async (decoded: DecodedIdToken): Promise<IUser | null> => {
  const uid = decoded.uid;
  const email = decoded.email?.toLowerCase();

  if (!uid && !email) {
    return null;
  }

  let user: IUser | null = null;

  if (uid) {
    user = await User.findByFirebaseUid(uid);
  }

  if (!user && email) {
    user = await User.findByEmail(email);
  }

  if (!user && uid && email) {
    user = await User.create({
      firebaseUid: uid,
      name: decoded.name || email.split('@')[0],
      email,
      role: 'student',
    });
  }

  return user;
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // Cast req to AuthRequest to access user property
    const authReq = req as AuthRequest;

    // Get token from Authorization header
    const authHeader = authReq.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
      return;
    }

    // Try Firebase ID token verification first
    try {
      const decodedFirebaseToken = await getAuth().verifyIdToken(token);
      const user = await resolveUserFromFirebase(decodedFirebaseToken);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User profile not found for this Firebase token',
        });
        return;
      }

      authReq.user = user;
      next();
      return;
    } catch (firebaseError) {
      // Continue to legacy JWT verification if Firebase verification fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase token verification failed, falling back to JWT:', (firebaseError as Error).message);
      }
    }

    // Legacy JWT verification
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
      return;
    }

    authReq.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || (error as Error)?.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError || (error as Error)?.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 * @param allowedRoles - Array of allowed roles
 */
export const authorize =
  (...allowedRoles: string[]): RequestHandler =>
  (req, res, next) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userRole = authReq.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };

