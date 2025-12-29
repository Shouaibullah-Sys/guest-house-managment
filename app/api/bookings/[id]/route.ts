// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Transform Booking document to frontend format
function transformBookingToResponse(booking: any) {
  // Helper function to convert Decimal128 to number
  const convertToNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "$numberDecimal" in value) {
      return parseFloat(value.$numberDecimal);
    }
    if (value && typeof value === "object" && "toString" in value) {
      return parseFloat(value.toString());
    }
    return 0;
  };

  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    guestId: booking.guest,
    guestName: booking.guest?.name || "Unknown Guest",
    guestEmail: booking.guest?.email || "",
    guestPhone: booking.guest?.phone || "",
    roomNumber: booking.room?.roomNumber || "Unknown",
    roomType: booking.room?.roomType?.name || "Unknown",
    checkInDate: booking.checkInDate.toISOString().split("T")[0],
    checkOutDate: booking.checkOutDate.toISOString().split("T")[0],
    totalNights: booking.totalNights,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    totalAmount: convertToNumber(booking.totalAmount),
    paidAmount: convertToNumber(booking.paidAmount),
    outstandingAmount: convertToNumber(booking.outstandingAmount),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    specialRequests: booking.specialRequests || "",
    source: booking.source || "",
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    notes: booking.notes || "",
  };
}

// GET /api/bookings/[id] - Get a specific booking
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
    const { id } = await params;

    const booking = await Booking.findById(id)
      .populate({
        path: "guest",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor roomType",
        populate: {
          path: "roomType",
          model: "RoomType",
          select: "name",
        },
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const transformedBooking = transformBookingToResponse(booking);

    return NextResponse.json({
      data: transformedBooking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a booking
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
    const { id } = await params;

    const body = await request.json();

    // Validation schema for updates (excluding calculated fields)
    const updateSchema = z.object({
      status: z.string().optional(),
      roomId: z.string().optional(),
      checkInDate: z.string().optional(),
      checkOutDate: z.string().optional(),
      adults: z.number().min(1).optional(),
      children: z.number().min(0).optional(),
      infants: z.number().min(0).optional(),
      roomRate: z.number().min(0).optional(),
      specialRequests: z.string().optional(),
      notes: z.string().optional(),
    });

    const updateData = updateSchema.parse(body);

    // Check if booking exists
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Build update object
    const updateObj: any = { ...updateData };

    // Handle date changes and recalculate totalNights and totalAmount
    let checkInDate = existingBooking.checkInDate;
    let checkOutDate = existingBooking.checkOutDate;
    let roomRate = Number(existingBooking.roomRate);

    if (updateData.checkInDate) {
      checkInDate = new Date(updateData.checkInDate);
      updateObj.checkInDate = checkInDate;
    }
    if (updateData.checkOutDate) {
      checkOutDate = new Date(updateData.checkOutDate);
      updateObj.checkOutDate = checkOutDate;
    }
    if (updateData.roomRate !== undefined) {
      roomRate = updateData.roomRate;
      updateObj.roomRate = roomRate;
    }

    // Recalculate totalNights and totalAmount if dates or roomRate changed
    if (
      updateData.checkInDate ||
      updateData.checkOutDate ||
      updateData.roomRate
    ) {
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (totalNights <= 0) {
        return NextResponse.json(
          { error: "تاریخ خروج باید بعد از تاریخ ورود باشد" },
          { status: 400 }
        );
      }

      updateObj.totalNights = totalNights;
      updateObj.totalAmount = totalNights * roomRate;

      // Recalculate outstanding amount based on new total
      const paidAmount = Number(existingBooking.paidAmount);
      updateObj.outstandingAmount = Math.max(
        0,
        updateObj.totalAmount - paidAmount
      );
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateObj, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "guest",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor roomType",
        populate: {
          path: "roomType",
          model: "RoomType",
          select: "name",
        },
      })
      .lean();

    const transformedBooking = transformBookingToResponse(updatedBooking);

    return NextResponse.json({
      data: transformedBooking,
      message: "رزرو با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking
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
    const { id } = await params;

    // Check if booking exists
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Don't allow deletion of checked-in bookings
    if (existingBooking.status === "checked_in") {
      return NextResponse.json(
        { error: "نمی‌توان رزروهای چک این شده را حذف کرد" },
        { status: 400 }
      );
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      message: "رزرو با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
