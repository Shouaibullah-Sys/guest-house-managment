// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

// Types for better type safety
type ApiResponse<T> = {
  users?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  success?: boolean;
  message?: string;
  error?: string;
};

// Helper function for consistent error responses
function createErrorResponse(message: string, status: number = 500): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { error: message },
    { 
      status,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}

// Helper function for consistent success responses
function createSuccessResponse<T>(data: T, options?: {
  status?: number;
  headers?: Record<string, string>;
  message?: string;
  pagination?: ApiResponse<T>['pagination'];
}): NextResponse<ApiResponse<T>> {
  const response = { ...data } as ApiResponse<T>;
  
  if (options?.message) response.message = options.message;
  if (options?.pagination) response.pagination = options.pagination;

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: {
      'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
      ...options?.headers
    }
  });
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    // Connect to database
    await dbConnect();

    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check if current user is admin
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    // Use Clerk's Admin API to get all users
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Get query parameters with validation
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const approved = searchParams.get("approved");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
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

    return createSuccessResponse({
      users: filteredUsers,
    }, {
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// DELETE endpoint for user deletion
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean; message: string }>>> {
  try {
    // Connect to database
    await dbConnect();

    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check if current user is admin
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get("id");

    if (!userIdToDelete) {
      return createErrorResponse("User ID is required", 400);
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

    return createSuccessResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
