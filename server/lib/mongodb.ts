import mongoose from "mongoose";

let isConnected = false;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/helpedge";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (isConnected && cached.conn) return cached.conn;

  if (cached.conn) {
    isConnected = true;
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then(async (mongooseInstance) => {
        await Promise.all([
          import("../models/User"),
          import("../models/Category"),
          import("../models/Ticket"),
        ]);

        // ✅ Safe check
        const conn = mongooseInstance.connections[0];
        isConnected = !!conn && conn.readyState === 1;

        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}

export default dbConnect;
