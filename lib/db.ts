// lib/db.ts
import mongoose from 'mongoose';

const globalAny = global as any;

let cached = globalAny._mongooseCached as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = { conn: null, promise: null };
  globalAny._mongooseCached = cached;
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Don't throw at import-time; throw here with clear message
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel Project Settings → Environment Variables (and locally in .env.local).'
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: 'freakthetix',
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000,
      })
      .then((conn) => {
        console.log('[MONGOOSE] connected to', conn?.connection?.db?.databaseName);
        return conn;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
