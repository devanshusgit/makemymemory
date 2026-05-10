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

if (!MONGODB_URI) {
  throw new Error(
    "Please define MONGODB_URI in your .env.local file.\n" +
    "Get a free cluster at https://cloud.mongodb.com"
  );
}

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
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize:    10,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS:          45_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;   // allow retry on next call
    console.error('MongoDB connection failed:', err);
    throw err;
  }

  return cache.conn;
}
