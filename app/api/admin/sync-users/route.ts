// app/api/admin/sync-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { User } from "@/models";

export async function POST(req: NextRequest) {
  try {
    // Require admin role
    await requireRole("admin");

    console.log("🚀 Starting manual user sync...");

    // Connect to database
    await dbConnect();

    // Get Clerk client
    const client = await clerkClient();

    // Get all users from Clerk
    const clerkUsers = await client.users.getUserList({
      limit: 100, // Adjust as needed
    });

    console.log(`📊 Found ${clerkUsers.data.length} users in Clerk`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each user
    for (const clerkUser of clerkUsers.data) {
      try {
        // Check if user already exists in database
        const existingUser = await User.findOne({ _id: clerkUser.id });

        // Extract user data from Clerk
        const primaryEmail =
          clerkUser.emailAddresses.find(
            (email) => email.id === clerkUser.primaryEmailAddressId
          )?.emailAddress ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          "";

        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const fullName =
          `${firstName} ${lastName}`.trim() || clerkUser.username || "Guest";

        // Get role and approval status from metadata
        const metadata = clerkUser.publicMetadata || {};
        const userRole = metadata.role || "guest";
        const isApproved = metadata.approved === true;

        const userData = {
          _id: clerkUser.id,
          name: fullName,
          email: primaryEmail,
          emailVerified:
            clerkUser.emailAddresses[0]?.verification?.status === "verified",
          image: clerkUser.imageUrl,
          role: userRole,
          approved: isApproved,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          isActive: !clerkUser.banned,
        };

        if (existingUser) {
          // Update existing user
          await User.findOneAndUpdate(
            { _id: clerkUser.id },
            { $set: userData }
          );
          updatedCount++;
        } else {
          // Create new user
          const newUser = new User(userData);
          await newUser.save();
          createdCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${clerkUser.id}:`, userError);
        skippedCount++;
      }
    }

    // Show final user count in database
    const totalDbUsers = await User.countDocuments({});

    return NextResponse.json({
      success: true,
      message: "User sync completed successfully",
      statistics: {
        totalClerkUsers: clerkUsers.data.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        totalDbUsers: totalDbUsers,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Require admin role
    await requireRole("admin");

    // Connect to database
    await dbConnect();

    // Get user statistics
    const totalUsers = await User.countDocuments({});
    const guestUsers = await User.countDocuments({ role: "guest" });
    const staffUsers = await User.countDocuments({ role: "staff" });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const approvedUsers = await User.countDocuments({ approved: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    return NextResponse.json({
      success: true,
      statistics: {
        total: totalUsers,
        byRole: {
          guest: guestUsers,
          staff: staffUsers,
          admin: adminUsers,
        },
        byStatus: {
          approved: approvedUsers,
          active: activeUsers,
        },
      },
    });
  } catch (error) {
    console.error("Statistics error:", error);
    return NextResponse.json(
      {
        error: "Failed to get statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
