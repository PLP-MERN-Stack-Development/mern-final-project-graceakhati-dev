import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../services/redis.service';
import User from '../models/User';

/**
 * Event Types
 */
export type EventName = 'project_verified' | 'module_completed';

/**
 * Event Payload Interface
 */
export interface EventPayload {
  userId: string;
  [key: string]: any;
}

/**
 * Badge Names
 */
export const BADGES = {
  TRAILBLAZER: 'Trailblazer',
  IMPACT_HERO: 'Impact Hero',
} as const;

/**
 * XP Thresholds for Badges
 */
export const XP_THRESHOLDS = {
  TRAILBLAZER: 200,
  IMPACT_HERO: 500,
} as const;

/**
 * BullMQ Queue Instance
 */
let eventsQueue: Queue<EventPayload> | null = null;

/**
 * BullMQ Worker Instance
 */
let eventsWorker: Worker<EventPayload> | null = null;

/**
 * Initialize Events Queue
 * Returns null if Redis is not available
 */
export const initializeQueue = (): Queue<EventPayload> | null => {
  if (eventsQueue) {
    return eventsQueue;
  }

  try {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      console.warn('⚠️  Redis not available, queue not initialized');
      return null;
    }
    
    // Get Redis connection config
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Parse Redis URL or use direct config
    let connectionConfig: any;
    if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
      // Use Redis URL directly
      connectionConfig = redisUrl;
    } else {
      // Use connection object
      connectionConfig = {
        host: redisClient.options.host || process.env.REDIS_HOST || 'localhost',
        port: redisClient.options.port || parseInt(process.env.REDIS_PORT || '6379', 10),
        password: redisClient.options.password || process.env.REDIS_PASSWORD,
        db: redisClient.options.db || parseInt(process.env.REDIS_DB || '0', 10),
      };
    }
    
    // Create queue with Redis connection
    eventsQueue = new Queue<EventPayload>('eventsQueue', {
      connection: connectionConfig,
    });

    console.log('✅ Events queue initialized');
    return eventsQueue;
  } catch (error) {
    console.warn('⚠️  Failed to initialize events queue, continuing without queue:', (error as Error).message);
    return null;
  }
};

/**
 * Initialize Events Worker
 * Returns null if Redis is not available
 */
export const initializeWorker = (): Worker<EventPayload> | null => {
  if (eventsWorker) {
    return eventsWorker;
  }

  try {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      console.warn('⚠️  Redis not available, worker not initialized');
      return null;
    }
    
    // Get Redis connection config
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Parse Redis URL or use direct config
    let connectionConfig: any;
    if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
      // Use Redis URL directly
      connectionConfig = redisUrl;
    } else {
      // Use connection object
      connectionConfig = {
        host: redisClient.options.host || process.env.REDIS_HOST || 'localhost',
        port: redisClient.options.port || parseInt(process.env.REDIS_PORT || '6379', 10),
        password: redisClient.options.password || process.env.REDIS_PASSWORD,
        db: redisClient.options.db || parseInt(process.env.REDIS_DB || '0', 10),
      };
    }
    
    // Create worker to process events
    eventsWorker = new Worker<EventPayload>(
      'eventsQueue',
      async (job: Job<EventPayload>) => {
        const { name, data } = job;
        console.log(`Processing event: ${name}`, data);

        switch (name) {
          case 'project_verified':
            await handleProjectVerified(data);
            break;
          case 'module_completed':
            await handleModuleCompleted(data);
            break;
          default:
            console.warn(`Unknown event type: ${name}`);
        }
      },
      {
        connection: connectionConfig,
        concurrency: 5, // Process up to 5 jobs concurrently
      }
    );

    // Worker event handlers
    eventsWorker.on('completed', (job: Job<EventPayload>) => {
      console.log(`✅ Event processed: ${job.name}`, job.data);
    });

    eventsWorker.on('failed', (job: Job<EventPayload> | undefined, err: Error) => {
      console.error(`❌ Event failed: ${job?.name}`, err);
    });

    eventsWorker.on('error', (err: Error) => {
      console.error('❌ Worker error:', err);
    });

    console.log('✅ Events worker initialized');
    return eventsWorker;
  } catch (error) {
    console.warn('⚠️  Failed to initialize events worker, continuing without worker:', (error as Error).message);
    return null;
  }
};

/**
 * Handle project_verified event
 * Adds 50 XP to user
 */
async function handleProjectVerified(payload: EventPayload): Promise<void> {
  const { userId } = payload;

  if (!userId) {
    throw new Error('userId is required for project_verified event');
  }

  // Add XP
  await addXp(userId, 50);
}

/**
 * Handle module_completed event
 * Placeholder for future implementation
 */
async function handleModuleCompleted(payload: EventPayload): Promise<void> {
  const { userId } = payload;

  if (!userId) {
    throw new Error('userId is required for module_completed event');
  }

  // TODO: Implement module completion logic
  console.log(`Module completed for user: ${userId}`);
}

/**
 * Add XP to user
 * Updates both MongoDB User model and Redis leaderboard
 * 
 * @param userId - User ID
 * @param xp - XP points to add
 * @returns Updated user XP
 */
