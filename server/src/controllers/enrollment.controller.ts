import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';

/**
 * Enroll user in a course
 * POST /api/enrollments
 */
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { courseId } = req.body as { courseId: string };

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
      return;
    }

    // Verify course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    if (course.status !== 'published') {
      res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment',
      });
      return;
    }

    const userId = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course',
        data: {
          enrollment: existingEnrollment,
        },
      });
      return;
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      progress: 0,
      status: 'active',
    });

    await enrollment.save();
    await enrollment.populate('courseId', 'title slug description');
    await enrollment.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error enrolling in course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get user's enrollments
 * GET /api/enrollments/user/:userId
 */
export const getUserEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { userId } = req.params as { userId: string };
    const requestingUserId = req.user.id;

    // Users can only view their own enrollments unless admin/instructor
    if (userId !== requestingUserId && !['admin', 'instructor'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own enrollments',
      });
      return;
    }

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title slug description authorId impact_type')
      .populate('userId', 'name email')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        count: enrollments.length,
      },
    });
  } catch (error) {
    console.error('Get user enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get course enrollments (instructor/admin only)
 * GET /api/enrollments/course/:courseId
 */
export const getCourseEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view course enrollments',
      });
      return;
    }

    const { courseId } = req.params as { courseId: string };

    const enrollments = await Enrollment.find({ courseId })
      .populate('userId', 'name email role')
      .populate('courseId', 'title slug')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        count: enrollments.length,
      },
    });
  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update enrollment progress
 * PUT /api/enrollments/:id/progress
 */
export const updateEnrollmentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params as { id: string };
    const { progress } = req.body as { progress: number };

    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: 'Progress must be a number between 0 and 100',
      });
      return;
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    const userId = req.user.id;
    // enrollment.userId is Types.ObjectId, safe to call toString()
    const enrollmentUserId = enrollment.userId instanceof Types.ObjectId 
      ? enrollment.userId.toString() 
      : String(enrollment.userId);
    if (enrollmentUserId !== userId && !['admin', 'instructor'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own enrollment progress',
      });
      return;
    }

    enrollment.progress = progress;
    if (progress === 100 && enrollment.status === 'active') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    await enrollment.populate('courseId', 'title slug');
    await enrollment.populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Enrollment progress updated',
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error('Update enrollment progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating enrollment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Drop enrollment
 * DELETE /api/enrollments/:id
 */
export const dropEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params as { id: string };

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    const userId = req.user.id;
    // enrollment.userId is Types.ObjectId, safe to call toString()
    const enrollmentUserId = enrollment.userId instanceof Types.ObjectId 
      ? enrollment.userId.toString() 
      : String(enrollment.userId);
    if (enrollmentUserId !== userId && !['admin', 'instructor'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You can only drop your own enrollment',
      });
      return;
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment dropped successfully',
    });
  } catch (error) {
    console.error('Drop enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error dropping enrollment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

