// app/api/admin/set-admin/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { User } from "@/models";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    const client = await clerkClient();

    // Update Clerk metadata to admin
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: "admin",
        approved: true,
      },
    });

    // Update database using Mongoose
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role: "admin",
          approved: true,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: "User not found in database",
          userId,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User set as admin successfully",
      userId,
      role: "admin",
      approved: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        approved: updatedUser.approved,
      },
    });
  } catch (error) {
    console.error("Error setting admin role:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
