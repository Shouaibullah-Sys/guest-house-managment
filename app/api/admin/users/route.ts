// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
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

    // Use Clerk's Admin API to get all users
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const approved = searchParams.get("approved");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get users from Clerk with pagination
    const clerkUsers = await client.users.getUserList({
      limit: Math.min(limit, 100), // Clerk max is 500, but we'll use 100 for performance
      offset: offset,
      query: search || undefined, // Clerk supports search
    });

    // Get all user IDs from Clerk response
    const clerkUserIds = clerkUsers.data.map((user) => user.id);

    // Get users from MongoDB with matching IDs
    const mongoUsers = await User.find({
      _id: { $in: clerkUserIds },
    }).lean();

    // Create a map of MongoDB users for quick lookup
    const mongoUserMap = new Map();
    mongoUsers.forEach((user) => {
      mongoUserMap.set(user._id, user);
    });

    // Transform the data to combine Clerk and MongoDB data
    const transformedUsers = clerkUsers.data.map((user) => {
      const mongoUser = mongoUserMap.get(user.id);

      return {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "User",
        emailAddresses: user.emailAddresses.map((email) => ({
          id: email.id,
          emailAddress: email.emailAddress,
        })),
        primaryEmailAddressId: user.primaryEmailAddressId,
        imageUrl: user.imageUrl,
        publicMetadata: user.publicMetadata,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastSignInAt: user.lastSignInAt,
        // MongoDB data if exists
        dbData: mongoUser
          ? {
              phone: mongoUser.phone,
              dateOfBirth: mongoUser.dateOfBirth,
              nationality: mongoUser.nationality,
              loyaltyPoints: mongoUser.loyaltyPoints,
              totalStays: mongoUser.totalStays,
              totalSpent: mongoUser.totalSpent,
              staffProfile: mongoUser.staffProfile,
              notes: mongoUser.notes,
              isActive: mongoUser.isActive,
              createdAt: mongoUser.createdAt,
              updatedAt: mongoUser.updatedAt,
            }
          : null,
      };
    });

    // Filter by role and approval status (if provided)
    let filteredUsers = transformedUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(
        (user) => (user.publicMetadata as any)?.role === role
      );
    }

    if (approved !== null) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          (user.publicMetadata as any)?.approved === (approved === "true")
      );
    }

    // Get total count from Clerk (we need to make a separate call for this)
    const totalCount = clerkUsers.totalCount;

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// DELETE endpoint for user deletion
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get("id");

    if (!userIdToDelete) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Use Clerk's Admin API to delete user
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Delete from Clerk
    await client.users.deleteUser(userIdToDelete);

    // Mark as inactive in MongoDB (soft delete)
    await User.findOneAndUpdate(
      { _id: userIdToDelete },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
