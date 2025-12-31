// app/api/auth/sync-user-metadata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 User metadata sync request received");

    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🎯 Syncing metadata for authenticated user: ${userId}`);

    // Connect to database
    await dbConnect();

    // Get user info from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    const clerkUser = await client.users.getUser(userId);
    const metadata = clerkUser.publicMetadata || {};
    const userRole = metadata.role || "guest";
    const isApproved = metadata.approved === true;

    // Check if user exists in database
    const dbUser = await User.findOne({ _id: userId });

    if (!dbUser) {
      console.log(`🆕 User ${userId} not in database, creating...`);

      // Get user details from Clerk
      const email = clerkUser.emailAddresses.find(
        (email: any) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      const firstName = clerkUser.firstName || "";
      const lastName = clerkUser.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Guest";

      // Create user in database with default guest role and approved status
      const defaultRole = "guest";
      const defaultApproved = true;

      const newUser = new User({
        _id: userId,
        name: fullName,
        email: email || "",
        role: defaultRole,
        approved: defaultApproved,
        isActive: true,
      });

      await newUser.save();
      console.log(`✅ Created user ${userId} in database`);

      // Update Clerk metadata to match
      await client.users.updateUser(userId, {
        publicMetadata: {
          role: defaultRole,
          approved: defaultApproved,
        },
      });

      console.log(`✅ Metadata synchronized for ${userId}`);

      return NextResponse.json({
        success: true,
        message: "User created and metadata synchronized",
        data: {
          userId,
          role: defaultRole,
          approved: defaultApproved,
        },
      });
    } else {
      console.log(
        `📊 User ${userId} exists in database, checking consistency...`
      );

      // Check if metadata matches
      const dbRole = dbUser.role;
      const dbApproved = dbUser.approved;

      const needsUpdate =
        dbRole !== userRole || dbApproved !== isApproved || !dbUser.isActive;

      if (needsUpdate) {
        console.log(`🔄 Updating user ${userId} metadata...`);

        // Update database to match Clerk metadata
        await User.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              role: userRole,
              approved: isApproved,
              isActive: true,
            },
          }
        );

        console.log(`✅ Updated user ${userId} in database`);
      } else {
        console.log(`✅ User ${userId} metadata is consistent`);
      }

      return NextResponse.json({
        success: true,
        message: "Metadata synchronized successfully",
        data: {
          userId,
          role: userRole,
          approved: isApproved,
          consistent: !needsUpdate,
        },
      });
    }
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
