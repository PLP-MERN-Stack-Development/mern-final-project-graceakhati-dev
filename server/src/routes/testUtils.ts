import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

/**
 * Test-only route: Create or get test user
 * POST /api/test/create-user
 * 
 * Only available when NODE_ENV === "test"
 * 
 * Body: { email: string, password: string, role: 'student' | 'instructor' | 'admin' }
 * Returns: { email: string, password: string }
 */
router.post('/create-user', async (req: Request, res: Response): Promise<void> => {
  // Only allow in test environment
  if (process.env.NODE_ENV !== 'test') {
    res.status(403).json({
      success: false,
      message: 'This endpoint is only available in test environment',
    });
    return;
  }

  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and role are required',
      });
      return;
    }

    // Validate role
    if (!['student', 'instructor', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Role must be student, instructor, or admin',
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - update password and role if needed
      // Password will be hashed automatically by the pre-save hook
      user.password = password; // Will be hashed by pre-save hook
      user.role = role as 'student' | 'instructor' | 'admin';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Test user updated',
        data: {
          email: user.email,
          password: password, // Return plain password for testing
        },
      });
      return;
    }

    // Create new user
    // Note: Password will be hashed automatically by the pre-save hook
    user = new User({
      name: email.split('@')[0] || 'Test User', // Extract name from email
      email: email.toLowerCase(),
      password: password, // Will be hashed by pre-save hook
      role: role as 'student' | 'instructor' | 'admin',
      xp: 0,
      badges: [],
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Test user created',
      data: {
        email: user.email,
        password: password, // Return plain password for testing
      },
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: (error as Error).message,
    });
  }
});

export default router;

