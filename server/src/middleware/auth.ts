import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

/**
 * Extended Request interface with user property
 */
export interface AuthRequest extends Request {
  user?: IUser;
  headers: Request['headers'] & {
    authorization?: string;
  };
  params: Request['params'];
  body: Request['body'];
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

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

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
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
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };

