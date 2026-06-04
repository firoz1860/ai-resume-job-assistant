import mongoose from 'mongoose';
import { config } from './env.js';

// isConnected is a live getter — reads Mongoose's real-time readyState.
// This means every controller/service that checks dbState.isConnected always
// gets the accurate current state even after reconnects or drops.
export const dbState = {
  usingMemoryFallback: false,
  error: null,
  host: null,
  name: null,
  get isConnected() {
    return mongoose.connection.readyState === 1;
  },
};

// Convenience alias used by services imported before this module fully loads
export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function buildConnectOptions() {
  const isAtlasSrv = String(config.mongoUri || '').startsWith('mongodb+srv://');

  return {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    dbName: 'careeros_ai',
    ...(isAtlasSrv ? { tls: true, retryWrites: true } : {}),
  };
}

export async function connectDB() {
  if (!config.mongoUri) {
    dbState.usingMemoryFallback = true;
    console.warn('[DB] MONGO_URI not set. Using in-memory fallback for local development.');
    return;
  }

  // Register lifecycle listeners BEFORE connecting so no events are missed
  mongoose.connection.on('connected', () => {
    dbState.usingMemoryFallback = false;
    dbState.error = null;
    dbState.host = mongoose.connection.host;
    dbState.name = mongoose.connection.name;
    console.log(`[DB] MongoDB connected → ${dbState.host}/${dbState.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected — waiting for reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    dbState.error = null;
    console.log('[DB] MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    dbState.error = err.message;
    console.error(`[DB] MongoDB error: ${err.message}`);
  });

  try {
    await mongoose.connect(config.mongoUri, buildConnectOptions());
    // Sync non-computed fields in case the 'connected' event fired before our handler attached
    dbState.usingMemoryFallback = false;
    dbState.host = mongoose.connection.host;
    dbState.name = mongoose.connection.name;
  } catch (err) {
    dbState.usingMemoryFallback = true;
    dbState.error = err.message;
    console.error(`[DB] MongoDB connection failed: ${err.message}`);
    console.warn('[DB] Continuing with in-memory fallback so the app can run locally.');
  }
}

export function dbHealth() {
  return {
    connected: isDbConnected(),
    usingMemoryFallback: dbState.usingMemoryFallback,
    host: dbState.host,
    database: dbState.name,
    error: dbState.error,
    readyState: mongoose.connection.readyState,
  };
}
