import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('Please set MONGODB_URI in .env');

let cached = (global as any)._mongooseCached as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
if (!cached) cached = (global as any)._mongooseCached = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'freakthetix',
      serverSelectionTimeoutMS: 8000,   // 👈 जल्दी fail हो, UI में समझ आए
      socketTimeoutMS: 20000,
    }).then((conn) => {
      console.log('[MONGOOSE] connected to', conn?.connection?.db?.databaseName ?? '(unknown)');
      return conn;
    }).catch((err) => {
      console.error('[MONGOOSE] connect error:', err?.message);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
