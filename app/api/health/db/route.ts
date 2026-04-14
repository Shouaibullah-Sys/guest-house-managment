import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db/health";
import { getMongoEnvSummary } from "@/lib/db";

export async function GET() {
  const health = await checkDatabaseHealth();
  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      env: getMongoEnvSummary(),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
