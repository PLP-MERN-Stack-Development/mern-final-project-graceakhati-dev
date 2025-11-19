import Redis, { RedisOptions } from 'ioredis';

/**
 * Leaderboard Entry Interface
 */
export interface LeaderboardEntry {
  userId: string;
  score: number;
}

/**
 * User Rank Interface
 */
export interface UserRank {
  userId: string;
  rank: number;
  score: number;
}

/**
 * Redis Client Instance
 */
let redisClient: Redis | null = null;

/**
 * Redis Configuration
 */
const getRedisConfig = (): RedisOptions => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  // Parse Redis URL if provided
  if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on READONLY error
        }
        return false;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };
  }

  // Default configuration
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
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
    enableReadyCheck: true,
    lazyConnect: false,
  };
};

/**
 * Initialize Redis Connection
 * Returns null if Redis is disabled or unavailable
 */
export const connectRedis = async (): Promise<Redis | null> => {
  // Check if Redis is enabled via environment variable
  const enableRedis = process.env.ENABLE_REDIS === 'true';
  
  if (!enableRedis) {
    console.log('ℹ️  Redis is disabled (ENABLE_REDIS not set to "true")');
    return null;
  }

  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  try {
    const config = getRedisConfig();
    redisClient = new Redis(config);

    // Event handlers
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready');
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

    // Wait for connection
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis connection failed, continuing without Redis:', (error as Error).message);
    redisClient = null;
    return null;
  }
};

/**
 * Get Redis Client Instance
 * Returns null if Redis is not available
 */
export const getRedisClient = (): Redis | null => {
  if (!redisClient || redisClient.status !== 'ready') {
    return null;
  }
  return redisClient;
};

/**
 * Add XP to user's leaderboard score
 * Increments user's score in sorted set "leaderboard" by xp
 * 
 * @param userId - User ID
 * @param xp - XP points to add
 * @returns New total score
 * 
 * @example
 * ```typescript
 * await addXp('user123', 100);
 * // User's score increased by 100
 * ```
 */
export const addXp = async (userId: string, xp: number): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, return 0 (fallback to MongoDB-only)
      return 0;
    }
    const leaderboardKey = 'leaderboard';

    // Increment score in sorted set
    const newScore = await client.zincrby(leaderboardKey, xp, userId);

    return parseFloat(newScore);
  } catch (error) {
    console.warn('Redis addXp failed, continuing without Redis:', (error as Error).message);
    return 0;
  }
};

/**
 * Get top N users from leaderboard
 * Returns array of {userId, score} objects sorted by score (descending)
 * 
 * @param limit - Number of top users to return (default: 10)
 * @returns Array of leaderboard entries
 * 
 * @example
 * ```typescript
 * const topUsers = await getTopUsers(5);
 * // Returns: [
 * //   { userId: 'user1', score: 5000 },
 * //   { userId: 'user2', score: 4500 },
 * //   ...
 * // ]
 * ```
 */
export const getTopUsers = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, return empty array
      return [];
    }
    const leaderboardKey = 'leaderboard';

    // Get top N users with scores (ZREVRANGE with scores)
    const results = await client.zrevrange(leaderboardKey, 0, limit - 1, 'WITHSCORES');

    // Parse results: [userId1, score1, userId2, score2, ...]
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        userId: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return entries;
  } catch (error) {
    console.warn('Redis getTopUsers failed, returning empty array:', (error as Error).message);
    return [];
  }
};

/**
 * Get user's rank and score from leaderboard
 * Returns rank (1-based) and score for the user
 * 
 * @param userId - User ID
 * @returns User rank object with userId, rank, and score
 * 
 * @example
 * ```typescript
 * const rank = await getUserRank('user123');
 * // Returns: { userId: 'user123', rank: 5, score: 3500 }
 * // Returns: { userId: 'user123', rank: -1, score: 0 } if user not found
 * ```
 */
export const getUserRank = async (userId: string): Promise<UserRank> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, return default
      return {
        userId,
        rank: -1,
        score: 0,
      };
    }
    const leaderboardKey = 'leaderboard';

    // Get user's score
    const score = await client.zscore(leaderboardKey, userId);

    if (score === null) {
      // User not in leaderboard
      return {
        userId,
        rank: -1,
        score: 0,
      };
    }

    // Get user's rank (0-based, so add 1 for 1-based ranking)
    const rank = await client.zrevrank(leaderboardKey, userId);

    return {
      userId,
      rank: rank !== null ? rank + 1 : -1,
      score: parseFloat(score),
    };
  } catch (error) {
    console.warn('Redis getUserRank failed, returning default:', (error as Error).message);
    return {
      userId,
      rank: -1,
      score: 0,
    };
  }
};

/**
 * Get users around a specific rank (for pagination)
 * 
 * @param startRank - Starting rank (1-based)
 * @param endRank - Ending rank (1-based, inclusive)
 * @returns Array of leaderboard entries
 * 
 * @example
 * ```typescript
 * const users = await getUsersByRank(11, 20);
 * // Returns users ranked 11-20
 * ```
 */
export const getUsersByRank = async (
  startRank: number,
  endRank: number
): Promise<LeaderboardEntry[]> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, return empty array
      return [];
    }
    const leaderboardKey = 'leaderboard';

    // Convert to 0-based indices
    const start = startRank - 1;
    const end = endRank - 1;

    const results = await client.zrevrange(leaderboardKey, start, end, 'WITHSCORES');

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        userId: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return entries;
  } catch (error) {
    console.warn('Redis getUsersByRank failed, returning empty array:', (error as Error).message);
    return [];
  }
};

