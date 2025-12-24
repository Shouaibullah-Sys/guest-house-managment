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
      const guestId =
        typeof booking.guest === "string"
          ? booking.guest
          : booking.guest.toString();

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
          `Invalid check-in/out dates for booking ${booking.bookingNumber}`
        );
        return;
      }

      const stayDuration = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Ensure stay duration is positive
      if (stayDuration <= 0) {
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

    // Ensure we have valid analytics data
    const analytics = {
      totalGuests,
      newGuests,
      returningGuests,
      averageStay: Number.isFinite(averageStay)
        ? Math.round(averageStay * 10) / 10
        : 0, // Round to 1 decimal place
      guestSatisfaction,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching guest analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest analytics" },
      { status: 500 }
    );
  }
}
