// app/api/room-types/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Transform RoomType document to frontend format
function transformRoomTypeToResponse(roomType: any) {
  return {
    id: roomType._id.toString(),
    name: roomType.name,
    code: roomType.code,
    category: roomType.category,
    description: roomType.description || null,
    maxOccupancy: roomType.maxOccupancy,
    basePrice: Number(roomType.basePrice),
    extraPersonPrice: roomType.extraPersonPrice
      ? Number(roomType.extraPersonPrice)
      : null,
    amenities: roomType.amenities || [],
    premiumAmenities: roomType.premiumAmenities || [],
    images: roomType.images || [],
    size: roomType.size || null,
    bedType: roomType.bedType || null,
    viewType: roomType.viewType || "city",
    smokingAllowed: roomType.smokingAllowed,
    isActive: roomType.isActive,
    rating: roomType.rating || 0,
    createdAt: roomType.createdAt.toISOString(),
    updatedAt: roomType.updatedAt.toISOString(),
  };
}

// GET /api/room-types - List all room types
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    // Build filter
    const filter: any = {};

    // Apply category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Apply active filter
    if (isActive !== null && isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    // Get room types
    const roomTypes = await RoomType.find(filter).sort({ name: 1 }).lean();

    const transformedRoomTypes = roomTypes.map(transformRoomTypeToResponse);

    return NextResponse.json({
      success: true,
      data: transformedRoomTypes,
    });
  } catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json(
      { error: "Failed to fetch room types" },
      { status: 500 }
    );
  }
}

// POST /api/room-types - Create a new room type
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Basic room type validation
    const roomTypeSchema = z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      category: z.enum(["luxury", "executive", "standard", "family"]),
      description: z.string().optional(),
      maxOccupancy: z.number().min(1),
      basePrice: z.number().min(0),
      extraPersonPrice: z.number().min(0).optional(),
      amenities: z.array(z.string()).optional(),
      premiumAmenities: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
      size: z.string().optional(),
      bedType: z.string().optional(),
      viewType: z.enum(["mountain", "city", "garden", "pool"]).default("city"),
      smokingAllowed: z.boolean().default(false),
      isActive: z.boolean().default(true),
    });

    const roomTypeData = roomTypeSchema.parse(body);

    // Check if room type code already exists
    const existingRoomType = await RoomType.findOne({
      code: roomTypeData.code,
    });
    if (existingRoomType) {
      return NextResponse.json(
        { error: "کد نوع اتاق قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    // Create new room type
    const newRoomType = new RoomType(roomTypeData);

    await newRoomType.save();

    const transformedRoomType = transformRoomTypeToResponse(newRoomType);

    return NextResponse.json(
      {
        success: true,
        data: transformedRoomType,
        message: "نوع اتاق با موفقیت ایجاد شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room type:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create room type" },
      { status: 500 }
    );
  }
}
