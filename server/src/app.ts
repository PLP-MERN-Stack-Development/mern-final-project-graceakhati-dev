import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport';
import authRoutes from './routes/authRoutes';
import googleAuthRoutes from './routes/googleAuthRoutes';
import { googleAuthController } from './controllers/authController';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import moduleRoutes from './routes/moduleRoutes';
import quizRoutes from './routes/quizRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import submissionRoutes from './routes/submissionRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import certificateRoutes from './routes/certificateRoutes';

// Load environment variables
dotenv.config();

/**
 * Express Application
 */
const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// CORS Configuration
// Allowed origins - add your frontend domains here
// Supports both development (localhost) and production domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:3001', // Frontend dev server
  'http://localhost:3000', // Alternative frontend port
  // Add your production frontend URL here:
  // 'https://your-frontend-domain.com',
].filter(Boolean) as string[]; // Remove undefined values and type as string array

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked origin for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`CORS blocked origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true, // needed if using cookies/auth tokens
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Request logging middleware
// In production, log important requests only
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  // Production: Log only important requests
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Log API routes and errors
    if (req.path.startsWith('/api') || req.path === '/health') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });
} else {
  // Development: Log all requests
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Health check route - Important for Render
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Planet Path API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// API Routes
// Direct route for /auth/google - must be before router mounts to ensure it works
app.get('/auth/google', (req: Request, res: Response) => {
  console.log('Route /auth/google hit');
  return googleAuthController(req, res);
});
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/certificates', certificateRoutes);

// Test utilities routes (only in test environment)
if (process.env.NODE_ENV === 'test') {
  // Dynamically import testUtils routes only in test mode
  const testUtilsRoutes = require('./routes/testUtils').default;
  app.use('/api/test', testUtilsRoutes);
}

// 404 handler
app.use((req: Request, res: Response): void => {
  if (isProduction) {
    console.log(`[404] ${req.method} ${req.path} - Route not found`);
  }
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const errorMessage = err.message || 'Internal server error';
  
  // Log error in production
  if (isProduction) {
    console.error(`[ERROR] ${errorMessage}`);
    if (err.stack) {
      console.error(`[STACK] ${err.stack}`);
    }
  } else {
    console.error('Error:', err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: isProduction ? undefined : errorMessage,
  });
});

export default app;
