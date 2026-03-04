import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Shape of the cached Mongoose connection stored on the global object.
 * Caching is necessary because Next.js hot reloads modules in development,
 * which would otherwise create a new connection on every file change.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the NodeJS Global type so TypeScript recognises our custom property.
 * The `var` declaration is intentional — only `var` works with `declare global`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Re-use the global cache if it already exists, otherwise create a fresh one.
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

// Persist the cache on the global object so it survives hot reloads in dev.
global.mongoose = cached;

/**
 * Connects to MongoDB using Mongoose and returns the Mongoose instance.
 *
 * - On the first call, it opens a new connection and caches both the promise
 *   and the resolved connection.
 * - On subsequent calls, it returns the cached connection immediately,
 *   avoiding redundant connection pool creation.
 *
 * @returns A resolved Mongoose instance ready for database operations.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return the active connection straight away if one already exists.
  if (cached.conn) {
    return cached.conn;
  }

  // Initiate a new connection only if one is not already in progress.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      // Disable command buffering so DB calls fail immediately when
      // the connection is not yet established, rather than silently queueing.
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    // Await the pending connection and store the resolved instance.
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the cached promise on failure so the next call can retry cleanly.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
