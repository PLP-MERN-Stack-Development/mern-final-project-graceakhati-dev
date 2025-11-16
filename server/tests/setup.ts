/**
 * Test Setup File
 * 
 * Configures test environment, database connection, and cleanup
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

/**
 * Setup test database before all tests
 */
export const setupTestDB = async (): Promise<void> => {
  // Use test database URI from env or in-memory MongoDB
  const testMongoURI = process.env.TEST_MONGODB_URI;

  if (testMongoURI) {
    // Use provided test database URI
    console.log('📊 Using test database from TEST_MONGODB_URI');
    await mongoose.connect(testMongoURI);
  } else {
    // Use in-memory MongoDB for testing
    console.log('📊 Using in-memory MongoDB for testing');
    mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();
    await mongoose.connect(mongoURI);
  }
};

/**
 * Cleanup test database after all tests
 */
export const teardownTestDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all collections between tests
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

