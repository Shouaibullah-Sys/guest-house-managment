// app/api/rooms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";
import {
  searchRoomQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  deleteRoomQuerySchema,
  roomResponseSchema,
  checkRoomAvailabilitySchema,
  roomAvailabilityResponseSchema,
  type CreateRoomInput,
  type UpdateRoomInput,
  type SearchRoomQuery,
  type CheckRoomAvailabilityInput,
} from "@/lib/validation/room";
import { z } from "zod";



// Helper function to safely convert Decimal128 to number
function convertToNumber(value: any): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return parseFloat(value.$numberDecimal);
  }
  if (value && typeof value === "object" && "toString" in value) {
    return parseFloat(value.toString());
  }
  return 0;
}

// Transform Room document to frontend format
function transformRoomToResponse(room: any) {
  return {
    id: room._id.toString(),
    roomNumber: room.roomNumber,
    roomTypeId: room.roomType?.toString() || null,
    roomType: room.roomTypeData || null,
    floor: room.floor,
    status: room.status,
    lastCleaned: room.lastCleaned ? room.lastCleaned.toISOString() : null,
    notes: room.notes || "",
    imageUrl: room.imageUrl || null,
    imagePath: room.imagePath || null,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

// Transform RoomType data to frontend format (for nested room types)
function transformRoomTypeToResponse(roomType: any) {
  return {
    id: roomType._id.toString(),
    name: roomType.name,
    code: roomType.code,
    category: roomType.category,
    description: roomType.description || null,
    maxOccupancy: roomType.maxOccupancy,
    basePrice: convertToNumber(roomType.basePrice),
    extraPersonPrice: roomType.extraPersonPrice
      ? convertToNumber(roomType.extraPersonPrice)
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
    createdAt: roomType.createdAt
      ? roomType.createdAt.toISOString()
      : new Date().toISOString(),
    updatedAt: roomType.updatedAt
      ? roomType.updatedAt.toISOString()
      : new Date().toISOString(),
  };
}

// GET /api/rooms - List rooms with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const queryData: Record<string, string> = {};
    
    // Extract all search parameters
    searchParams.forEach((value, key) => {
      queryData[key] = value;
    });

    // Validate and parse query parameters
    const query: SearchRoomQuery = searchRoomQuerySchema.parse(queryData);

    // Build filter
    const filter: any = {};

    // Apply search filter
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [{ roomNumber: searchRegex }];
    }

    // Apply status filter
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    // Apply floor filter
    if (query.floor && query.floor !== "all") {
      filter.floor = parseInt(query.floor);
    }

    // Apply room type filter
    if (query.roomType && query.roomType !== "all") {
      filter.roomType = query.roomType;
    }

    // Apply category filter (needs to be joined with roomType)
    if (query.category && query.category !== "all") {
      // We'll handle this after getting room types
    }

    // Pagination
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "50");
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Room.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Get rooms with populated room type data
    const rooms = await Room.find(filter)
      .populate({
        path: "roomType",
        model: "RoomType",
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .sort({ floor: 1, roomNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform rooms and handle category filter if needed
    let transformedRooms = rooms.map((room: any) => ({
      ...transformRoomToResponse(room),
      roomType: room.roomType
        ? transformRoomTypeToResponse(room.roomType)
        : null,
    }));

    // Apply category filter if specified
    if (query.category && query.category !== "all") {
      transformedRooms = transformedRooms.filter(
        (room: any) => room.roomType?.category === query.category
      );
    }

    return NextResponse.json({
      success: true,
      data: transformedRooms,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const roomData: CreateRoomInput = createRoomSchema.parse(body);

    // Check if room number already exists
    const existingRoom = await Room.findOne({
      roomNumber: roomData.roomNumber,
    });
    if (existingRoom) {
      return NextResponse.json(
        { error: "شماره اتاق قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    // Check if room type exists
    const roomType = await RoomType.findById(roomData.roomTypeId);
    if (!roomType) {
      return NextResponse.json({ error: "نوع اتاق یافت نشد" }, { status: 400 });
    }

    // Create new room
    const newRoom = new Room({
      roomNumber: roomData.roomNumber,
      roomType: roomData.roomTypeId,
      floor: roomData.floor,
      status: roomData.status,
      notes: roomData.notes,
      imageUrl: roomData.imageUrl,
    });

    await newRoom.save();

    // Populate the created room for response
    const populatedRoom = await Room.findById(newRoom._id)
      .populate({
        path: "roomType",
        model: "RoomType",
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .lean();

    if (!populatedRoom) {
      return NextResponse.json(
        { error: "Failed to retrieve created room" },
        { status: 500 }
      );
    }

    const transformedRoom = transformRoomToResponse(populatedRoom);
    const populatedRoomData = populatedRoom as any;
    if (populatedRoomData.roomType) {
      (transformedRoom as any).roomType = transformRoomTypeToResponse(
        populatedRoomData.roomType
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedRoom,
        message: "اتاق با موفقیت ایجاد شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// PUT /api/rooms - Update a room
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const roomData: UpdateRoomInput = updateRoomSchema.parse(body);

    // Check if room exists
    const existingRoom = await Room.findById(roomData.id);
    if (!existingRoom) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    // Check if room number already exists (if changing room number)
    if (
      roomData.roomNumber &&
      roomData.roomNumber !== existingRoom.roomNumber
    ) {
      const duplicateRoom = await Room.findOne({
        roomNumber: roomData.roomNumber,
        _id: { $ne: roomData.id },
      });
      if (duplicateRoom) {
        return NextResponse.json(
          { error: "شماره اتاق قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    // Check if room type exists (if changing room type)
    if (roomData.roomTypeId) {
      const roomType = await RoomType.findById(roomData.roomTypeId);
      if (!roomType) {
        return NextResponse.json(
          { error: "نوع اتاق یافت نشد" },
          { status: 400 }
        );
      }
    }

    // Update room
    const updateData: any = {};
    if (roomData.roomNumber) updateData.roomNumber = roomData.roomNumber;
    if (roomData.roomTypeId) updateData.roomType = roomData.roomTypeId;
    if (roomData.floor) updateData.floor = roomData.floor;
    if (roomData.status) updateData.status = roomData.status;
    if (roomData.notes !== undefined) updateData.notes = roomData.notes;
    if (roomData.imageUrl !== undefined)
      updateData.imageUrl = roomData.imageUrl;

    const updatedRoom = await Room.findByIdAndUpdate(roomData.id, updateData, {
      new: true,
    })
      .populate({
        path: "roomType",
        model: "RoomType",
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .lean();

    if (!updatedRoom) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    const transformedRoom = transformRoomToResponse(updatedRoom);
    const updatedRoomData = updatedRoom as any;
    if (updatedRoomData.roomType) {
      (transformedRoom as any).roomType = transformRoomTypeToResponse(
        updatedRoomData.roomType
      );
    }

    return NextResponse.json({
      success: true,
      data: transformedRoom,
      message: "اتاق با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating room:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms - Delete a room
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const queryData: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryData[key] = value;
    });

    const { id: roomId } = deleteRoomQuerySchema.parse(queryData);

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    // Check if room has active bookings
    const activeBookings = await Booking.findOne({
      room: roomId,
      status: { $in: ["confirmed", "checked_in"] },
    });

    if (activeBookings) {
      return NextResponse.json(
        { error: "امکان حذف اتاق با رزروهای فعال وجود ندارد" },
        { status: 400 }
      );
    }

    // Delete room
    await Room.findByIdAndDelete(roomId);

    return NextResponse.json({
      success: true,
      message: "اتاق با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
