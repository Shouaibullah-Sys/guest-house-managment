import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db/health";

export async function GET() {
  const health = await checkDatabaseHealth();
  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

