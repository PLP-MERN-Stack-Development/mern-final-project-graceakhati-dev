import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lesson from '../models/Lesson';
import Module from '../models/Module';

/**
 * Create a new lesson
 * POST /api/lessons
 */
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, videoUrl, duration, order, moduleId } = req.body as {
      title: string;
      content: string;
      videoUrl?: string;
      duration?: number;
      order: number;
      moduleId: string;
    };

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found',
      });
      return;
    }

    // Create lesson
    const lesson = new Lesson({
      title,
      content,
      videoUrl,
      duration,
      order,
      moduleId,
    });

    await lesson.save();

    // Add lesson to module's lessons array
    module.lessons.push(lesson._id as any);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating lesson',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update a lesson
 * PUT /api/lessons/:id
 */
export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData = req.body as Record<string, any>;

    const lesson = await Lesson.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lesson',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Delete a lesson
 * DELETE /api/lessons/:id
 */
export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
      return;
    }

    // Remove lesson from module's lessons array
    const module = await Module.findById(lesson.moduleId);
    if (module) {
      module.lessons = module.lessons.filter(
        (lessonId) => lessonId.toString() !== id
      ) as any;
      await module.save();
    }

    await Lesson.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting lesson',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get lessons by module ID
 * GET /api/lessons/module/:moduleId
 */
export const getLessonsByModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params as { moduleId: string };

    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        lessons,
        count: lessons.length,
      },
    });
  } catch (error) {
    console.error('Get lessons by module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lessons',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

