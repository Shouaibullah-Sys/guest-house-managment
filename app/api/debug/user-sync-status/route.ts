// app/api/debug/user-sync-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Check if user exists in database
    // Note: Typically Clerk user IDs are stored in a separate field like 'clerkId'
    // For now, we'll check both possible scenarios
    let dbUser = await User.findOne({ _id: userId }).lean();

    // If not found by _id, try searching by clerkId field (common pattern)
    if (!dbUser) {
      dbUser = await User.findOne({ clerkId: userId }).lean();
    }

    // Type the result properly to avoid TypeScript union type issues
    const typedDbUser = dbUser as any | null;

    // Get user info from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    return NextResponse.json({
      success: true,
      data: {
        clerk: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses.find(
            (email: any) => email.id === clerkUser.primaryEmailAddressId
          )?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          metadata: clerkUser.publicMetadata || {},
        },
        database: typedDbUser
          ? {
              exists: true,
              id: typedDbUser._id,
              name: typedDbUser.name,
              email: typedDbUser.email,
              role: typedDbUser.role,
              approved: typedDbUser.approved,
              isActive: typedDbUser.isActive,
            }
          : {
              exists: false,
              message: "User not found in database",
            },
        sync_needed: !typedDbUser || !typedDbUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error checking user sync status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