/**
 * Get total number of users in leaderboard
 * 
 * @returns Total count of users
 */
export const getLeaderboardCount = async (): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, return 0
      return 0;
    }
    const leaderboardKey = 'leaderboard';

    return await client.zcard(leaderboardKey);
  } catch (error) {
    console.warn('Redis getLeaderboardCount failed, returning 0:', (error as Error).message);
    return 0;
  }
};

/**
 * Reset user's score (set to 0)
 * 
 * @param userId - User ID
 */
export const resetUserScore = async (userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, silently succeed
      return;
    }
    const leaderboardKey = 'leaderboard';

    await client.zrem(leaderboardKey, userId);
  } catch (error) {
    console.warn('Redis resetUserScore failed, continuing:', (error as Error).message);
  }
};

/**
 * Set user's score to a specific value
 * 
 * @param userId - User ID
 * @param score - Score to set
 */
export const setUserScore = async (userId: string, score: number): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Redis not available, silently succeed
      return;
    }
    const leaderboardKey = 'leaderboard';

    await client.zadd(leaderboardKey, score, userId);
  } catch (error) {
    console.warn('Redis setUserScore failed, continuing:', (error as Error).message);
  }
};

/**
 * Close Redis Connection
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis disconnected');
  }
};

/**
 * Health Check - Test Redis Connection
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false; // Redis not enabled/available
    }
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.warn('Redis health check failed:', (error as Error).message);
    return false;
  }
};

// Export default object with all functions
export default {
  connectRedis,
  getRedisClient,
  addXp,
  getTopUsers,
  getUserRank,
  getUsersByRank,
  getLeaderboardCount,
  resetUserScore,
  setUserScore,
  disconnectRedis,
  healthCheck,
};

/**
 * USAGE EXAMPLES:
 * 
 * ```typescript
 * // 1. Initialize Redis connection (call this in server startup)
 * import { connectRedis } from './services/redis.service';
 * 
 * await connectRedis();
 * 
 * // 2. Add XP to a user
 * import { addXp } from './services/redis.service';
 * 
 * await addXp('user123', 100);
 * await addXp('user123', 50); // Total: 150
 * 
 * // 3. Get top 10 users
 * import { getTopUsers } from './services/redis.service';
 * 
 * const topUsers = await getTopUsers(10);
 * console.log(topUsers);
 * // [
 * //   { userId: 'user1', score: 5000 },
 * //   { userId: 'user2', score: 4500 },
 * //   ...
 * // ]
 * 
 * // 4. Get user's rank
 * import { getUserRank } from './services/redis.service';
 * 
 * const rank = await getUserRank('user123');
 * console.log(rank);
 * // { userId: 'user123', rank: 5, score: 3500 }
 * 
 * // 5. Get users ranked 11-20 (pagination)
 * import { getUsersByRank } from './services/redis.service';
 * 
 * const users = await getUsersByRank(11, 20);
 * 
 * // 6. Health check
 * import { healthCheck } from './services/redis.service';
 * 
 * const isHealthy = await healthCheck();
 * ```
 * 
 * TEST EXAMPLES:
 * 
 * ```typescript
 * // Test suite example (using Jest/Vitest)
 * import { 
 *   connectRedis, 
 *   addXp, 
 *   getTopUsers, 
 *   getUserRank, 
 *   resetUserScore,
 *   disconnectRedis 
 * } from './services/redis.service';
 * 
 * describe('Redis Leaderboard Service', () => {
 *   beforeAll(async () => {
 *     await connectRedis();
 *   });
 * 
 *   afterAll(async () => {
 *     await disconnectRedis();
 *   });
 * 
 *   beforeEach(async () => {
 *     // Clean up test data
 *     await resetUserScore('test-user-1');
 *     await resetUserScore('test-user-2');
 *   });
 * 
 *   test('should add XP to user', async () => {
 *     await addXp('test-user-1', 100);
 *     const rank = await getUserRank('test-user-1');
 *     expect(rank.score).toBe(100);
 *   });
 * 
 *   test('should increment XP', async () => {
 *     await addXp('test-user-1', 100);
 *     await addXp('test-user-1', 50);
 *     const rank = await getUserRank('test-user-1');
 *     expect(rank.score).toBe(150);
 *   });
 * 
 *   test('should return top users', async () => {
 *     await addXp('test-user-1', 200);
 *     await addXp('test-user-2', 100);
 *     
 *     const topUsers = await getTopUsers(2);
 *     expect(topUsers).toHaveLength(2);
 *     expect(topUsers[0].userId).toBe('test-user-1');
 *     expect(topUsers[0].score).toBe(200);
 *   });
 * 
 *   test('should return correct rank', async () => {
 *     await addXp('test-user-1', 200);
 *     await addXp('test-user-2', 100);
 *     
 *     const rank1 = await getUserRank('test-user-1');
 *     const rank2 = await getUserRank('test-user-2');
 *     
 *     expect(rank1.rank).toBe(1);
 *     expect(rank2.rank).toBe(2);
 *   });
 * 
 *   test('should return -1 rank for non-existent user', async () => {
 *     const rank = await getUserRank('non-existent-user');
 *     expect(rank.rank).toBe(-1);
 *     expect(rank.score).toBe(0);
 *   });
 * });
 * ```
 */

