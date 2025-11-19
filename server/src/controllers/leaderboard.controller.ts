/**
 * Leaderboard Controller
 * 
 * API endpoints for leaderboard functionality
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  addXp,
  getTopUsers,
  getUserRank,
  getUsersByRankRange,
  getLeaderboardSize,
} from '../services/leaderboard.service';

/**
 * Add XP to user
 * POST /api/leaderboard/xp
 */
export const addUserXp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { userId, xp } = req.body as {
      userId?: string;
      xp: number;
    };

    // Use authenticated user's ID if userId not provided
    const targetUserId = userId || req.user._id.toString();

    // Validate XP value
    if (typeof xp !== 'number' || isNaN(xp)) {
      res.status(400).json({
        success: false,
        message: 'XP must be a valid number',
      });
      return;
    }

    // Only allow users to add XP to themselves, unless admin/instructor
    if (targetUserId !== req.user._id.toString() && !['admin', 'instructor'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You can only add XP to your own account',
      });
      return;
    }

    const newScore = await addXp(targetUserId, xp);

    res.status(200).json({
      success: true,
      message: 'XP added successfully',
      data: {
        userId: targetUserId,
        xpAdded: xp,
        newScore,
      },
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding XP',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get top users
 * GET /api/leaderboard/top?limit=10
 */
export const getTopLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);

    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
      return;
    }

    const topUsers = await getTopUsers(limit);

    res.status(200).json({
      success: true,
      data: {
        users: topUsers,
        count: topUsers.length,
      },
    });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get user's rank
 * GET /api/leaderboard/rank/:userId
 */
export const getUserLeaderboardRank = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params as { userId: string };

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const requestingUserId = req.user._id.toString();

    // Users can only view their own rank unless admin/instructor
    if (userId !== requestingUserId && !['admin', 'instructor'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own rank',
      });
      return;
    }

    const rankData = await getUserRank(userId);

    if (!rankData) {
      res.status(404).json({
        success: false,
        message: 'User not found in leaderboard',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        ...rankData,
      },
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user rank',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get users by rank range (for pagination)
 * GET /api/leaderboard/range?start=11&end=20
 */
export const getLeaderboardRange = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const startRank = parseInt((req.query.start as string) || '1', 10);
    const endRank = parseInt((req.query.end as string) || '10', 10);

    if (isNaN(startRank) || isNaN(endRank) || startRank < 1 || endRank < startRank) {
      res.status(400).json({
        success: false,
        message: 'Invalid rank range. Start must be >= 1 and end must be >= start',
      });
      return;
    }

    if (endRank - startRank > 100) {
      res.status(400).json({
        success: false,
        message: 'Rank range cannot exceed 100 users',
      });
      return;
    }

    const users = await getUsersByRankRange(startRank, endRank);

    res.status(200).json({
      success: true,
      data: {
        users,
        startRank,
        endRank,
        count: users.length,
      },
    });
  } catch (error) {
    console.error('Get leaderboard range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard range',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

/**
 * Get leaderboard statistics
 * GET /api/leaderboard/stats
 */
export const getLeaderboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, topUsers] = await Promise.all([
      getLeaderboardSize(),
      getTopUsers(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        top10: topUsers,
      },
    });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard stats',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

