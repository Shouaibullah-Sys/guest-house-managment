// app/api/debug/user/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({
        error: "Not authenticated",
        userId: null,
        claims: null,
      });
    }

    const metadata = sessionClaims?.metadata as
      | { role?: "guest" | "staff" | "admin"; approved?: boolean }
      | undefined;

    return NextResponse.json({
      userId,
      metadata,
      userRole: metadata?.role || "guest",
      isApproved: metadata?.approved || false,
      hasAccess:
        (metadata?.role === "staff" || metadata?.role === "admin") &&
        metadata?.approved,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
