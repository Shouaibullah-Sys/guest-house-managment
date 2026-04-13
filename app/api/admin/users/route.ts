// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

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

type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
  primaryEmailAddressId: string;
  imageUrl: string | null;
  publicMetadata: {
    role: "guest" | "staff" | "admin";
    approved: boolean;
  };
  banned: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  dbData: {
    phone: string | null;
    dateOfBirth?: Date;
    nationality?: string;
    loyaltyPoints: number;
    totalStays: number;
    totalSpent: number;
    staffProfile?: string;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  isActive: boolean;
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
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", 401);
    }

    if (currentUser.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const approved = searchParams.get("approved");
    const active = searchParams.get("active");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { _id: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (approved !== null) {
      filter.approved = approved === "true";
    }

    if (active !== null) {
      filter.isActive = active === "true";
    }

    const totalCount = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const transformedUsers: UserListItem[] = users.map((user: any) => {
      const fullName = user.name?.trim() || "User";
      const [firstName = "", ...restName] = fullName.split(" ");
      const lastName = restName.join(" ");
      const createdAt =
        user.createdAt instanceof Date
          ? user.createdAt.getTime()
          : Date.now();
      const updatedAt =
        user.updatedAt instanceof Date
          ? user.updatedAt.getTime()
          : createdAt;
      const totalSpent =
        typeof user.totalSpent?.toString === "function"
          ? Number(user.totalSpent.toString()) || 0
          : Number(user.totalSpent) || 0;

      return {
        id: user._id,
        firstName,
        lastName,
        fullName,
        emailAddresses: [
          {
            id: `email_${user._id}`,
            emailAddress: user.email || "",
          },
        ],
        primaryEmailAddressId: `email_${user._id}`,
        imageUrl: user.image || null,
        publicMetadata: {
          role: (user.role || "guest") as "guest" | "staff" | "admin",
          approved: Boolean(user.approved),
        },
        banned: !Boolean(user.isActive),
        createdAt,
        updatedAt,
        lastSignInAt: user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : null,
        dbData: {
          phone: user.phone || null,
          dateOfBirth: user.dateOfBirth,
          nationality: user.nationality,
          loyaltyPoints: Number(user.loyaltyPoints || 0),
          totalStays: Number(user.totalStays || 0),
          totalSpent,
          staffProfile: user.staffProfile?.toString?.(),
          notes: user.notes,
          isActive: Boolean(user.isActive),
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        },
        isActive: Boolean(user.isActive),
      };
    });

    return createSuccessResponse({
      users: transformedUsers,
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
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", 401);
    }

    if (currentUser.role !== "admin") {
      return createErrorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get("id");

    if (!userIdToDelete) {
      return createErrorResponse("User ID is required", 400);
    }

    if (userIdToDelete === currentUser._id?.toString()) {
      return createErrorResponse("You cannot delete your own account", 400);
    }

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
