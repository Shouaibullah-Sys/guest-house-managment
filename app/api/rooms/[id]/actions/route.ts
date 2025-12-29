// app/api/rooms/[id]/actions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";
import { z } from "zod";
import { Types } from "mongoose";

// Transform Room document to frontend format (consistent with main rooms route)
function transformRoomToResponse(room: any) {
  return {
    id: room._id.toString(),
    roomNumber: room.roomNumber,
    roomTypeId: room.roomType?.toString() || null,
    roomType: room.roomType || null,
    floor: room.floor,
    status: room.status,
    lastCleaned: room.lastCleaned ? room.lastCleaned.toISOString() : null,
    notes: room.notes || "",
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

// POST /api/rooms/{id}/actions - Perform quick actions on a room
export async function POST(
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

    // Action validation
    const actionSchema = z.object({
      action: z.enum([
        "mark_clean",
        "mark_maintenance",
        "mark_available",
        "mark_occupied",
        "mark_reserved",
        "mark_cleaning",
        "generate_qr",
        "update_last_cleaned",
      ]),
      data: z.any().optional(),
    });

    const { action } = actionSchema.parse(body);

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "اتاق یافت نشد" }, { status: 404 });
    }

    let updateData: Record<string, any> = {};
    let message = "";

    switch (action) {
      case "mark_clean":
        updateData.status = "available";
        updateData.lastCleaned = new Date();
        message = "اتاق به عنوان تمیز علامت گذاری شد";
        break;

      case "mark_maintenance":
        updateData.status = "maintenance";
        message = "اتاق برای تعمیر علامت گذاری شد";
        break;

      case "mark_available":
        updateData.status = "available";
        message = "اتاق به عنوان آزاد علامت گذاری شد";
        break;

      case "mark_occupied":
        updateData.status = "occupied";
        message = "اتاق به عنوان اشغال شده علامت گذاری شد";
        break;

      case "mark_reserved":
        updateData.status = "reserved";
        message = "اتاق به عنوان رزرو شده علامت گذاری شد";
        break;

      case "mark_cleaning":
        updateData.status = "cleaning";
        message = "اتاق برای نظافت علامت گذاری شد";
        break;

      case "update_last_cleaned":
        updateData.lastCleaned = new Date();
        message = "زمان آخرین نظافت بروزرسانی شد";
        break;

      case "generate_qr":
        // Generate a unique QR code for the room
        const qrCodeData = {
          qrCode: `ROOM-${room.roomNumber}-${Date.now()}`,
          roomNumber: room.roomNumber,
          roomId: room._id.toString(),
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: qrCodeData,
          message: "QR کد اتاق تولید شد",
        });

      default:
        return NextResponse.json({ error: "عملیات نامعتبر" }, { status: 400 });
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
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
      return NextResponse.json(
        { error: "Failed to update room" },
        { status: 500 }
      );
    }

    // Transform response using the shared function
    const transformedRoom = transformRoomToResponse(updatedRoom);

    return NextResponse.json({
      success: true,
      data: transformedRoom,
      message,
    });
  } catch (error) {
    console.error("Error performing room action:", error);

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

    // Handle MongoDB validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Database validation failed",
          details: error.name,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? error.message
        : "An unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform room action",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
