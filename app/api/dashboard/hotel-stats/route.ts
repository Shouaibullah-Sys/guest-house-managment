import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { Room } from "@/models/Room";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

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

// Hotel statistics API endpoint
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Set default date range to current month if not provided
    const now = new Date();
    const from = fromParam ? new Date(fromParam) : startOfMonth(now);
    const to = toParam ? new Date(toParam) : now;
    const today = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get total rooms count
    const totalRooms = await Room.countDocuments();

    // Get occupied rooms (rooms with confirmed or checked_in bookings that overlap today)
    const occupiedRooms = await Booking.countDocuments({
      status: { $in: ["confirmed", "checked_in"] },
      $or: [
        { checkInDate: { $lte: today }, checkOutDate: { $gt: today } },
        { checkInDate: { $lte: todayEnd }, checkOutDate: { $gt: todayEnd } },
      ],
    });

    // Calculate available rooms
    const availableRooms = totalRooms - occupiedRooms;

    // Calculate occupancy rate
    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get total bookings count
    const totalBookings = await Booking.countDocuments();

    // Get total unique guests
    const totalGuests = await User.countDocuments({ role: "guest" });

    // Calculate revenue metrics
    const bookingsInDateRange = await Booking.find({
      createdAt: { $gte: from, $lte: to },
    });

    const bookingsThisMonth = await Booking.find({
      createdAt: { $gte: monthStart, $lte: monthEnd },
    });

    const bookingsToday = await Booking.find({
      createdAt: { $gte: today, $lte: todayEnd },
    });

    // Calculate total revenue from all bookings
    const totalRevenue = bookingsInDateRange.reduce((sum, booking) => {
      return sum + convertToNumber(booking.totalAmount);
    }, 0);

    // Calculate today's revenue
    const todayRevenue = bookingsToday.reduce((sum, booking) => {
      return sum + convertToNumber(booking.totalAmount);
    }, 0);

    // Calculate this month's revenue
    const monthlyRevenue = bookingsThisMonth.reduce((sum, booking) => {
      return sum + convertToNumber(booking.totalAmount);
    }, 0);

    // Calculate average room rate from occupied rooms
    const averageRoomRate =
      occupiedRooms > 0
        ? bookingsThisMonth.reduce(
            (sum, booking) => sum + convertToNumber(booking.roomRate),
            0
          ) / bookingsThisMonth.length
        : 0;

    // Get check-ins today
    const checkInsToday = await Booking.countDocuments({
      actualCheckIn: { $gte: today, $lte: todayEnd },
    });

    // Get check-outs today
    const checkOutsToday = await Booking.countDocuments({
      actualCheckOut: { $gte: today, $lte: todayEnd },
    });

    // Get pending bookings
    const pendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      totalBookings,
      totalGuests,
      occupiedRooms,
      availableRooms,
      totalRooms,
      occupancyRate: Math.round(occupancyRate * 10) / 10, // Round to 1 decimal place
      todayRevenue: Math.round(todayRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      averageRoomRate: Math.round(averageRoomRate),
      checkInsToday,
      checkOutsToday,
      pendingBookings,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotel statistics" },
      { status: 500 }
    );
  }
}
