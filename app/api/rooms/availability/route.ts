// app/api/rooms/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Room } from "@/models/Room";
import { Booking } from "@/models/Booking";
import "@/models/RoomType"; // Ensure RoomType schema is registered for populate
import dbConnect from "@/lib/db";
import { z } from "zod";

// Validation schema for availability check
const availabilitySchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.number().min(1).max(10, "Maximum 10 guests allowed"),
});

// Helper function to convert Decimal128 to number
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
    floor: room.floor,
    status: room.status,
    roomType: {
      ...room.roomType,
      basePrice: convertToNumber(room.roomType?.basePrice),
      extraPersonPrice: convertToNumber(room.roomType?.extraPersonPrice),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting availability check request");
    const { userId } = await auth();
    if (!userId) {
      console.log("Auth check failed: No user ID found");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to check availability" },
        { status: 401 }
      );
    }

    console.log("Auth check passed, user ID:", userId);

    await dbConnect();
    console.log("Database connected successfully");

    const body = await request.json();
    console.log("Request body:", body);

    const { checkIn, checkOut, guests } = availabilitySchema.parse(body);

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const conflictingBookings = await Booking.find({
      status: { $in: ["pending", "confirmed", "checked_in"] },
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        },
      ],
    }).select("room");

    // Get list of occupied room IDs
    const occupiedRoomIds = conflictingBookings.map((booking) =>
      booking.room.toString()
    );

    // Find available rooms that are not occupied
    const availableRooms = await Room.find({
      _id: { $nin: occupiedRoomIds },
      status: { $in: ["available", "reserved"] },
    })
      .populate({
        path: "roomType",
        model: "RoomType",
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .lean();

    // Transform rooms and filter by availability and guest count
    const transformedRooms = availableRooms
      .filter((room: any) => {
        // Double-check room is available
        if (room.status !== "available" && room.status !== "reserved") {
          return false;
        }
        // Check room type can accommodate guests
        if (!room.roomType || room.roomType.maxOccupancy < guests) {
          return false;
        }
        return true;
      })
      .map(transformRoomToResponse);

    // Sort by price (basePrice) and room number
    transformedRooms.sort((a, b) => {
      const priceA = Number(a.roomType.basePrice);
      const priceB = Number(b.roomType.basePrice);
      if (priceA === priceB) {
        return a.roomNumber.localeCompare(b.roomNumber);
      }
      return priceA - priceB;
    });

    return NextResponse.json({
      success: true,
      data: transformedRooms,
      searchParams: {
        checkIn,
        checkOut,
        guests,
        totalRooms: transformedRooms.length,
      },
    });
  } catch (error) {
    console.error("Error checking room availability:", error);

    // Log more detailed error information
    let errorMessage = "Failed to check room availability";
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
