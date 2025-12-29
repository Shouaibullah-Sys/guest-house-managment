// app/api/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";
import { z } from "zod";
import {
  guestFormSchema,
  guestListItemSchema,
  type GuestFormData,
  type GuestListItem,
} from "@/lib/validation/guest";

// Types for better type safety
type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
  const response: ApiResponse<T> = { data };
  
  if (options?.message) response.message = options.message;
  if (options?.pagination) response.pagination = options.pagination;

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: {
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      ...options?.headers
    }
  });
}

// Search query validation
const searchQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Transform User document to Guest response format
function transformUserToGuest(user: any): GuestListItem {
  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    nationality: user.nationality || "",
    idType: user.idType,
    idNumber: user.idNumber,
    passportNumber: user.passportNumber,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split("T")[0]
      : undefined,
    address: user.address,
    city: user.city,
    country: user.country,
    postalCode: user.postalCode,
    emergencyContact: user.emergencyContact,
    preferences: user.preferences,
    loyaltyPoints: user.loyaltyPoints || 0,
    totalStays: user.totalStays || 0,
    totalSpent: Number(user.totalSpent) || 0, // Convert Decimal128 to number
    isActive: user.isActive !== false,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastStay: undefined, // This would need to be calculated from bookings
  };
}

// GET /api/guests - List guests with search and filtering
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GuestListItem[]>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    // Build filter - only get users with role "guest"
    const filter: any = { role: "guest" };

    // Apply search filter
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { nationality: searchRegex },
      ];
    }

    // Apply status filter
    if (query.status === "active") {
      filter.isActive = true;
    } else if (query.status === "inactive") {
      filter.isActive = false;
    }

    // Pagination with validation
    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50")));
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Get guests from database
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to guest format
    const guests: GuestListItem[] = users.map(transformUserToGuest);

    return createSuccessResponse(guests, {
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching guests:", error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse("Failed to fetch guests");
  }
}

// POST /api/guests - Create a new guest
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<GuestListItem>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    await dbConnect();

    const body = await request.json();
    const guestData: GuestFormData = guestFormSchema.parse(body);

    // Check if email already exists
    const existingUser = await User.findOne({ email: guestData.email });
    if (existingUser) {
      return createErrorResponse("Email already exists", 400);
    }

    // Check if phone already exists (if provided)
    if (guestData.phone) {
      const existingPhone = await User.findOne({ phone: guestData.phone });
      if (existingPhone) {
        return createErrorResponse("Phone number already exists", 400);
      }
    }

    // Create new guest as a User with role "guest"
    const newGuest = new User({
      _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
      nationality: guestData.nationality,
      idType: guestData.idType,
      idNumber: guestData.idNumber,
      passportNumber: guestData.passportNumber,
      dateOfBirth: guestData.dateOfBirth
        ? new Date(guestData.dateOfBirth)
        : undefined,
      address: guestData.address,
      city: guestData.city,
      country: guestData.country,
      postalCode: guestData.postalCode,
      emergencyContact: guestData.emergencyContact,
      preferences: guestData.preferences,
      role: "guest",
      isActive: guestData.isActive,
      loyaltyPoints: 0,
      totalStays: 0,
      totalSpent: 0,
    });

    await newGuest.save();

    // Transform and return the created guest
    const transformedGuest = transformUserToGuest(newGuest);

    return createSuccessResponse(transformedGuest, {
      status: 201,
      message: "Guest created successfully",
    });
  } catch (error) {
    console.error("Error creating guest:", error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse("Failed to create guest");
  }
}
