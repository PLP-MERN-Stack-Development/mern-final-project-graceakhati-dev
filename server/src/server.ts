import app from './app';
import { connectDB } from './config/db';

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle SIGTERM (for graceful shutdown)
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

