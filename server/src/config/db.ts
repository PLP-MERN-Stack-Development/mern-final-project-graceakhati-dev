import mongoose from 'mongoose';

/**
 * Mask sensitive information in MongoDB URI for logging
 * @param uri - MongoDB connection URI
 * @returns Masked URI string
 */
const maskMongoURI = (uri: string): string => {
  try {
    // Mask password in connection string
    return uri.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
  } catch {
    return '****';
  }
};

/**
 * Parse MongoDB URI to extract connection details
 * @param uri - MongoDB connection URI
 * @returns Parsed connection details
 */
const parseMongoURI = (uri: string): { cluster: string; database: string; isValid: boolean } => {
  try {
    const url = new URL(uri);
    const cluster = url.hostname || 'unknown';
    const database = url.pathname?.replace('/', '') || 'unknown';
    return { cluster, database, isValid: true };
  } catch {
    return { cluster: 'unknown', database: 'unknown', isValid: false };
  }
};

/**
 * Connect to MongoDB database
 * @returns Promise<void>
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Use MONGO_URI (primary), fallback to MONGODB_URI for backward compatibility
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    console.log('\n🔌 Attempting to connect to MongoDB...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if URI exists
    if (!mongoURI) {
      console.error('❌ MONGO_URI/MONGODB_URI is not defined in environment variables');
      console.error('💡 Please create a .env file in the server directory');
      console.error('💡 Add one of the following:');
      console.error('   MONGO_URI=mongodb://...');
      console.error('   OR');
      console.error('   MONGODB_URI=mongodb://...');
      console.error('💡 See ENV_EXAMPLE.txt for reference');
      throw new Error('MONGO_URI/MONGODB_URI is not defined in environment variables');
    }

    // Log URI (masked) before connection
    const maskedURI = maskMongoURI(mongoURI);
    console.log(`📋 Connection URI: ${maskedURI}`);
    console.log(`📏 URI Length: ${mongoURI.length} characters`);

    // Parse and validate URI structure
    const { cluster, database, isValid } = parseMongoURI(mongoURI);
    
    if (!isValid) {
      console.warn('⚠️  Warning: Could not parse MongoDB URI structure');
      console.warn('💡 Ensure URI format is: mongodb://[username:password@]host[:port]/database');
    } else {
      console.log(`🌐 Cluster Address: ${cluster}`);
      console.log(`📊 Database Name: ${database || '(will use default)'}`);
    }

    // Validate URI is not empty or just whitespace
    if (mongoURI.trim().length === 0) {
      throw new Error('MONGO_URI/MONGODB_URI is empty (only whitespace)');
    }

    // Validate URI starts with mongodb:// or mongodb+srv://
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      console.warn('⚠️  Warning: URI does not start with mongodb:// or mongodb+srv://');
      console.warn('💡 Expected format: mongodb://[username:password@]host[:port]/database');
      console.warn('💡 Or for Atlas: mongodb+srv://[username:password@]cluster.mongodb.net/database');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Connecting to MongoDB...\n');

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      // Connection options for better error handling
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    // Success message with detailed information
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MongoDB Connection Successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port || 'default'}`);
    console.log(`👤 User: ${conn.connection.user || 'none'}`);
    console.log(`🆔 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : conn.connection.readyState}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ MongoDB Connection Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`📋 Error Type: ${error.name || 'Unknown'}`);
    console.error(`💬 Error Message: ${error.message || 'No error message'}`);
    
    if (error.code) {
      console.error(`🔢 Error Code: ${error.code}`);
    }
    if (error.codeName) {
      console.error(`🏷️  Code Name: ${error.codeName}`);
    }
    
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
      console.error('   5. Update MONGO_URI/MONGODB_URI in .env with correct credentials');
    } else if (error.message?.includes('authentication failed') || error.message?.includes('bad auth')) {
      console.error('\n🔐 Authentication Failed');
      console.error('💡 Check your MongoDB username and password in .env');
      console.error('💡 For Atlas: Ensure password is URL-encoded if it contains special characters');
      console.error('💡 Example: password@123 should be password%40123');
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      console.error('\n🔌 Connection Refused / Host Not Found');
      console.error('💡 Make sure MongoDB is running');
      console.error('💡 For local: Start MongoDB service');
      console.error('💡 For Atlas: Check your connection string cluster address');
      console.error('💡 Verify the hostname in your MONGO_URI is correct');
    } else if (error.message?.includes('timeout') || error.message?.includes('serverSelectionTimeoutMS')) {
      console.error('\n⏱️  Connection Timeout');
      console.error('💡 Server took too long to respond');
      console.error('💡 Check your network connection');
      console.error('💡 For Atlas: Verify IP whitelist includes your current IP');
      console.error('💡 For local: Ensure MongoDB service is running');
    } else if (error.message?.includes('ENV')) {
      console.error('\n📝 Environment Variable Issue');
      console.error('💡 Check your .env file exists in the server directory');
      console.error('💡 Verify MONGO_URI or MONGODB_URI is set correctly');
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
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

