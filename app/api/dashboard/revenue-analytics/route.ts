import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Room } from "@/models/Room";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
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

// Revenue analytics API endpoint
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

    // Calculate date ranges for monthly comparison
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    // Get all bookings in the date range
    const bookingsInRange = await Booking.find({
      createdAt: { $gte: from, $lte: to },
    }).lean();

    // Get current month bookings
    const currentMonthBookings = await Booking.find({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    }).lean();

    // Get previous month bookings
    const previousMonthBookings = await Booking.find({
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    }).lean();

    // Calculate revenue metrics
    let totalRevenue = 0;
    let roomRevenue = 0;
    let serviceRevenue = 0;
    let totalRoomNights = 0;

    bookingsInRange.forEach((booking) => {
      const totalAmount = convertToNumber(booking.totalAmount);
      const roomRate = convertToNumber(booking.roomRate);
      const extraCharges = convertToNumber(booking.extraCharges);

      totalRevenue += totalAmount;
      roomRevenue += roomRate;
      serviceRevenue += extraCharges;
      totalRoomNights += booking.totalNights || 1;
    });

    // Calculate average daily rate
    const avgDailyRate =
      totalRoomNights > 0 ? roomRevenue / totalRoomNights : 0;

    // Calculate RevPAR (Revenue Per Available Room)
    const totalRooms = await Room.countDocuments();
    const daysInRange =
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const availableRoomNights = totalRooms * daysInRange;
    const revPAR =
      availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0;

    // Calculate monthly comparison
    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => {
      return sum + convertToNumber(booking.totalAmount);
    }, 0);

    const previousMonthRevenue = previousMonthBookings.reduce(
      (sum, booking) => {
        return sum + convertToNumber(booking.totalAmount);
      },
      0
    );

    const percentageChange =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : 0;

    // Calculate revenue by source (based on booking source if available)
    const revenueBySourceMap = new Map();

    bookingsInRange.forEach((booking) => {
      const source = booking.source || "Direct Booking";
      const amount = convertToNumber(booking.totalAmount);

      revenueBySourceMap.set(
        source,
        (revenueBySourceMap.get(source) || 0) + amount
      );
    });

    // Convert to array and calculate percentages
    const revenueBySource = Array.from(revenueBySourceMap.entries()).map(
      ([source, amount]) => ({
        source,
        amount: Math.round(amount),
        percentage:
          totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      })
    );

    // Sort by amount descending
    revenueBySource.sort((a, b) => b.amount - a.amount);

    const analytics = {
      totalRevenue: Math.round(totalRevenue),
      roomRevenue: Math.round(roomRevenue),
      serviceRevenue: Math.round(serviceRevenue),
      avgDailyRate: Math.round(avgDailyRate),
      revPAR: Math.round(revPAR),
      monthlyComparison: {
        current: Math.round(currentMonthRevenue),
        previous: Math.round(previousMonthRevenue),
        percentageChange: Math.round(percentageChange * 10) / 10,
      },
      revenueBySource,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
