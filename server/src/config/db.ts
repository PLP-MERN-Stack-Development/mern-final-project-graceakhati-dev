import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns Promise<void>
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('💡 Please create a .env file in the server directory with MONGODB_URI');
      console.error('💡 See ENV_EXAMPLE.txt for reference');
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.code === 8000 || error.codeName === 'AtlasError') {
      console.error('\n🔐 MongoDB Atlas Authentication Failed');
      console.error('💡 Common causes:');
      console.error('   1. Incorrect username or password in connection string');
      console.error('   2. Password contains special characters (must be URL-encoded)');
      console.error('   3. Database user not created in Atlas');
      console.error('   4. IP address not whitelisted');
      console.error('\n📝 How to fix:');
      console.error('   1. Go to MongoDB Atlas → Database Access');
      console.error('   2. Verify your database user exists');
      console.error('   3. Reset password if needed (URL-encode special chars: @ = %40, # = %23, etc.)');
      console.error('   4. Go to Network Access → Add IP Address (or allow from anywhere for dev)');
      console.error('   5. Update MONGODB_URI in .env with correct credentials');
    } else if (error.message?.includes('authentication failed')) {
      console.error('\n🔐 Authentication Failed');
      console.error('💡 Check your MongoDB username and password in .env');
      console.error('💡 For Atlas: Ensure password is URL-encoded if it contains special characters');
    } else if (error.message?.includes('ECONNREFUSED')) {
      console.error('\n🔌 Connection Refused');
      console.error('💡 Make sure MongoDB is running');
      console.error('💡 For local: Start MongoDB service');
      console.error('💡 For Atlas: Check your connection string');
    }
    
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 * @returns Promise<void>
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

// Handle connection events
mongoose.connection.on('error', (err: Error) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

