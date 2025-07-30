import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // TEMPORARY bypass

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  cached.conn = await cached.promise;
  return cached.conn;
}