export async function addXp(userId: string, xp: number): Promise<number> {
  try {
    // Validate userId (Firestore IDs are strings)
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid userId format');
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error(`User not found: ${userId}`);
    }

    // Increment XP
    const newXp = (currentUser.xp || 0) + xp;
    const user = await User.update(userId, { xp: newXp });

    // Update Redis leaderboard (if Redis is available)
    try {
      const { addXp: addXpToLeaderboard } = await import('../services/redis.service');
      await addXpToLeaderboard(userId, xp);
    } catch (redisError) {
      // Redis might not be available, but continue with MongoDB update
      console.warn('Redis leaderboard update failed, continuing with MongoDB update:', redisError);
    }

    // Check for badge eligibility
    await checkBadgeEligibility(userId, user.xp);

    return user.xp;
  } catch (error) {
    console.error('Error adding XP:', error);
    throw new Error(`Failed to add XP: ${(error as Error).message}`);
  }
}

/**
 * Award badge to user
 * Adds badge to user's badges array if not already present
 * 
 * @param userId - User ID
 * @param badgeName - Badge name to award
 * @returns Updated user badges array
 */
export async function awardBadge(userId: string, badgeName: string): Promise<string[]> {
  try {
    // Validate userId (Firestore IDs are strings)
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid userId format');
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error(`User not found: ${userId}`);
    }

    // Add badge only if not already present (prevent duplicates)
    const currentBadges = currentUser.badges || [];
    let user: typeof currentUser;
    if (!currentBadges.includes(badgeName)) {
      const updatedBadges = [...currentBadges, badgeName];
      user = await User.update(userId, { badges: updatedBadges });
    } else {
      // Badge already exists, return current user
      user = currentUser;
    }

    console.log(`✅ Badge awarded: ${badgeName} to user ${userId}`);
    return user.badges;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw new Error(`Failed to award badge: ${(error as Error).message}`);
  }
}

/**
 * Check badge eligibility based on XP
 * Awards badges if XP thresholds are met
 * 
 * @param userId - User ID
 * @param currentXp - Current XP value
 */
async function checkBadgeEligibility(userId: string, currentXp: number): Promise<void> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    const userBadges = user.badges || [];

    // Check for Trailblazer badge (XP > 200)
    if (currentXp >= XP_THRESHOLDS.TRAILBLAZER && !userBadges.includes(BADGES.TRAILBLAZER)) {
      await awardBadge(userId, BADGES.TRAILBLAZER);
    }

    // Check for Impact Hero badge (XP > 500)
    if (currentXp >= XP_THRESHOLDS.IMPACT_HERO && !userBadges.includes(BADGES.IMPACT_HERO)) {
      await awardBadge(userId, BADGES.IMPACT_HERO);
    }
  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    // Don't throw - badge checking is not critical
  }
}

/**
 * Dispatch event to queue
 * Adds event job to the eventsQueue for processing
 * 
 * @param eventName - Event name
 * @param payload - Event payload (must include userId)
 * @returns Job ID
 */
export async function dispatchEvent(eventName: EventName, payload: EventPayload): Promise<string | null> {
  try {
    if (!eventsQueue) {
      // Try to initialize queue if not already initialized
      const queue = initializeQueue();
      if (!queue) {
        // Redis not available, process event synchronously
        console.log(`ℹ️  Processing event synchronously (Redis unavailable): ${eventName}`);
        await handleEventDirectly(eventName, payload);
        return null;
      }
    }

    if (!eventsQueue) {
      // Still no queue, process directly
      console.log(`ℹ️  Processing event synchronously (queue unavailable): ${eventName}`);
      await handleEventDirectly(eventName, payload);
      return null;
    }

    // Validate payload
    if (!payload.userId) {
      throw new Error('payload.userId is required');
    }

    // Add job to queue
    const job = await eventsQueue.add(eventName, payload, {
      attempts: 3, // Retry up to 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 second delay
      },
    });

    console.log(`📤 Event dispatched: ${eventName}`, { jobId: job.id, payload });
    return job.id!;
  } catch (error) {
    // If queue fails, process event directly
    console.warn(`⚠️  Queue dispatch failed, processing event directly: ${(error as Error).message}`);
    try {
      await handleEventDirectly(eventName, payload);
      return null;
    } catch (directError) {
      console.error('Error processing event directly:', directError);
      // Don't throw - event processing is not critical
      return null;
    }
  }
}

/**
 * Handle event directly without queue (fallback when Redis unavailable)
 */
async function handleEventDirectly(eventName: EventName, payload: EventPayload): Promise<void> {
  switch (eventName) {
    case 'project_verified':
      await handleProjectVerified(payload);
      break;
    case 'module_completed':
      await handleModuleCompleted(payload);
      break;
    default:
      console.warn(`Unknown event type: ${eventName}`);
  }
}

/**
 * Close queue and worker connections
 */
export async function closeConnections(): Promise<void> {
  try {
    if (eventsWorker) {
      await eventsWorker.close();
      eventsWorker = null;
      console.log('✅ Events worker closed');
    }

    if (eventsQueue) {
      await eventsQueue.close();
      eventsQueue = null;
      console.log('✅ Events queue closed');
    }
  } catch (error) {
    console.error('Error closing connections:', error);
  }
}

// Queue and worker will be initialized in server.ts after Redis connection

