/**
 * Redis Leaderboard Service for Planet Path
 * 
 * Manages user XP leaderboard using Redis sorted sets
 * Falls back to in-memory mock if Redis is not configured
 * 
 * Usage:
 *   import { addXp, getTopUsers } from './services/leaderboard.service';
 *   
 *   await addXp('user123', 50);
 *   const topUsers = await getTopUsers(10);
 */

import Redis from 'ioredis';

/**
 * Leaderboard User Interface
 */
export interface LeaderboardUser {
  userId: string;
  score: number;
  rank: number;
}

/**
 * Mock Redis implementation for development/testing
 */
class MockRedis {
  private data: Map<string, Map<string, number>> = new Map();

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.data.has(key)) {
      this.data.set(key, new Map());
    }
    const sortedSet = this.data.get(key)!;
    sortedSet.set(member, score);
    return 1;
  }

  async zincrby(key: string, increment: number, member: string): Promise<string> {
    if (!this.data.has(key)) {
      this.data.set(key, new Map());
    }
    const sortedSet = this.data.get(key)!;
    const currentScore = sortedSet.get(member) || 0;
    const newScore = currentScore + increment;
    sortedSet.set(member, newScore);
    return newScore.toString();
  }

  async zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores: 'WITHSCORES'
  ): Promise<string[]> {
    if (!this.data.has(key)) {
      return [];
    }
    const sortedSet = this.data.get(key)!;
    const entries = Array.from(sortedSet.entries())
      .sort((a, b) => b[1] - a[1]) // Sort descending
      .slice(start, stop + 1);

    const result: string[] = [];
    for (const [member, score] of entries) {
      result.push(member);
      if (withScores === 'WITHSCORES') {
        result.push(score.toString());
      }
    }
    return result;
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    if (!this.data.has(key)) {
      return null;
    }
    const sortedSet = this.data.get(key)!;
    if (!sortedSet.has(member)) {
      return null;
    }
    const entries = Array.from(sortedSet.entries())
      .sort((a, b) => b[1] - a[1]);
    const index = entries.findIndex(([m]) => m === member);
    return index >= 0 ? index : null;
  }

  async zscore(key: string, member: string): Promise<string | null> {
    if (!this.data.has(key)) {
      return null;
    }
    const sortedSet = this.data.get(key)!;
    const score = sortedSet.get(member);
    return score !== undefined ? score.toString() : null;
  }

  async quit(): Promise<void> {
    this.data.clear();
  }

  async disconnect(): Promise<void> {
    this.data.clear();
  }
}

/**
 * Get Redis client instance
 * Returns real Redis client if configured, otherwise returns mock
 */
let redisClient: Redis | MockRedis | null = null;

const getRedisClient = (): Redis | MockRedis => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
        maxRetriesPerRequest: 3,
      });

      // Event listeners
      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });

      redisClient.on('error', (err: Error) => {
        console.error('❌ Redis error:', err.message);
      });

      redisClient.on('close', () => {
        console.log('⚠️ Redis connection closed');
      });

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      return redisClient;
    } catch (error) {
      console.warn('⚠️ Failed to connect to Redis, using mock:', (error as Error).message);
      redisClient = new MockRedis();
      return redisClient;
    }
  } else {
    console.log('ℹ️  Redis not configured (REDIS_URL not set), using in-memory mock');
    redisClient = new MockRedis();
    return redisClient;
  }
};

/**
 * Leaderboard key in Redis
 */
const LEADERBOARD_KEY = 'planetpath:leaderboard';

/**
 * Add XP to a user's score
 * Increments the user's score in the leaderboard sorted set
 * 
 * @param userId - User ID
 * @param xp - XP points to add (can be negative to subtract)
 * @returns Promise<number> - New total score
 * 
 * @example
 * ```typescript
 * await addXp('user123', 50);
 * await addXp('user123', -10); // Subtract XP
 * ```
 */
export const addXp = async (userId: string, xp: number): Promise<number> => {
  try {
    const client = getRedisClient();

    if (client instanceof Redis) {
      // Real Redis
      const newScore = await client.zincrby(LEADERBOARD_KEY, xp, userId);
      return parseFloat(newScore);
    } else {
      // Mock Redis
      const newScore = await client.zincrby(LEADERBOARD_KEY, xp, userId);
      return parseFloat(newScore);
    }
  } catch (error) {
    console.error('Error adding XP:', error);
    throw new Error(`Failed to add XP: ${(error as Error).message}`);
  }
};

/**
 * Get top N users from leaderboard
 * Returns users sorted by score (descending)
 * 
 * @param limit - Number of top users to return (default: 10)
 * @returns Promise<LeaderboardUser[]> - Array of top users with rank and score
 * 
 * @example
 * ```typescript
 * const topUsers = await getTopUsers(10);
 * // Returns: [
 * //   { userId: 'user1', score: 1000, rank: 1 },
 * //   { userId: 'user2', score: 950, rank: 2 },
 * //   ...
 * // ]
 * ```
 */
