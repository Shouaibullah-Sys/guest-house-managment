// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";
import { z } from "zod";
import mongoose from "mongoose";

// Import the utility function
import { findOrCreateUser } from "@/lib/user-utils";

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

    // Build filter using aggregation pipeline for better search
    const pipeline: any[] = [];

    // If we have a search term, use aggregation to search in guest name
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      pipeline.push({
        $lookup: {
          from: "users", // Collection name in MongoDB
          localField: "guest",
          foreignField: "_id",
          as: "guestData",
        },
      });

      pipeline.push({
        $match: {
          $or: [
            { bookingNumber: searchRegex },
            { "guestData.name": searchRegex }, // Search in guest name
            { "guestData.email": searchRegex }, // Search in guest email
            { "guestData.phone": searchRegex }, // Search in guest phone
          ],
        },
      });
    } else {
      // If no search, just match all
      pipeline.push({ $match: {} });
    }

    // Apply status filter
    if (query.status && query.status !== "all") {
      const matchStage = { $match: { status: query.status } };
      if (query.search) {
        // If we already have a $match stage from search, add to it
        const existingMatch = pipeline.find((stage) => stage.$match);
        if (existingMatch) {
          existingMatch.$match.status = query.status;
        } else {
          pipeline.push(matchStage);
        }
      } else {
        pipeline.push(matchStage);
      }
    }

    // Apply payment status filter
    if (query.paymentStatus && query.paymentStatus !== "all") {
      const matchStage = { $match: { paymentStatus: query.paymentStatus } };
      if (query.search) {
        const existingMatch = pipeline.find((stage) => stage.$match);
        if (existingMatch) {
          existingMatch.$match.paymentStatus = query.paymentStatus;
        } else {
          pipeline.push(matchStage);
        }
      } else {
        pipeline.push(matchStage);
      }
    }

    // Apply date range filter
    if (query.dateRange && query.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let dateFilter: any = {};

      switch (query.dateRange) {
        case "today":
          dateFilter = {
            checkInDate: {
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          };
          break;
        case "tomorrow":
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          dateFilter = {
            checkInDate: {
              $gte: tomorrow,
              $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
            },
          };
          break;
        case "this_week":
          const startOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay())
          );
          const endOfWeek = new Date(
            today.setDate(today.getDate() - today.getDay() + 6)
          );
          dateFilter = { checkInDate: { $gte: startOfWeek, $lte: endOfWeek } };
          break;
        case "next_week":
          const nextWeekStart = new Date(
            today.setDate(today.getDate() - today.getDay() + 7)
          );
          const nextWeekEnd = new Date(
            today.setDate(today.getDate() - today.getDay() + 13)
          );
          dateFilter = {
            checkInDate: { $gte: nextWeekStart, $lte: nextWeekEnd },
          };
          break;
        case "this_month":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          dateFilter = {
            checkInDate: { $gte: startOfMonth, $lte: endOfMonth },
          };
          break;
      }

      const matchStage = { $match: dateFilter };
      const existingMatch = pipeline.find((stage) => stage.$match);
      if (existingMatch) {
        Object.assign(existingMatch.$match, dateFilter);
      } else {
        pipeline.push(matchStage);
      }
    }

    // Count total matching documents
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Booking.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10")));
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Add pagination and population
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Add population stages
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "guest",
        foreignField: "_id",
        as: "guest",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$guest",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "rooms",
        localField: "room",
        foreignField: "_id",
        as: "room",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$room",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "roomtypes",
        localField: "room.roomType",
        foreignField: "_id",
        as: "room.roomType",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$room.roomType",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $sort: { createdAt: -1 },
    });

    // Execute aggregation
    const bookings = await Booking.aggregate(pipeline);

    // Transform to frontend format
    // Reuse the convertToNumber helper from transformBookingToResponse
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

    const transformedBookings: BookingResponse[] = bookings.map((booking) => ({
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      guestId: booking.guest?._id?.toString() || "",
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
    }));

    // Calculate statistics (simpler version for now)
    const statsPipeline = [];

    // Add the same filters for stats
    if (query.search) {
      statsPipeline.push({
        $lookup: {
          from: "users",
          localField: "guest",
          foreignField: "_id",
          as: "guestData",
        },
      });

      statsPipeline.push({
        $match: {
          $or: [
            { bookingNumber: new RegExp(query.search, "i") },
            { "guestData.name": new RegExp(query.search, "i") },
          ],
        },
      });
    }

    // Add other filters to stats
    if (query.status && query.status !== "all") {
      statsPipeline.push({ $match: { status: query.status } });
    }

    if (query.paymentStatus && query.paymentStatus !== "all") {
      statsPipeline.push({ $match: { paymentStatus: query.paymentStatus } });
    }

    // Add aggregation for stats
    statsPipeline.push({
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
    });

    const stats = await Booking.aggregate(statsPipeline);

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
    console.log("📝 Booking creation request received");

    const { userId } = await auth();
    if (!userId) {
      console.log("❌ Unauthorized: No user ID found");
      return createErrorResponse("Unauthorized", 401);
    }

    console.log(`👤 Authenticated user ID: ${userId}`);

    await dbConnect();

    // Ensure all models are registered with Mongoose
    if (!mongoose.models.User) {
      await import("@/models/User");
    }

    if (!mongoose.models.Room) {
      await import("@/models/Room");
    }

    if (!mongoose.models.RoomType) {
      await import("@/models/RoomType");
    }

    const body = await request.json();
    console.log("📦 Request body received:", JSON.stringify(body, null, 2));

    // First, find or create the user in the database
    console.log(`🔍 Finding or creating user: ${userId}`);
    const user = await findOrCreateUser(userId);
    console.log(`✅ User resolved: ${user.name} (${user._id})`);

    // Basic booking validation
    const bookingSchema = z.object({
      room: z.string(), // Room ID
      checkInDate: z.string(),
      checkOutDate: z.string(),
      adults: z.number().min(1),
      children: z.number().min(0).default(0),
      infants: z.number().min(0).default(0),
      totalNights: z.number().min(1).optional(),
      roomRate: z.number().min(0),
      totalAmount: z.number().min(0).optional(),
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
      console.log("❌ Invalid dates: check-out must be after check-in");
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

    console.log(`📅 Booking details: ${totalNights} nights, $${totalAmount}`);

    // Generate booking number
    const bookingNumber = `BKG-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    console.log(`🎫 Generated booking number: ${bookingNumber}`);

    // Check room availability
    console.log(`🔍 Checking availability for room: ${bookingData.room}`);
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
      console.log("❌ Room not available for selected dates");
      return createErrorResponse(
        "Room is not available for the selected dates",
        400
      );
    }

    console.log("✅ Room is available, creating booking...");

    // Create new booking with the database user ID
    const newBooking = new Booking({
      bookingNumber,
      guest: user._id, // Use the database user ID from findOrCreateUser
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
      specialRequests: bookingData.specialRequests || "",
      notes: bookingData.notes || "",
      createdBy: userId,
    });

    await newBooking.save();
    console.log(`✅ Booking created successfully: ${newBooking._id}`);

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
      console.log("❌ Failed to retrieve created booking");
      return createErrorResponse("Failed to retrieve created booking", 500);
    }

    const transformedBooking = transformBookingToResponse(populatedBooking);

    console.log("🎉 Booking creation completed successfully");

    return createSuccessResponse(transformedBooking, {
      status: 201,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("💥 Error creating booking:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.message);
      return createErrorResponse("Invalid booking data: " + error.message, 400);
    }

    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Mongoose validation error:", error.message);
      return createErrorResponse(
        "Database validation error: " + error.message,
        400
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      console.error("Mongoose cast error:", error.message);
      return createErrorResponse("Invalid data format: " + error.message, 400);
    }

    return createErrorResponse(
      error instanceof Error
        ? `Failed to create booking: ${error.message}`
        : "Failed to create booking"
    );
  }
}
