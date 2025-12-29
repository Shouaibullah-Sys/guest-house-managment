// lib/db/middleware.ts - Database middleware for API routes
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import dbConnect from "../db";

/**
 * Higher-order function to wrap API routes with database connection
 */
export function withDatabase(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await dbConnect();
      return handler(req, res);
    } catch (error) {
      console.error("Database connection error:", error);
      return res.status(500).json({
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

/**
 * Middleware for Next.js API routes (App Router)
 */
export async function databaseMiddleware(
  req: Request,
  next: () => Promise<Response>
) {
  try {
    await dbConnect();
    return next();
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response(
      JSON.stringify({
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
