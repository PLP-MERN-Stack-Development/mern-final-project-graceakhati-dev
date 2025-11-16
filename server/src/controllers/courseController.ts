import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all courses
 * GET /api/courses
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status = 'published',
      impact_type,
      tags,
      authorId,
      page = '1',
      limit = '10',
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (impact_type) {
      query.impact_type = impact_type;
    }

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagsArray };
    }

    if (authorId) {
      query.authorId = authorId;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortStr = Array.isArray(sort) ? sort[0] : sort;
    const sortValue = typeof sortStr === 'string' ? sortStr : '-createdAt';
    const sortField = sortValue.startsWith('-')
      ? { [sortValue.substring(1)]: -1 as const }
      : { [sortValue]: 1 as const };

    // Execute query
    const courses = await Course.find(query)
      .populate('authorId', 'name email role')
      .sort(sortField)
      .skip(skip)
      .limit(limitNum);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get single course by ID or slug
 * GET /api/courses/:id
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    // Try to find by ID first, then by slug
    const course = await Course.findOne({
      $or: [{ _id: id }, { slug: id }],
    }).populate('authorId', 'name email role');

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Create a new course
 * POST /api/courses
 * Protected: instructor/admin only
 */
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const {
      title,
      slug,
      description,
      modules,
      tags,
      price,
      impact_type,
      status = 'draft',
    } = req.body as {
      title: string;
      slug?: string;
      description: string;
      modules?: any[];
      tags?: string[];
      price?: number;
      impact_type?: string;
      status?: string;
    };

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      res.status(400).json({
        success: false,
        message: 'Course with this slug already exists',
      });
      return;
    }

    // Create new course
    const course = new Course({
      title,
      slug,
      description,
      authorId: (req.user._id as any),
      modules: modules || [],
      tags: tags || [],
      price: price || 0,
      impact_type: impact_type || 'climate',
      status,
    });

    await course.save();

    // Populate author info
    await course.populate('authorId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update a course
 * PUT /api/courses/:id
 * Protected: course author, instructor, or admin only
 */
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params as { id: string };
    const updateData = req.body as Record<string, any>;

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Check authorization: author, instructor, or admin
    const userId = req.user.id || (req.user._id as any).toString();
    const isAuthor = course.authorId.toString() === userId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this course',
      });
      return;
    }

    // Update course
    Object.assign(course, updateData);
    await course.save();

    // Populate author info
    await course.populate('authorId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Delete a course
 * DELETE /api/courses/:id
 * Protected: course author, instructor, or admin only
 */
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params as { id: string };

    // Find course
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Check authorization: author, instructor, or admin
    const userId = req.user.id || (req.user._id as any).toString();
    const isAuthor = course.authorId.toString() === userId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this course',
      });
      return;
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

