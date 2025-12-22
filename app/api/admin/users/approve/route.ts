// app/api/admin/users/approve/route.ts - Separate route for approval
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const userIdToApprove = formData.get("id") as string;

    if (!userIdToApprove) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Use Clerk's Admin API to update user
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Get current user metadata
    const clerkUser = await client.users.getUser(userIdToApprove);
    const currentMetadata = clerkUser.publicMetadata as any;

    // Update Clerk metadata
    await client.users.updateUser(userIdToApprove, {
      publicMetadata: {
        ...currentMetadata,
        approved: true,
      },
    });

    // Update MongoDB user
    await User.findOneAndUpdate(
      { _id: userIdToApprove },
      {
        $set: {
          approved: true,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
