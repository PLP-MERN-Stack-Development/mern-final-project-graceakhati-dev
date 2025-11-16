import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Assignment from '../models/Assignment';
import Course from '../models/Course';
import Lesson from '../models/Lesson';

/**
 * Create a new assignment
 * POST /api/assignments
 * Protected: instructor/admin only
 */
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      lessonId,
      courseId,
      dueDate,
      maxScore,
      attachments,
    } = req.body as {
      title: string;
      description: string;
      lessonId?: string;
      courseId?: string;
      dueDate: string;
      maxScore: number;
      attachments?: string[];
    };

    // Validate that either lessonId or courseId is provided
    if (!lessonId && !courseId) {
      res.status(400).json({
        success: false,
        message: 'Either lessonId or courseId must be provided',
      });
      return;
    }

    // Verify course exists if courseId provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }
    }

    // Verify lesson exists if lessonId provided
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
        return;
      }
    }

    const assignment = new Assignment({
      title,
      description,
      lessonId,
      courseId,
      dueDate: new Date(dueDate),
      maxScore,
      attachments: attachments || [],
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assignment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * List assignments by course
 * GET /api/assignments/course/:courseId
 */
export const listAssignmentsByCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };

    const assignments = await Assignment.find({ courseId }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        assignments,
        count: assignments.length,
      },
    });
  } catch (error) {
    console.error('List assignments by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignments',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get assignment by ID
 * GET /api/assignments/:id
 */
export const getAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const assignment = await Assignment.findById(id)
      .populate('courseId', 'title slug')
      .populate('lessonId', 'title');

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update assignment
 * PUT /api/assignments/:id
 * Protected: instructor/admin only
 */
export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData = req.body as Record<string, any>;

    // Convert dueDate string to Date if provided
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const assignment = await Assignment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating assignment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Delete assignment
 * DELETE /api/assignments/:id
 * Protected: instructor/admin only
 */
export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assignment',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

