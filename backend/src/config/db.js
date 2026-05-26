import mongoose from 'mongoose';
import { config } from './env.js';

export const dbState = {
  isConnected: false,
  usingMemoryFallback: false,
  error: null,
  host: null,
  name: null,
};

export async function connectDB() {
  if (!config.mongoUri) {
    dbState.usingMemoryFallback = true;
    console.warn('[DB] MONGO_URI not set. Using in-memory fallback for local development.');
    return;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'careeros_ai',
    });
    dbState.isConnected = true;
    dbState.usingMemoryFallback = false;
    dbState.error = null;
    dbState.host = mongoose.connection.host;
    dbState.name = mongoose.connection.name;
    console.log('[DB] MongoDB connected');
  } catch (err) {
    dbState.usingMemoryFallback = true;
    dbState.isConnected = false;
    dbState.error = err.message;
    console.error(`[DB] MongoDB connection failed: ${err.message}`);
    console.warn('[DB] Continuing with in-memory fallback so the app can run locally.');
  }
}

export function dbHealth() {
  return {
    connected: dbState.isConnected,
    usingMemoryFallback: dbState.usingMemoryFallback,
    host: dbState.host,
    database: dbState.name,
    error: dbState.error,
    readyState: mongoose.connection.readyState,
  };
}
