import 'dotenv/config'; // Load environment variables first
import app from './app';
import { initializeFirestore } from './config/firestore';

/**
 * Server Configuration
 * Render requires listening on process.env.PORT
 */
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const startServer = async (): Promise<void> => {
  try {
    // Log startup information
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Planet Path Server...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`🌐 Node Version: ${process.version}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Log critical environment variables (without exposing secrets)
    console.log('\n🔐 Environment Variables Check:');
    console.log(`   FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FIREBASE_SERVICE_ACCOUNT_KEY: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FIREBASE_WEB_API_KEY: ${process.env.FIREBASE_WEB_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'Not set'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Connect to MongoDB (required)
    const { connectDB } = await import('./config/db');
    await connectDB();

    // Initialize Firebase Admin (optional - only needed for Firebase Auth token verification)
    // If Firebase env vars are not set, the server will still work but Firebase auth won't be available
    const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (hasFirebaseConfig) {
      try {
        await initializeFirestore();
        console.log('✅ Firebase Admin initialized for auth verification');
      } catch (firebaseError) {
        console.warn('⚠️  Firebase Admin initialization failed, continuing without Firebase auth:', (firebaseError as Error).message);
        console.warn('💡 Firebase Auth token verification will not be available');
      }
    } else {
      console.log('ℹ️  Firebase Admin not initialized (env vars not set)');
      console.log('💡 Firebase Auth token verification will not be available');
      console.log('💡 Set FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT_KEY to enable Firebase auth');
    }

    // Redis is optional - only initialize if explicitly enabled
    const enableRedis = process.env.ENABLE_REDIS === 'true';
    if (enableRedis) {
      try {
        const { connectRedis } = await import('./services/redis.service');
        const redisClient = await connectRedis();
        
        if (redisClient) {
          // Initialize BullMQ queue and worker only if Redis is connected
          const { initializeQueue, initializeWorker } = await import('./worker/badgeWorker');
          initializeQueue();
          initializeWorker();
          console.log('✅ Redis and background workers enabled');
        }
      } catch (redisError) {
        console.warn('⚠️  Redis initialization failed, continuing without Redis:', (redisError as Error).message);
      }
    } else {
      if (NODE_ENV === 'production') {
        console.log('ℹ️  Redis disabled (set ENABLE_REDIS=true to enable)');
      }
    }

    // Start Express server
    // IMPORTANT: Render requires listening on process.env.PORT
    // Use 0.0.0.0 to listen on all network interfaces (required for Render)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Server Started Successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 Listening on: 0.0.0.0:${PORT}`);
      console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Please use a different port or stop the process using this port');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Failed to start server');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Unhandled Promise Rejection');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Error:', err.message);
  if (err.stack) {
    console.error('\nStack trace:');
    console.error(err.stack);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Uncaught Exception');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Error:', err.message);
  if (err.stack) {
    console.error('\nStack trace:');
    console.error(err.stack);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
});

// Handle SIGTERM (for graceful shutdown - Render sends this)
process.on('SIGTERM', () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  SIGINT received. Shutting down gracefully...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
});

// Start the server
startServer();
