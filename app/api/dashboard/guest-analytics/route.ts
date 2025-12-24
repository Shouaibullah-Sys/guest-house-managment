import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Booking } from "@/models/Booking";
import { IBooking } from "@/models/types";

// Guest analytics API endpoint
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

    // Set default date range to all time if not provided
    const from = fromParam ? new Date(fromParam) : new Date("2020-01-01");
    const to = toParam ? new Date(toParam) : new Date();

    // Get total guests count
    const totalGuests = await User.countDocuments({ role: "guest" });

    // Get new guests (guests who joined in the date range)
    const newGuests = await User.countDocuments({
      role: "guest",
      createdAt: { $gte: from, $lte: to },
    });

    // Get all bookings to calculate returning guests and average stay
    const allBookings = (await Booking.find().lean()) as (IBooking & {
      _id: any;
      __v: number;
    })[];

    // Calculate guest booking counts
    const guestBookingCounts = new Map<string, number>();
    const guestStays = new Map<string, number[]>();

    allBookings.forEach((booking) => {
      // Safety check for required properties
      if (
        !booking.guest ||
        !booking.bookingNumber ||
        !booking.checkInDate ||
        !booking.checkOutDate
      ) {
        console.warn(`Missing required properties for booking:`, {
          hasGuest: !!booking.guest,
          bookingNumber: booking.bookingNumber,
          hasCheckIn: !!booking.checkInDate,
          hasCheckOut: !!booking.checkOutDate,
        });
        return;
      }

      const guestId = booking.guest?.toString() || "";

      // Skip invalid guest IDs
      if (!guestId || guestId === "undefined" || guestId === "null") {
        console.warn(
          `Invalid guest ID for booking ${booking.bookingNumber}:`,
          booking.guest
        );
        return;
      }

      // Count bookings per guest
      guestBookingCounts.set(
        guestId,
        (guestBookingCounts.get(guestId) || 0) + 1
      );

      // Calculate stay duration for this booking
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);

      // Validate dates to prevent invalid calculations
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        console.warn(
          `Invalid check-in/out dates for booking ${booking.bookingNumber}:`,
          {
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
          }
        );
        return;
      }

      const stayDuration = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Ensure stay duration is positive and reasonable (not more than 365 days)
      if (stayDuration <= 0 || stayDuration > 365) {
        console.warn(
          `Invalid stay duration (${stayDuration}) for booking ${booking.bookingNumber}`
        );
        return;
      }

      // Add to guest's total stays
      const currentStays = guestStays.get(guestId) || [];
      currentStays.push(stayDuration);
      guestStays.set(guestId, currentStays);
    });

    // Calculate returning guests (guests with more than 1 booking)
    const returningGuests = Array.from(guestBookingCounts.values()).filter(
      (count: number) => count > 1
    ).length;

    // Calculate average stay duration
    let totalStayDuration = 0;
    let totalStayCount = 0;

    guestStays.forEach((stays: number[]) => {
      for (const stay of stays) {
        totalStayDuration += stay;
        totalStayCount++;
      }
    });

    const averageStay =
      totalStayCount > 0 ? totalStayDuration / totalStayCount : 0;

    // For guest satisfaction, we'll use a default value since it's not in the current model
    // In a real implementation, you might have a reviews/ratings system
    const guestSatisfaction = 4.2; // Default satisfaction score out of 5

    // Additional validation and edge case handling
    if (totalStayCount === 0) {
      console.warn("No valid stay durations found in booking data");
    }

    // Validate analytics data
    const analytics = {
      totalGuests: Math.max(0, totalGuests || 0),
      newGuests: Math.max(0, newGuests || 0),
      returningGuests: Math.max(0, returningGuests || 0),
      averageStay:
        Number.isFinite(averageStay) && averageStay >= 0
          ? Math.round(averageStay * 10) / 10
          : 0, // Round to 1 decimal place
      guestSatisfaction: Math.max(0, Math.min(5, guestSatisfaction)), // Clamp between 0-5
    };

    // Log analytics summary for debugging
    console.log("Guest Analytics Summary:", {
      totalGuests: analytics.totalGuests,
      newGuests: analytics.newGuests,
      returningGuests: analytics.returningGuests,
      averageStay: analytics.averageStay,
      guestSatisfaction: analytics.guestSatisfaction,
      bookingsProcessed: allBookings.length,
      validStays: totalStayCount,
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching guest analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest analytics" },
      { status: 500 }
    );
  }
}
