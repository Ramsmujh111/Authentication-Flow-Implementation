import mongoose, { Connection, Mongoose } from 'mongoose';

interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Global variable to store the connection
declare global {
  var mongooseConnection: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * MongoDB Connection Handler
 * Uses a cached connection in development to avoid multiple connections
 * Each request in production gets a new connection
 */
let cached: CachedConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
};

if (global.mongooseConnection) {
  global.mongooseConnection = cached;
}

/**
 * Connect to MongoDB
 * Implements connection pooling with caching
 */
async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    console.log('Waiting for MongoDB connection promise');
    return cached.promise;
  }

  // Create new connection promise
  cached.promise = mongoose
    .connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      appName: 'authentication-flow',
    })
    .then((mongoose) => {
      console.log('✓ MongoDB connected successfully');
      cached.conn = mongoose;
      return mongoose;
    })
    .catch((error) => {
      console.error('✗ MongoDB connection failed:', error.message);
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    console.log('✓ Disconnected from MongoDB');
  }
}

/**
 * Get the database connection instance
 */
export function getDatabaseConnection(): Connection | null {
  if (!cached.conn) {
    return null;
  }
  return cached.conn.connection;
}

export default connectToDatabase;
