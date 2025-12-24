import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
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

// Booking trends API endpoint
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

    // Set default date range to last 7 days if not provided
    const now = new Date();
    const from = fromParam ? new Date(fromParam) : subDays(now, 7);
    const to = toParam ? new Date(toParam) : now;

    // Generate array of all dates in the range
    const dateRange = eachDayOfInterval({
      start: startOfDay(from),
      end: endOfDay(to),
    });

    // Get all bookings in the date range
    const bookings = await Booking.find({
      createdAt: { $gte: startOfDay(from), $lte: endOfDay(to) },
    }).lean();

    // Initialize trends data for each date
    const trends = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return {
        date: dateStr,
        bookings: 0,
        revenue: 0,
        checkIns: 0,
        checkOuts: 0,
      };
    });

    // Process bookings and populate trends
    bookings.forEach((booking) => {
      const bookingDate = startOfDay(booking.createdAt);
      const dateStr = format(bookingDate, "yyyy-MM-dd");

      // Find the corresponding trend entry
      const trendIndex = trends.findIndex((trend) => trend.date === dateStr);

      if (trendIndex !== -1) {
        // Count booking
        trends[trendIndex].bookings += 1;

        // Add revenue
        trends[trendIndex].revenue += convertToNumber(booking.totalAmount);

        // Count check-ins for this day
        if (booking.actualCheckIn) {
          const checkInDate = startOfDay(booking.actualCheckIn);
          const checkInDateStr = format(checkInDate, "yyyy-MM-dd");
          const checkInIndex = trends.findIndex(
            (trend) => trend.date === checkInDateStr
          );
          if (checkInIndex !== -1) {
            trends[checkInIndex].checkIns += 1;
          }
        }

        // Count check-outs for this day
        if (booking.actualCheckOut) {
          const checkOutDate = startOfDay(booking.actualCheckOut);
          const checkOutDateStr = format(checkOutDate, "yyyy-MM-dd");
          const checkOutIndex = trends.findIndex(
            (trend) => trend.date === checkOutDateStr
          );
          if (checkOutIndex !== -1) {
            trends[checkOutIndex].checkOuts += 1;
          }
        }
      }
    });

    // Round revenue values
    const trendsWithRoundedRevenue = trends.map((trend) => ({
      ...trend,
      revenue: Math.round(trend.revenue),
    }));

    return NextResponse.json(trendsWithRoundedRevenue);
  } catch (error) {
    console.error("Error fetching booking trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking trends" },
      { status: 500 }
    );
  }
}
