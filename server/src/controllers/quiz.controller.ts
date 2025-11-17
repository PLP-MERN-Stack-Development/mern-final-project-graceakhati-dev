import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import Lesson from '../models/Lesson';

/**
 * Create a new quiz
 * POST /api/quizzes
 */
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only instructors and admins can create quizzes',
      });
      return;
    }

    const { title, lessonId, questions } = req.body as {
      title: string;
      lessonId: string;
      questions: Array<{
        question: string;
        options: Array<{ text: string; correct: boolean }>;
        points: number;
      }>;
    };

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
      return;
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Quiz must have at least one question',
      });
      return;
    }

    // Validate each question has at least one correct answer
    for (const question of questions) {
      const hasCorrectAnswer = question.options.some((opt) => opt.correct);
      if (!hasCorrectAnswer) {
        res.status(400).json({
          success: false,
          message: `Question "${question.question}" must have at least one correct answer`,
        });
        return;
      }
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      lessonId,
      questions,
    });

    await quiz.save();
    await quiz.populate('lessonId', 'title moduleId');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz,
      },
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating quiz',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get quiz by ID
 * GET /api/quizzes/:id
 */
export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const quiz = await Quiz.findById(id).populate('lessonId', 'title moduleId');

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        quiz,
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching quiz',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get quiz by lesson ID
 * GET /api/quizzes/lesson/:lessonId
 */
export const getQuizByLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };

    const quiz = await Quiz.findOne({ lessonId }).populate('lessonId', 'title moduleId');

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found for this lesson',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        quiz,
      },
    });
  } catch (error) {
    console.error('Get quiz by lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching quiz',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Update quiz
 * PUT /api/quizzes/:id
 */
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructorOrAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only instructors and admins can update quizzes',
      });
      return;
    }

    const { id } = req.params as { id: string };
    const { title, questions } = req.body as {
      title?: string;
      questions?: Array<{
        question: string;
        options: Array<{ text: string; correct: boolean }>;
        points: number;
      }>;
    };

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    if (title) quiz.title = title;
    if (questions) {
      // Validate questions
      if (questions.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Quiz must have at least one question',
        });
        return;
      }

      // Validate each question has at least one correct answer
      for (const question of questions) {
        const hasCorrectAnswer = question.options.some((opt) => opt.correct);
        if (!hasCorrectAnswer) {
          res.status(400).json({
            success: false,
            message: `Question "${question.question}" must have at least one correct answer`,
          });
          return;
        }
      }

      quiz.questions = questions;
    }

    await quiz.save();
    await quiz.populate('lessonId', 'title moduleId');

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        quiz,
      },
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating quiz',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Delete quiz
 * DELETE /api/quizzes/:id
 */
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
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
        message: 'Only instructors and admins can delete quizzes',
      });
      return;
    }

    const { id } = req.params as { id: string };

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting quiz',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

