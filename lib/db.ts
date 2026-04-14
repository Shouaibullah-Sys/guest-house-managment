// lib/db.ts
import mongoose from "mongoose";

// Import all models to ensure they are registered with Mongoose
import "@/models";

type MongoLikeError = Error & {
  code?: string;
  syscall?: string;
  hostname?: string;
};
type EnvUriCandidate = {
  key: string;
  uri: string;
};

function normalizeEnvUri(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  const withoutQuotes = trimmed.replace(/^['"]|['"]$/g, "").trim();

  return withoutQuotes || undefined;
}

const MONGO_URI_ENV_KEYS = [
  "MONGODB_URI_DIRECT",
  "MONGODB_URI",
  "MONGO_URI",
  "MONGO_URL",
  "DATABASE_URL",
] as const;
const KNOWN_BAD_SRV_HOST_REWRITES: Record<string, string> = {
  "cluster0.thh5nfs.mongodb.net": "cluster0.4nxwxr8.mongodb.net",
};

function isMongoUri(uri: string): boolean {
  return uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
}

function rewriteKnownSrvHostIfNeeded(uri: string): string | null {
  const withoutProtocol = uri.replace(/^mongodb\+srv:\/\//i, "");
  if (withoutProtocol === uri) {
    return null;
  }

  const atIndex = withoutProtocol.lastIndexOf("@");
  if (atIndex < 0) {
    return null;
  }

  const authorityAndPath = withoutProtocol.slice(atIndex + 1);
  const slashIndex = authorityAndPath.indexOf("/");
  const host = slashIndex >= 0
    ? authorityAndPath.slice(0, slashIndex)
    : authorityAndPath;
  const rewrittenHost = KNOWN_BAD_SRV_HOST_REWRITES[host];

  if (!rewrittenHost) {
    return null;
  }

  return uri.replace(host, rewrittenHost);
}

function getMongoUriCandidates(): EnvUriCandidate[] {
  const seen = new Set<string>();
  const candidates: EnvUriCandidate[] = [];

  for (const key of MONGO_URI_ENV_KEYS) {
    const value = normalizeEnvUri(process.env[key]);
    if (!value || !isMongoUri(value) || seen.has(value)) {
      continue;
    }

    seen.add(value);
    candidates.push({ key, uri: value });

    const rewritten = rewriteKnownSrvHostIfNeeded(value);
    if (rewritten && !seen.has(rewritten)) {
      seen.add(rewritten);
      candidates.push({ key: `${key}_HOST_REWRITE`, uri: rewritten });
    }
  }

  return candidates;
}

const MONGO_URI_CANDIDATES = getMongoUriCandidates();

if (MONGO_URI_CANDIDATES.length === 0) {
  throw new Error(
    "Please define a valid MongoDB connection string in one of: MONGODB_URI_DIRECT, MONGODB_URI, MONGO_URI, MONGO_URL, DATABASE_URL"
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
    candidateCount: MONGO_URI_CANDIDATES.length,
    candidates: MONGO_URI_CANDIDATES.map((candidate) => ({
      key: candidate.key,
      mode: getUriMode(candidate.uri),
      host: getUriHostSummary(candidate.uri),
    })),
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
      let lastError: unknown = null;

      for (const candidate of MONGO_URI_CANDIDATES) {
        try {
          const connection = await mongoose.connect(candidate.uri, opts);
          console.log(
            `MongoDB connected successfully using ${candidate.key} (${getUriMode(
              candidate.uri
            ) ?? "unknown"})`
          );
          return connection;
        } catch (error) {
          lastError = error;
          const mongoError = error as MongoLikeError;
          console.warn(
            `MongoDB connection failed using ${candidate.key} (${getUriHostSummary(
              candidate.uri
            ) ?? "unknown-host"})${mongoError.code ? ` [${mongoError.code}]` : ""}`
          );
        }
      }

      throw (
        lastError || new Error("MongoDB connection failed for all URI candidates")
      );
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
