// lib/db.ts
import mongoose from "mongoose";

// Import all models to ensure they are registered with Mongoose
import "@/models";

type MongoLikeError = Error & {
  code?: string;
  syscall?: string;
  hostname?: string;
};

function normalizeEnvUri(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  const withoutQuotes = trimmed.replace(/^['"]|['"]$/g, "").trim();

  return withoutQuotes || undefined;
}

const MONGODB_URI = normalizeEnvUri(process.env.MONGODB_URI);
const MONGODB_URI_DIRECT = normalizeEnvUri(process.env.MONGODB_URI_DIRECT);

if (!MONGODB_URI && !MONGODB_URI_DIRECT) {
  throw new Error("Please define MONGODB_URI or MONGODB_URI_DIRECT");
}

function isSrvLookupError(error: unknown): error is MongoLikeError {
  if (!(error instanceof Error)) return false;
  const mongoError = error as MongoLikeError;

  return (
    mongoError.code === "ENOTFOUND" &&
    mongoError.syscall?.toLowerCase() === "querysrv"
  );
}

function getUriHostSummary(uri?: string): string | null {
  if (!uri) return null;

  const withoutProtocol = uri.replace(/^mongodb(?:\+srv)?:\/\//i, "");
  const withoutCredentials = withoutProtocol.includes("@")
    ? withoutProtocol.split("@")[1]
    : withoutProtocol;
  const hostSegment = withoutCredentials.split("/")[0];
  const hosts = hostSegment
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  if (hosts.length === 0) return null;
  if (hosts.length === 1) return hosts[0];

  return `${hosts[0]} (+${hosts.length - 1} more)`;
}

function getUriMode(uri?: string): "srv" | "direct" | null {
  if (!uri) return null;
  if (uri.startsWith("mongodb+srv://")) return "srv";
  if (uri.startsWith("mongodb://")) return "direct";
  return null;
}

export function getMongoEnvSummary() {
  return {
    hasMongoUri: Boolean(MONGODB_URI),
    mongoUriMode: getUriMode(MONGODB_URI),
    mongoUriHost: getUriHostSummary(MONGODB_URI),
    hasMongoUriDirect: Boolean(MONGODB_URI_DIRECT),
    mongoUriDirectMode: getUriMode(MONGODB_URI_DIRECT),
    mongoUriDirectHost: getUriHostSummary(MONGODB_URI_DIRECT),
  };
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalWithMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare const global: GlobalWithMongoose;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = (async () => {
      try {
        const uriToUse = MONGODB_URI || MONGODB_URI_DIRECT;
        if (!uriToUse) {
          throw new Error("MongoDB URI is not configured");
        }

        const connection = await mongoose.connect(uriToUse, opts);
        console.log("MongoDB connected successfully");
        return connection;
      } catch (error) {
        // Optional fallback for platforms/environments where SRV DNS lookup fails.
        if (MONGODB_URI_DIRECT && MONGODB_URI && isSrvLookupError(error)) {
          console.warn(
            "Primary MongoDB SRV URI failed DNS lookup; retrying with MONGODB_URI_DIRECT"
          );
          const fallbackConnection = await mongoose.connect(
            MONGODB_URI_DIRECT,
            opts
          );
          console.log("MongoDB connected successfully (direct URI fallback)");
          return fallbackConnection;
        }

        throw error;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
