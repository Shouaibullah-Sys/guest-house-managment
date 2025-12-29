// app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";
import { z } from "zod";
import { Types } from "mongoose";

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
    roomType: room.roomTypeData || room.roomType || null,
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

// Transform RoomType data to frontend format
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

// GET /api/rooms/[id] - Get a specific room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id: roomId } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(roomId)) {
      return NextResponse.json(
        { error: "Invalid room ID format" },
        { status: 400 }
      );
    }

    // Get room with populated room type data
    const room = await Room.findById(roomId)
      .populate({
        path: "roomType",
        model: "RoomType",
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .lean();

    if (!room) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    const transformedRoom = transformRoomToResponse(room);
    const roomData = room as any;
    if (roomData.roomType) {
      (transformedRoom as any).roomType = transformRoomTypeToResponse(
        roomData.roomType
      );
    }

    return NextResponse.json({
      success: true,
      data: transformedRoom,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - Update a specific room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id: roomId } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(roomId)) {
      return NextResponse.json(
        { error: "Invalid room ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validation schema for update
    const updateSchema = z.object({
      roomNumber: z.string().min(1, "Room number is required").optional(),
      roomTypeId: z.string().optional(),
      floor: z.number().int().min(0).optional(),
      status: z.enum([
        "available",
        "occupied",
        "reserved",
        "maintenance",
        "cleaning",
      ]).optional(),
      notes: z.string().optional(),
      imageUrl: z.string().url().optional().nullable(),
    });

    const updateData = updateSchema.parse(body);

    // Check if room exists
    const existingRoom = await Room.findById(roomId);
    if (!existingRoom) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    // Check if room number already exists (if changing room number)
    if (
      updateData.roomNumber &&
      updateData.roomNumber !== existingRoom.roomNumber
    ) {
      const duplicateRoom = await Room.findOne({
        roomNumber: updateData.roomNumber,
        _id: { $ne: roomId },
      });
      if (duplicateRoom) {
        return NextResponse.json(
          { error: "شماره اتاق قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    // Check if room type exists (if changing room type)
    if (updateData.roomTypeId) {
      const roomType = await RoomType.findById(updateData.roomTypeId);
      if (!roomType) {
        return NextResponse.json(
          { error: "نوع اتاق یافت نشد" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateFields: any = {};
    if (updateData.roomNumber) updateFields.roomNumber = updateData.roomNumber;
    if (updateData.roomTypeId) updateFields.roomType = updateData.roomTypeId;
    if (updateData.floor !== undefined) updateFields.floor = updateData.floor;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
    if (updateData.imageUrl !== undefined)
      updateFields.imageUrl = updateData.imageUrl;

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateFields, {
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
    const roomData = updatedRoom as any;
    if (roomData.roomType) {
      (transformedRoom as any).roomType = transformRoomTypeToResponse(
        roomData.roomType
      );
    }

    return NextResponse.json({
      success: true,
      data: transformedRoom,
      message: "اتاق با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating room:", error);

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete a specific room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id: roomId } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(roomId)) {
      return NextResponse.json(
        { error: "Invalid room ID format" },
        { status: 400 }
      );
    }

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