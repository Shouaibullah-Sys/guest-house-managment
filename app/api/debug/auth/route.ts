// app/api/debug/auth/route.ts - Authentication debugging endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Auth Debug - Starting analysis...");

    // Get basic auth info
    const { userId, sessionId, sessionClaims } = await auth();

    console.log("📋 Basic Auth Info:", {
      userId,
      sessionId,
      hasSessionClaims: !!sessionClaims,
      claimsKeys: sessionClaims ? Object.keys(sessionClaims) : [],
    });

    // Get detailed user info from Clerk
    let clerkUser = null;
    if (userId) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        clerkUser = await client.users.getUser(userId);
        console.log("👤 Clerk User Data:", {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          metadata: clerkUser.publicMetadata,
        });
      } catch (error) {
        console.error("❌ Error getting Clerk user:", error);
      }
    }

    // Get user from database
    let dbUser = null;
    if (userId) {
      try {
        await dbConnect();
        const { User } = await import("@/models");
        dbUser = await User.findOne({ _id: userId });
        console.log("💾 Database User:", dbUser ? "Found" : "Not found");
        if (dbUser) {
          console.log("📊 DB User Data:", {
            _id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            approved: dbUser.approved,
            isActive: dbUser.isActive,
          });
        }
      } catch (error) {
        console.error("❌ Error getting DB user:", error);
      }
    }

    // Get current user via our auth helper
    let currentUser = null;
    if (userId) {
      try {
        currentUser = await getCurrentUser();
        console.log(
          "🔧 Current User Helper Result:",
          currentUser ? "Success" : "Failed"
        );
      } catch (error) {
        console.error("❌ Error in getCurrentUser:", error);
      }
    }

    // Analyze session claims
    const sessionAnalysis = {
      hasUserId: !!userId,
      hasSessionId: !!sessionId,
      hasSessionClaims: !!sessionClaims,
      claimsKeys: sessionClaims ? Object.keys(sessionClaims) : [],
      metadata: sessionClaims?.metadata,
      role: sessionClaims?.metadata?.role,
      approved: sessionClaims?.metadata?.approved,
    };

    // Determine auth status
    const authStatus = {
      isAuthenticated: !!userId,
      hasValidRole: !!sessionClaims?.metadata?.role,
      isApproved: sessionClaims?.metadata?.approved === true,
      role: sessionClaims?.metadata?.role || "none",
      issues: [] as string[],
    };

    if (!userId) {
      authStatus.issues.push("No user ID found in session");
    }

    if (!sessionClaims?.metadata?.role) {
      authStatus.issues.push("No role in session metadata");
    }

    if (sessionClaims?.metadata?.approved !== true) {
      authStatus.issues.push("User not approved");
    }

    if (!dbUser && userId) {
      authStatus.issues.push("User exists in Clerk but not in database");
    }

    const debugResponse = {
      timestamp: new Date().toISOString(),
      auth: authStatus,
      session: sessionAnalysis,
      clerk: clerkUser
        ? {
            id: clerkUser.id,
            email: clerkUser.emailAddresses?.[0]?.emailAddress,
            name: `${clerkUser.firstName || ""} ${
              clerkUser.lastName || ""
            }`.trim(),
            metadata: clerkUser.publicMetadata,
            createdAt: clerkUser.createdAt,
            lastSignInAt: clerkUser.lastSignInAt,
          }
        : null,
      database: dbUser
        ? {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            approved: dbUser.approved,
            isActive: dbUser.isActive,
            createdAt: dbUser.createdAt,
          }
        : null,
      currentUser: currentUser
        ? {
            id: currentUser.id,
            hasClerkUser: !!currentUser.clerkUser,
            hasDbUser: !!currentUser.dbUser,
            role: currentUser.metadata?.role,
            approved: currentUser.metadata?.approved,
          }
        : null,
      recommendations: [] as string[],
    };

    // Add recommendations
    if (authStatus.issues.length > 0) {
      debugResponse.recommendations.push(
        "Check Clerk dashboard for user metadata"
      );
      debugResponse.recommendations.push(
        "Verify webhook is creating users in database"
      );
      debugResponse.recommendations.push(
        "Ensure user has been assigned a role"
      );
    }

    if (!dbUser && userId) {
      debugResponse.recommendations.push(
        "User should be created in database via webhook"
      );
    }

    console.log("✅ Auth Debug - Analysis complete");
    return NextResponse.json(debugResponse);
  } catch (error) {
    console.error("💥 Auth Debug Error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
