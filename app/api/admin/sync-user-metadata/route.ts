// app/api/admin/sync-user-metadata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 User metadata sync request received");

    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    await dbConnect();
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    console.log(`🎯 Syncing metadata for user: ${targetUserId}`);

    // Get user info from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    const clerkUser = await client.users.getUser(targetUserId);
    const metadata = clerkUser.publicMetadata || {};
    const userRole = metadata.role || "guest";
    const isApproved = metadata.approved === true;

    // Check if user exists in database
    const dbUser = await User.findOne({ _id: targetUserId });

    if (!dbUser) {
      console.log(`🆕 User ${targetUserId} not in database, creating...`);

      // Get user details from Clerk
      const email = clerkUser.emailAddresses.find(
        (email: any) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      const firstName = clerkUser.firstName || "";
      const lastName = clerkUser.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Guest";

      // Create user in database
      const newUser = new User({
        _id: targetUserId,
        name: fullName,
        email: email || "",
        role: userRole,
        approved: isApproved,
        isActive: true,
      });

      await newUser.save();
      console.log(`✅ Created user ${targetUserId} in database`);
    } else {
      console.log(
        `📊 User ${targetUserId} exists in database, checking consistency...`
      );

      // Check if metadata matches
      const dbRole = dbUser.role;
      const dbApproved = dbUser.approved;

      const needsUpdate =
        dbRole !== userRole || dbApproved !== isApproved || !dbUser.isActive;

      if (needsUpdate) {
        console.log(`🔄 Updating user ${targetUserId} metadata...`);

        await User.findOneAndUpdate(
          { _id: targetUserId },
          {
            $set: {
              role: userRole,
              approved: isApproved,
              isActive: true,
            },
          }
        );

        console.log(`✅ Updated user ${targetUserId} in database`);
      } else {
        console.log(`✅ User ${targetUserId} metadata is consistent`);
      }
    }

    // Also ensure Clerk metadata is consistent
    await client.users.updateUser(targetUserId, {
      publicMetadata: {
        role: userRole,
        approved: isApproved,
      },
    });

    console.log(`🎉 Sync completed for user ${targetUserId}`);

    return NextResponse.json({
      success: true,
      message: "User metadata synchronized successfully",
      data: {
        userId: targetUserId,
        role: userRole,
        approved: isApproved,
        inDatabase: !!dbUser,
      },
    });
  } catch (error) {
    console.error("💥 Error syncing user metadata:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user info from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    const clerkUser = await client.users.getUser(targetUserId);
    const metadata = clerkUser.publicMetadata || {};

    // Get user from database
    const dbUser = await User.findOne({ _id: targetUserId });

    return NextResponse.json({
      success: true,
      data: {
        clerk: {
          id: clerkUser.id,
          role: metadata.role || "guest",
          approved: metadata.approved === true,
          metadata,
        },
        database: dbUser
          ? {
              role: dbUser.role,
              approved: dbUser.approved,
              isActive: dbUser.isActive,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("💥 Error getting user metadata:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
