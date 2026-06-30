/**
 * MongoDB connection singleton for Next.js.
 *
 * Next.js hot-reloads modules in development, which would create a new
 * Mongoose connection on every file change. We cache the connection on
 * `globalThis` so it survives hot-reloads.
 *
 * In production each serverless invocation gets its own process, so the
 * cache is empty and a fresh connection is made — that's fine.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend globalThis so TypeScript is happy
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define MONGODB_URI in your .env.local file.\n" +
      "Get a free cluster at https://cloud.mongodb.com"
    );
  }

  // If connection exists and is connected, use it
  if (cache.conn && cache.conn.connection.readyState === 1) {
    return cache.conn;
  }

  // If a promise is already in flight, wait for it
  if (cache.promise) {
    try {
      cache.conn = await cache.promise;
      return cache.conn;
    } catch (err) {
      cache.promise = null;
      throw err;
    }
  }

  // Create new connection promise
  cache.promise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize:    10,
    minPoolSize:    2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS:          45_000,
    retryWrites:              true,
    retryReads:               true,
    connectTimeoutMS:         10_000,
  });

  try {
    cache.conn = await cache.promise;
    console.log("[connectDB] Successfully connected to MongoDB");
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    cache.conn = null;
    console.error('[connectDB] MongoDB connection failed:', err);
    throw err;
  }
}
