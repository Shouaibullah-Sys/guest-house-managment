// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Search query validation
const searchQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  dateRange: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Transform Booking document to frontend format
function transformBookingToResponse(booking: any) {
  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    guestId: booking.guest,
    guestName: booking.guestData?.name || "Unknown Guest",
    guestEmail: booking.guestData?.email || "",
    guestPhone: booking.guestData?.phone || "",
    roomNumber: booking.roomData?.roomNumber || "Unknown",
    roomType:
      booking.roomData?.roomType?.name ||
      booking.roomData?.roomType ||
      "Unknown",
    checkInDate: booking.checkInDate.toISOString().split("T")[0],
    checkOutDate: booking.checkOutDate.toISOString().split("T")[0],
    totalNights: booking.totalNights,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    totalAmount: Number(booking.totalAmount),
    paidAmount: Number(booking.paidAmount),
    outstandingAmount: Number(booking.outstandingAmount),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    specialRequests: booking.specialRequests || "",
    source: booking.source || "",
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    notes: booking.notes || "",
  };
}

// GET /api/bookings - List bookings with search and filtering
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
      paymentStatus: searchParams.get("paymentStatus") ?? undefined,
      dateRange: searchParams.get("dateRange") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    // Build filter
    const filter: any = {};

    // Apply search filter
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { bookingNumber: searchRegex },
        { guest: searchRegex }, // This will be populated with guest name
      ];
    }

    // Apply status filter
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    // Apply payment status filter
    if (query.paymentStatus && query.paymentStatus !== "all") {
      filter.paymentStatus = query.paymentStatus;
    }

    // Apply date range filter
    if (query.dateRange && query.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (query.dateRange) {
        case "today":
          filter.checkInDate = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          };
          break;
        case "tomorrow":
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          filter.checkInDate = {
            $gte: tomorrow,
            $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
          };
          break;
        case "this_week":
          const startOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay())
          );
          const endOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay() + 6)
          );
          filter.checkInDate = { $gte: startOfWeek, $lte: endOfWeek };
          break;
        case "next_week":
          const nextWeekStart = new Date(
            today.setDate(today.getDate() - today.getDay() + 7)
          );
          const nextWeekEnd = new Date(
            today.setDate(today.getDate() - today.getDay() + 13)
          );
          filter.checkInDate = { $gte: nextWeekStart, $lte: nextWeekEnd };
          break;
        case "this_month":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filter.checkInDate = { $gte: startOfMonth, $lte: endOfMonth };
          break;
      }
    }

    // Pagination
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Get bookings with populated guest and room data
    const bookings = await Booking.find(filter)
      .populate({
        path: "guest",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor",
      })
      .populate({
        path: "room.roomType",
        model: "RoomType",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to frontend format
    const transformedBookings = bookings.map((booking: any) => ({
      ...transformBookingToResponse(booking),
      guestData: booking.guest,
      roomData: {
        ...booking.room,
        roomType: booking.room?.roomType?.name || "Unknown",
      },
    }));

    // Calculate statistics
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          checkedInBookings: {
            $sum: { $cond: [{ $eq: ["$status", "checked_in"] }, 1, 0] },
          },
          revenue: { $sum: { $toDouble: "$totalAmount" } },
        },
      },
    ]);

    const statistics = stats[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      checkedInBookings: 0,
      revenue: 0,
    };

    return NextResponse.json({
      data: transformedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      stats: {
        ...statistics,
        avgBookingValue:
          statistics.totalBookings > 0
            ? statistics.revenue / statistics.totalBookings
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Basic booking validation (excluding calculated fields)
    const bookingSchema = z.object({
      guestId: z.string(),
      roomId: z.string(),
      checkInDate: z.string(),
      checkOutDate: z.string(),
      adults: z.number().min(1),
      children: z.number().min(0).default(0),
      infants: z.number().min(0).default(0),
      roomRate: z.number().min(0),
      specialRequests: z.string().optional(),
      notes: z.string().optional(),
    });

    const rawBookingData = bookingSchema.parse(body);

    // Calculate total nights and amount server-side
    const checkInDate = new Date(rawBookingData.checkInDate);
    const checkOutDate = new Date(rawBookingData.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = totalNights * rawBookingData.roomRate;

    if (totalNights <= 0) {
      return NextResponse.json(
        { error: "تاریخ خروج باید بعد از تاریخ ورود باشد" },
        { status: 400 }
      );
    }

    // Combine raw data with calculated fields
    const bookingData = {
      ...rawBookingData,
      totalNights,
      totalAmount,
    };

    // Generate booking number
    const bookingNumber = `BKG-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // Check room availability
    const conflictingBooking = await Booking.findOne({
      room: bookingData.roomId,
      status: { $in: ["confirmed", "checked_in"] },
      $or: [
        {
          checkInDate: { $lt: new Date(bookingData.checkOutDate) },
          checkOutDate: { $gt: new Date(bookingData.checkInDate) },
        },
      ],
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "اتاق در تاریخ‌های انتخاب شده در دسترس نیست" },
        { status: 400 }
      );
    }

    // Create new booking
    const newBooking = new Booking({
      bookingNumber,
      guest: bookingData.guestId,
      room: bookingData.roomId,
      checkInDate: new Date(bookingData.checkInDate),
      checkOutDate: new Date(bookingData.checkOutDate),
      adults: bookingData.adults,
      children: bookingData.children,
      infants: bookingData.infants,
      totalNights: bookingData.totalNights,
      roomRate: bookingData.roomRate,
      totalAmount: bookingData.totalAmount,
      paidAmount: 0,
      outstandingAmount: bookingData.totalAmount,
      status: "pending",
      paymentStatus: "pending",
      specialRequests: bookingData.specialRequests,
      notes: bookingData.notes,
      createdBy: userId,
    });

    await newBooking.save();

    // Populate the created booking for response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate({
        path: "guest",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor",
      })
      .populate({
        path: "room.roomType",
        model: "RoomType",
        select: "name",
      })
      .lean();

    const transformedBooking = transformBookingToResponse(populatedBooking);

    return NextResponse.json(
      {
        data: transformedBooking,
        message: "رزرو با موفقیت ایجاد شد",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
