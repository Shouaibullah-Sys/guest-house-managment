// lib/db/health.ts - Database health check
import dbConnect from "../db";
import mongoose from "mongoose";

export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  message: string;
  details?: any;
}> {
  try {
    const conn = await dbConnect();

    // Check if we can run a simple query
    if (!conn.connection.db) {
      throw new Error("Database connection is not properly initialized");
    }
    const adminDb = conn.connection.db.admin();
    const serverStatus = await adminDb.ping();

    // Check connection state
    const readyState = conn.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
      99: "uninitialized",
    };

    return {
      status: "healthy",
      message: `Database is ${states[readyState as keyof typeof states]}`,
      details: {
        readyState,
        state: states[readyState as keyof typeof states],
        host: conn.connection.host || "unknown",
        name: conn.connection.name || "unknown",
        models: Object.keys(mongoose.models).length,
        ping: serverStatus.ok === 1 ? "successful" : "failed",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
