// app/api/admin/users/[action]/route.ts - Generic action endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
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
    const targetUserId = formData.get("id") as string;

    if (!targetUserId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    switch (params.action) {
      case "disable": {
        // Get current user status from Clerk
        const clerkUser = await client.users.getUser(targetUserId);

        // Only ban if user is not already banned
        if (!clerkUser.banned) {
          await client.users.banUser(targetUserId);
        }

        // Mark as inactive in MongoDB
        await User.findOneAndUpdate(
          { _id: targetUserId },
          {
            $set: {
              isActive: false,
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: "User disabled successfully",
        });
      }

      case "enable": {
        // Get current user status from Clerk
        const clerkUser = await client.users.getUser(targetUserId);

        // Only unban if user is actually banned
        if (clerkUser.banned) {
          await client.users.unbanUser(targetUserId);
        }

        // Mark as active in MongoDB
        await User.findOneAndUpdate(
          { _id: targetUserId },
          {
            $set: {
              isActive: true,
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: "User enabled successfully",
        });
      }

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error(`Error in ${params.action}:`, error);

    // Provide more specific error messages
    let errorMessage = "Internal server error";

    if (error && typeof error === "object" && "clerkError" in error) {
      const clerkError = error as any;
      if (clerkError.errors && Array.isArray(clerkError.errors)) {
        errorMessage = `Clerk API error: ${clerkError.errors
          .map((e: any) => e.message || e.code)
          .join(", ")}`;
      } else {
        errorMessage = `Clerk API error: ${
          clerkError.message || "Unknown error"
        }`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new NextResponse(errorMessage, { status: 500 });
  }
}
