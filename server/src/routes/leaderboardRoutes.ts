import { Router } from 'express';
import {
  addUserXp,
  getTopLeaderboard,
  getUserLeaderboardRank,
  getLeaderboardRange,
  getLeaderboardStats,
} from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/leaderboard/xp
 * @desc    Add XP to user
 * @access  Private
 */
router.post('/xp', authenticate, addUserXp);

/**
 * @route   GET /api/leaderboard/top
 * @desc    Get top users
 * @access  Public
 */
router.get('/top', getTopLeaderboard);

/**
 * @route   GET /api/leaderboard/rank/:userId
 * @desc    Get user's rank
 * @access  Private
 */
router.get('/rank/:userId', authenticate, getUserLeaderboardRank);

/**
 * @route   GET /api/leaderboard/range
 * @desc    Get users by rank range
 * @access  Public
 */
router.get('/range', getLeaderboardRange);

/**
 * @route   GET /api/leaderboard/stats
 * @desc    Get leaderboard statistics
 * @access  Public
 */
router.get('/stats', getLeaderboardStats);

export default router;

