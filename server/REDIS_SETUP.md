# Redis Leaderboard Service Setup Guide

This guide explains how to set up and use the Redis leaderboard service for tracking user XP and rankings.

## Installation

Install the required dependency:

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

## Environment Variables

Add Redis configuration to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
# OR use individual settings:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password (optional)
REDIS_DB=0
```

### Redis Cloud / Production Examples

**Redis Cloud:**
```env
REDIS_URL=redis://default:password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345
```

**AWS ElastiCache:**
```env
REDIS_HOST=your-cluster.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
```

**Docker Redis:**
```env
REDIS_URL=redis://localhost:6379
```

## Server Integration

Initialize Redis connection in your server startup:

```typescript
// server/src/server.ts
import { connectRedis } from './services/redis.service';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to Redis
    await connectRedis();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
```

## API Usage Examples

### Example 1: Award XP After Course Completion

```typescript
// server/src/controllers/courseController.ts
import { addXp, getUserRank } from '../services/redis.service';

export const completeCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!._id.toString();
    
    // Award XP for course completion
    const xpAwarded = 100;
    const newScore = await addXp(userId, xpAwarded);
    
    // Get updated rank
    const rank = await getUserRank(userId);
    
    res.json({
      success: true,
      message: 'Course completed!',
      data: {
        xpAwarded,
        totalScore: newScore,
        rank: rank.rank,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Example 2: Get Leaderboard Endpoint

```typescript
// server/src/controllers/leaderboardController.ts
import { getTopUsers, getUserRank, getUsersByRank } from '../services/redis.service';
import { Request, Response } from 'express';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topUsers = await getTopUsers(limit);
    
    res.json({
      success: true,
      data: {
        leaderboard: topUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserLeaderboardInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const rank = await getUserRank(userId);
    
    res.json({
      success: true,
      data: {
        rank,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboardPage = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const startRank = (page - 1) * pageSize + 1;
    const endRank = page * pageSize;
    
    const users = await getUsersByRank(startRank, endRank);
    
    res.json({
      success: true,
      data: {
        page,
        pageSize,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Example 3: Leaderboard Routes

```typescript
// server/src/routes/leaderboardRoutes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLeaderboard,
  getUserLeaderboardInfo,
  getLeaderboardPage,
} from '../controllers/leaderboardController';

const router = Router();

router.get('/', getLeaderboard);
router.get('/me', authenticate, getUserLeaderboardInfo);
router.get('/page', getLeaderboardPage);

export default router;
```

## Available Functions

### Core Functions

- `connectRedis()` - Initialize Redis connection
- `addXp(userId, xp)` - Add XP to user's score
- `getTopUsers(limit)` - Get top N users
- `getUserRank(userId)` - Get user's rank and score

### Additional Functions

- `getUsersByRank(startRank, endRank)` - Get users by rank range (pagination)
- `getLeaderboardCount()` - Get total number of users
- `setUserScore(userId, score)` - Set user's score to specific value
- `resetUserScore(userId)` - Reset user's score to 0
- `healthCheck()` - Test Redis connection
- `disconnectRedis()` - Close Redis connection

## Error Handling

The service includes automatic reconnection logic:

- **Retry Strategy**: Exponential backoff (max 2 seconds)
- **Reconnect on Error**: Automatically reconnects on READONLY errors
- **Max Retries**: 3 retries per request
- **Connection Events**: Logs connection status changes

## Testing

See the test examples in the service file comments. You can use Jest or Vitest:

```bash
npm install --save-dev jest @types/jest ts-jest
```

## Performance Notes

- **Sorted Sets**: Uses Redis sorted sets (ZSET) for O(log N) operations
- **Efficient Queries**: Leaderboard queries are very fast even with millions of users
- **Memory Usage**: Each user entry uses minimal memory (~100 bytes)

## Troubleshooting

### Connection Issues

1. **Check Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Check environment variables:**
   ```bash
   echo $REDIS_URL
   ```

3. **Test connection manually:**
   ```typescript
   import { connectRedis, healthCheck } from './services/redis.service';
   await connectRedis();
   const isHealthy = await healthCheck();
   console.log('Redis healthy:', isHealthy);
   ```

### Common Errors

- **"Redis client is not connected"**: Call `connectRedis()` before using other functions
- **"Connection refused"**: Check Redis is running and REDIS_URL is correct
- **"READONLY"**: Redis is in read-only mode (usually during failover)

## Production Considerations

1. **Use Redis Cloud or managed Redis** for production
2. **Set up Redis persistence** (RDB or AOF)
3. **Configure Redis password** authentication
4. **Monitor Redis memory usage**
5. **Set up Redis replication** for high availability
6. **Use connection pooling** for high-traffic applications

