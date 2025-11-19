import { Response } from 'express';
import { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Module from '../models/Module';
import Course, { ICourse } from '../models/Course';

/**
 * Create a new module
 * POST /api/modules
 */
export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

    const { title, courseId, order } = req.body as {
      title: string;
      courseId: string;
      order: number;
    };

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Check authorization (instructor/admin or course author)
    const userId = req.user._id.toString();
    const isAuthor = course.authorId.toString() === userId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to create modules for this course',
      });
      return;
    }

    // Create module
    const module = new Module({
      title,
      courseId,
      order,
      lessons: [],
    });

    await module.save();

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    await module.populate('courseId', 'title slug');

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: {
        module,
      },
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating module',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get all modules for a course
 * GET /api/modules/course/:courseId
 */
export const getModulesByCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };

    const modules = await Module.find({ courseId })
      .populate('lessons', 'title order duration')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        modules,
        count: modules.length,
      },
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching modules',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get module by ID
 * GET /api/modules/:id
 */
export const getModuleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const module = await Module.findById(id)
      .populate('courseId', 'title slug')
      .populate('lessons', 'title content videoUrl duration order');

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        module,
      },
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching module',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update module
 * PUT /api/modules/:id
 */
export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
    const { title, order } = req.body as {
      title?: string;
      order?: number;
    };

    const module = await Module.findById(id).populate('courseId');
    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found',
      });
      return;
    }

    // Check authorization
    // module.courseId is populated, so it's a Course document
    let courseAuthorId: string;
    if (module.courseId instanceof Types.ObjectId) {
      // Not populated, fetch course
      const courseDoc = await Course.findById(module.courseId);
      if (!courseDoc) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }
      courseAuthorId = courseDoc.authorId.toString();
    } else {
      // Populated Course object
      const populatedCourse = module.courseId as unknown as ICourse;
      courseAuthorId = populatedCourse.authorId.toString();
    }
    const userId = req.user._id.toString();
    const isAuthor = courseAuthorId === userId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this module',
      });
      return;
    }

    if (title) module.title = title;
    if (order !== undefined) module.order = order;

    await module.save();
    await module.populate('courseId', 'title slug');
    await module.populate('lessons', 'title order');

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: {
        module,
      },
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating module',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Delete module
 * DELETE /api/modules/:id
 */
export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params as { id: string };

    const module = await Module.findById(id).populate('courseId');
    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found',
      });
      return;
    }

    // Check authorization
    // module.courseId is populated, so it's a Course document
    let courseAuthorId: string;
    if (module.courseId instanceof Types.ObjectId) {
      // Not populated, fetch course
      const courseDoc = await Course.findById(module.courseId);
      if (!courseDoc) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }
      courseAuthorId = courseDoc.authorId.toString();
    } else {
      // Populated Course object
      const populatedCourse = module.courseId as unknown as ICourse;
      courseAuthorId = populatedCourse.authorId.toString();
    }
    const userId = req.user._id.toString();
    const isAuthor = courseAuthorId === userId;
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this module',
      });
      return;
    }

    // Remove module from course
    // Get courseId from module (could be ObjectId or populated Course)
    let courseIdToRemove: Types.ObjectId;
    if (module.courseId instanceof Types.ObjectId) {
      courseIdToRemove = module.courseId;
    } else {
      // Populated Course object
      const populatedCourse = module.courseId as unknown as ICourse;
      courseIdToRemove = populatedCourse._id;
    }
    
    const courseDoc = await Course.findById(courseIdToRemove);
    if (courseDoc) {
      courseDoc.modules = courseDoc.modules.filter(
        (moduleId) => moduleId.toString() !== id
      );
      await courseDoc.save();
    }

    await Module.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully',
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting module',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

