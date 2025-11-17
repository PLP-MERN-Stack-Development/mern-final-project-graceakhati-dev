# Redis Leaderboard Service Usage Guide

Complete guide for using the Redis leaderboard service in Planet Path.

## Features

- ✅ Add XP to users
- ✅ Get top N users
- ✅ Get user rank and score
- ✅ Pagination support (rank ranges)
- ✅ Mock Redis fallback (works without Redis)
- ✅ TypeScript support
- ✅ Automatic reconnection handling

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Optional: Redis Configuration
REDIS_URL=redis://localhost:6379
# Or for Redis with password:
REDIS_URL=redis://:password@localhost:6379
# Or for Redis Cloud/Heroku:
REDIS_URL=rediss://:password@host:port
```

**Note:** If `REDIS_URL` is not set, the service will use an in-memory mock that works for development/testing.

### 2. Install Dependencies

Already included in `package.json`:
- `ioredis` - Redis client
- `@types/ioredis` - TypeScript types

## Usage Examples

### Basic Usage

```typescript
import { addXp, getTopUsers, getUserRank } from './services/leaderboard.service';

// Add XP to a user
await addXp('user123', 50);

// Get top 10 users
const topUsers = await getTopUsers(10);
// Returns: [
//   { userId: 'user1', score: 1000, rank: 1 },
//   { userId: 'user2', score: 950, rank: 2 },
//   ...
// ]

// Get user's rank
const rankData = await getUserRank('user123');
// Returns: { rank: 5, score: 750 }
```

### Integration with Course Completion

```typescript
import { addXp } from './services/leaderboard.service';
import Enrollment from './models/Enrollment';

// When user completes a course
export const completeCourse = async (userId: string, courseId: string) => {
  // Update enrollment
  const enrollment = await Enrollment.findOne({ userId, courseId });
  if (enrollment) {
    enrollment.progress = 100;
    enrollment.status = 'completed';
    await enrollment.save();
  }

  // Award XP (e.g., 100 XP for course completion)
  await addXp(userId, 100);
};
```

### Integration with Assignment Submission

```typescript
import { addXp } from './services/leaderboard.service';

// When instructor grades a submission
export const gradeSubmission = async (submissionId: string, score: number) => {
  const submission = await Submission.findById(submissionId);
  
  // Award XP based on score (e.g., 1 XP per point)
  await addXp(submission.userId.toString(), score);
};
```

### Display Leaderboard in API

```typescript
import { getTopUsers, getUserRank } from './services/leaderboard.service';

// Get top 20 users
const top20 = await getTopUsers(20);

// Get current user's rank
const userRank = await getUserRank(currentUserId);
```

## API Endpoints

### Add XP
```http
POST /api/leaderboard/xp
Authorization: Bearer <token>
Content-Type: application/json

{
  "xp": 50
}
```

### Get Top Users
```http
GET /api/leaderboard/top?limit=10
```

### Get User Rank
```http
GET /api/leaderboard/rank/:userId
Authorization: Bearer <token>
```

### Get Rank Range (Pagination)
```http
GET /api/leaderboard/range?start=11&end=20
```

### Get Leaderboard Stats
```http
GET /api/leaderboard/stats
```

## TypeScript Types

```typescript
interface LeaderboardUser {
  userId: string;
  score: number;
  rank: number;
}

// Function signatures
addXp(userId: string, xp: number): Promise<number>;
getTopUsers(limit?: number): Promise<LeaderboardUser[]>;
getUserRank(userId: string): Promise<{ rank: number; score: number } | null>;
getUsersByRankRange(startRank: number, endRank: number): Promise<LeaderboardUser[]>;
getLeaderboardSize(): Promise<number>;
```

## Mock Redis Behavior

When `REDIS_URL` is not configured:
- Uses in-memory storage (Map-based)
- All functions work identically
- Data persists only during server runtime
- Perfect for development/testing
- No external dependencies required

## Performance Notes

- **Redis Sorted Sets**: O(log N) for insertions and rank queries
- **Top N queries**: O(log N + M) where M is the number of results
- **Scalable**: Handles millions of users efficiently
- **Real-time**: Updates are immediate

## Best Practices

1. **Award XP consistently**: Use the same XP values for similar actions
2. **Batch operations**: If awarding XP to multiple users, consider batching
3. **Error handling**: Always wrap calls in try/catch
4. **Cache results**: Consider caching top users for frequently accessed endpoints
5. **Monitor performance**: Use Redis monitoring tools in production

## Example: Complete Course Flow

```typescript
import { addXp } from './services/leaderboard.service';
import Enrollment from './models/Enrollment';
import User from './models/User';

export const completeCourseFlow = async (userId: string, courseId: string) => {
  // 1. Update enrollment
  const enrollment = await Enrollment.findOne({ userId, courseId });
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  enrollment.progress = 100;
  enrollment.status = 'completed';
  enrollment.completedAt = new Date();
  await enrollment.save();

  // 2. Award XP
  await addXp(userId, 100); // 100 XP for course completion

  // 3. Update user's total XP in database (optional)
  const user = await User.findById(userId);
  if (user) {
    const rankData = await getUserRank(userId);
    user.xp = rankData?.score || 0;
    await user.save();
  }

  return {
    enrollment,
    xpAwarded: 100,
  };
};
```

## Testing

```typescript
import { addXp, getTopUsers, getUserRank } from './services/leaderboard.service';

// Test without Redis (uses mock)
describe('Leaderboard Service', () => {
  it('should add XP and retrieve top users', async () => {
    await addXp('user1', 100);
    await addXp('user2', 200);
    await addXp('user3', 150);

    const topUsers = await getTopUsers(3);
    expect(topUsers[0].userId).toBe('user2');
    expect(topUsers[0].score).toBe(200);
    expect(topUsers[1].userId).toBe('user3');
    expect(topUsers[2].userId).toBe('user1');
  });

  it('should get user rank', async () => {
    await addXp('user1', 100);
    const rank = await getUserRank('user1');
    expect(rank).toBeTruthy();
    expect(rank?.score).toBe(100);
  });
});
```

## Error Handling

The service includes automatic error handling and reconnection logic:

- **Connection errors**: Automatically retries with exponential backoff
- **Read-only errors**: Automatically reconnects
- **Mock fallback**: Falls back to mock if Redis unavailable

## Production Considerations

1. **Redis persistence**: Configure Redis persistence (RDB or AOF)
2. **High availability**: Use Redis Sentinel or Cluster for production
3. **Monitoring**: Monitor Redis memory usage and performance
4. **Backup**: Regular backups of Redis data
5. **Connection pooling**: Already handled by ioredis

## Cleanup

When shutting down the application:

```typescript
import { closeRedisConnection } from './services/leaderboard.service';

// In your shutdown handler
process.on('SIGTERM', async () => {
  await closeRedisConnection();
  process.exit(0);
});
```