export const getTopUsers = async (limit: number = 10): Promise<LeaderboardUser[]> => {
  try {
    const client = getRedisClient();

    if (client instanceof Redis) {
      // Real Redis
      const results = await client.zrevrange(
        LEADERBOARD_KEY,
        0,
        limit - 1,
        'WITHSCORES'
      );

      const users: LeaderboardUser[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];
        const score = parseFloat(results[i + 1]);
        const rank = Math.floor(i / 2) + 1;

        users.push({
          userId,
          score,
          rank,
        });
      }

      return users;
    } else {
      // Mock Redis
      const results = await client.zrevrange(
        LEADERBOARD_KEY,
        0,
        limit - 1,
        'WITHSCORES'
      );

      const users: LeaderboardUser[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];
        const score = parseFloat(results[i + 1]);
        const rank = Math.floor(i / 2) + 1;

        users.push({
          userId,
          score,
          rank,
        });
      }

      return users;
    }
  } catch (error) {
    console.error('Error getting top users:', error);
    throw new Error(`Failed to get top users: ${(error as Error).message}`);
  }
};

/**
 * Get user's rank and score
 * 
 * @param userId - User ID
 * @returns Promise<{ rank: number; score: number } | null> - User's rank and score, or null if not found
 * 
 * @example
 * ```typescript
 * const userRank = await getUserRank('user123');
 * // Returns: { rank: 5, score: 750 }
 * ```
 */
export const getUserRank = async (
  userId: string
): Promise<{ rank: number; score: number } | null> => {
  try {
    const client = getRedisClient();

    if (client instanceof Redis) {
      // Real Redis
      const [rank, score] = await Promise.all([
        client.zrevrank(LEADERBOARD_KEY, userId),
        client.zscore(LEADERBOARD_KEY, userId),
      ]);

      if (rank === null || score === null) {
        return null;
      }

      return {
        rank: rank + 1, // Redis ranks are 0-based, convert to 1-based
        score: parseFloat(score),
      };
    } else {
      // Mock Redis
      const rank = await client.zrevrank(LEADERBOARD_KEY, userId);
      const score = await client.zscore(LEADERBOARD_KEY, userId);

      if (rank === null || score === null) {
        return null;
      }

      return {
        rank: rank + 1,
        score: parseFloat(score),
      };
    }
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw new Error(`Failed to get user rank: ${(error as Error).message}`);
  }
};

/**
 * Get users around a specific rank (for pagination)
 * 
 * @param startRank - Starting rank (1-based)
 * @param endRank - Ending rank (1-based, inclusive)
 * @returns Promise<LeaderboardUser[]> - Array of users in the rank range
 * 
 * @example
 * ```typescript
 * const users = await getUsersByRankRange(11, 20); // Get ranks 11-20
 * ```
 */
export const getUsersByRankRange = async (
  startRank: number,
  endRank: number
): Promise<LeaderboardUser[]> => {
  try {
    const client = getRedisClient();

    // Convert 1-based ranks to 0-based indices
    const start = startRank - 1;
    const end = endRank - 1;

    if (client instanceof Redis) {
      // Real Redis
      const results = await client.zrevrange(
        LEADERBOARD_KEY,
        start,
        end,
        'WITHSCORES'
      );

      const users: LeaderboardUser[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];
        const score = parseFloat(results[i + 1]);
        const rank = startRank + Math.floor(i / 2);

        users.push({
          userId,
          score,
          rank,
        });
      }

      return users;
    } else {
      // Mock Redis
      const results = await client.zrevrange(
        LEADERBOARD_KEY,
        start,
        end,
        'WITHSCORES'
      );

      const users: LeaderboardUser[] = [];
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];
        const score = parseFloat(results[i + 1]);
        const rank = startRank + Math.floor(i / 2);

        users.push({
          userId,
          score,
          rank,
        });
      }

      return users;
    }
  } catch (error) {
    console.error('Error getting users by rank range:', error);
    throw new Error(`Failed to get users by rank range: ${(error as Error).message}`);
  }
};

/**
 * Get total number of users in leaderboard
 * 
 * @returns Promise<number> - Total number of users
 */
export const getLeaderboardSize = async (): Promise<number> => {
  try {
    const client = getRedisClient();

    if (client instanceof Redis) {
      return await client.zcard(LEADERBOARD_KEY);
    } else {
      // Mock Redis - count unique members
      const results = await client.zrevrange(LEADERBOARD_KEY, 0, -1, 'WITHSCORES');
      return Math.floor(results.length / 2);
    }
  } catch (error) {
    console.error('Error getting leaderboard size:', error);
    throw new Error(`Failed to get leaderboard size: ${(error as Error).message}`);
  }
};

/**
 * Reset user's score (set to 0)
 * 
 * @param userId - User ID
 * @returns Promise<void>
 */
export const resetUserScore = async (userId: string): Promise<void> => {
  try {
    const client = getRedisClient();

    if (client instanceof Redis) {
      await client.zrem(LEADERBOARD_KEY, userId);
    } else {
      // Mock Redis
      const sortedSet = (client as MockRedis)['data'].get(LEADERBOARD_KEY);
      if (sortedSet) {
        sortedSet.delete(userId);
      }
    }
  } catch (error) {
    console.error('Error resetting user score:', error);
    throw new Error(`Failed to reset user score: ${(error as Error).message}`);
  }
};

/**
 * Close Redis connection
 * Call this when shutting down the application
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient && redisClient instanceof Redis) {
    await redisClient.quit();
    redisClient = null;
  } else if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
};

export default {
  addXp,
  getTopUsers,
  getUserRank,
  getUsersByRankRange,
  getLeaderboardSize,
  resetUserScore,
  closeRedisConnection,
};

