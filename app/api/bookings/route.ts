// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";
import { z } from "zod";
import mongoose from "mongoose";

// Types for better type safety
type BookingResponse = {
  id: string;
  bookingNumber: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  adults: number;
  children: number;
  infants: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  paymentStatus: string;
  specialRequests: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    totalBookings: number;
    confirmedBookings: number;
    checkedInBookings: number;
    revenue: number;
    avgBookingValue: number;
  };
};

// Search query validation
const searchQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  dateRange: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Transform Booking document to frontend format with proper typing
function transformBookingToResponse(booking: any): BookingResponse {
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

// Helper function for consistent error responses
function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

// Helper function for consistent success responses
function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    message?: string;
    pagination?: ApiResponse<T>["pagination"];
    stats?: ApiResponse<T>["stats"];
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = { data };

  if (options?.message) response.message = options.message;
  if (options?.pagination) response.pagination = options.pagination;
  if (options?.stats) response.stats = options.stats;

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: {
      "Cache-Control": "private, max-age=60", // Cache for 1 minute
      ...options?.headers,
    },
  });
}

// GET /api/bookings - List bookings with search and filtering
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BookingResponse[]>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    await dbConnect();

    // Ensure User model is registered with Mongoose
    if (!mongoose.models.User) {
      await import("@/models/User");
    }

    // Ensure Room model is registered with Mongoose
    if (!mongoose.models.Room) {
      await import("@/models/Room");
    }

    // Ensure RoomType model is registered with Mongoose
    if (!mongoose.models.RoomType) {
      await import("@/models/RoomType");
    }

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
    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10")));
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
        options: { lean: true },
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor roomType",
        options: { lean: true },
        populate: {
          path: "roomType",
          model: "RoomType",
          select: "name",
          options: { lean: true },
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to frontend format
    const transformedBookings: BookingResponse[] = bookings.map(
      transformBookingToResponse
    );

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

    return createSuccessResponse(transformedBookings, {
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
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse("Failed to fetch bookings");
  }
}

// POST /api/bookings - Create a new booking
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BookingResponse>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    await dbConnect();

    // Ensure User model is registered with Mongoose
    if (!mongoose.models.User) {
      await import("@/models/User");
    }

    // Ensure Room model is registered with Mongoose
    if (!mongoose.models.Room) {
      await import("@/models/Room");
    }

    // Ensure RoomType model is registered with Mongoose
    if (!mongoose.models.RoomType) {
      await import("@/models/RoomType");
    }

    const body = await request.json();

    // Basic booking validation (excluding calculated fields)
    const bookingSchema = z.object({
      guest: z.string(), // Clerk user ID or guest ID
      room: z.string(), // Room ID
      checkInDate: z.string(),
      checkOutDate: z.string(),
      adults: z.number().min(1),
      children: z.number().min(0).default(0),
      infants: z.number().min(0).default(0),
      totalNights: z.number().min(1).optional(), // Will be calculated if not provided
      roomRate: z.number().min(0),
      totalAmount: z.number().min(0).optional(), // Will be calculated if not provided
      status: z.string().optional(),
      source: z.string().optional(),
      specialRequests: z.string().optional(),
      notes: z.string().optional(),
    });

    const rawBookingData = bookingSchema.parse(body);

    // Calculate total nights and amount server-side if not provided
    const checkInDate = new Date(rawBookingData.checkInDate);
    const checkOutDate = new Date(rawBookingData.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights =
      rawBookingData.totalNights || Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount =
      rawBookingData.totalAmount || totalNights * rawBookingData.roomRate;

    if (totalNights <= 0) {
      return createErrorResponse(
        "Check-out date must be after check-in date",
        400
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
      room: bookingData.room,
      status: { $in: ["confirmed", "checked_in"] },
      $or: [
        {
          checkInDate: { $lt: new Date(bookingData.checkOutDate) },
          checkOutDate: { $gt: new Date(bookingData.checkInDate) },
        },
      ],
    });

    if (conflictingBooking) {
      return createErrorResponse(
        "Room is not available for the selected dates",
        400
      );
    }

    // Create new booking
    const newBooking = new Booking({
      bookingNumber,
      guest: bookingData.guest,
      room: bookingData.room,
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
      status: bookingData.status || "pending",
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
        options: { lean: true },
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor roomType",
        options: { lean: true },
        populate: {
          path: "roomType",
          model: "RoomType",
          select: "name",
          options: { lean: true },
        },
      })
      .lean();

    if (!populatedBooking) {
      return createErrorResponse("Failed to retrieve created booking", 500);
    }

    const transformedBooking = transformBookingToResponse(populatedBooking);

    return createSuccessResponse(transformedBooking, {
      status: 201,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse("Failed to create booking");
  }
}
