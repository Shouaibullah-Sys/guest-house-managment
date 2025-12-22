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
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Pagination
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "50");
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
    const guests = users.map(transformUserToGuest);

    return NextResponse.json({
      data: guests,
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

// POST /api/guests - Create a new guest
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const guestData: GuestFormData = guestFormSchema.parse(body);

    // Check if email already exists
    const existingUser = await User.findOne({ email: guestData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (guestData.phone) {
      const existingPhone = await User.findOne({ phone: guestData.phone });
      if (existingPhone) {
        return NextResponse.json(
          { error: "این شماره تلفن قبلاً استفاده شده است" },
          { status: 400 }
        );
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

    return NextResponse.json(
      {
        data: transformedGuest,
        message: "Guest created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating guest:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
}
