// app/api/payments/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import dbConnect from "@/lib/db";
import { startOfToday, startOfWeek, startOfMonth } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { customerName, normalizedName, totalAmount, note, receivedBy } =
      body;

    // Validate required fields
    if (!normalizedName || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Customer name and amount are required" },
        { status: 400 }
      );
    }

    const paymentAmount = parseFloat(totalAmount);
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Build filter to match the sales API logic
    const filter: any = {
      outstandingAmount: { $gt: 0 },
    };

    // For bulk payments, we want to find ALL unpaid bookings for the customer
    // regardless of date, so we don't apply date filters here
    // The sales interface shows the filtered view, but bulk payment should
    // work on all unpaid bookings for that customer

    // Remove the date filter to get all unpaid bookings for the customer

    // Find unpaid bookings with proper filtering
    const unpaidBookings = await Booking.find(filter)
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
      .sort({ checkInDate: 1 }) // Oldest first
      .lean();

    console.log(`Found ${unpaidBookings.length} unpaid bookings in date range`);

    // Filter bookings by exact customer name match
    const customerUnpaidBookings = unpaidBookings.filter((booking: any) => {
      const guestName = booking.guest?.name || booking.guest || "";
      const normalizedGuestName = guestName.trim().toLowerCase();

      // Use exact match for customer name
      return normalizedGuestName === normalizedName.toLowerCase();
    });

    console.log(
      `Found ${customerUnpaidBookings.length} unpaid bookings for customer: ${customerName}`
    );

    if (customerUnpaidBookings.length === 0) {
      // Provide more helpful error message
      const availableCustomers = [
        ...new Set(
          unpaidBookings
            .map((booking: any) => booking.guest?.name || booking.guest)
            .filter(Boolean)
        ),
      ];

      return NextResponse.json(
        {
          success: false,
          error: `No unpaid bookings found for customer: ${customerName}`,
          availableCustomers: availableCustomers.slice(0, 10), // Show first 10 customers
          totalUnpaidBookings: unpaidBookings.length,
        },
        { status: 404 }
      );
    }

    let remainingAmount = paymentAmount;
    const processedPayments = [];
    let totalProcessed = 0;

    // Process payments in order
    for (const booking of customerUnpaidBookings) {
      if (remainingAmount <= 0) break;

      const currentOutstanding = parseFloat(
        booking.outstandingAmount?.toString() ||
          booking.totalAmount?.toString() ||
          "0"
      );
      const paymentForThisBooking = Math.min(
        remainingAmount,
        currentOutstanding
      );

      if (paymentForThisBooking > 0) {
        const customerName =
          booking.guest?.name || booking.guest || "Unknown Guest";

        // Create payment record
        const payment = new Payment({
          saleId: (booking as any)._id.toString(),
          customerName,
          normalizedName: normalizedName,
          amount: paymentForThisBooking,
          note: note ? `${note} (Bulk payment)` : "Bulk payment",
          receivedBy,
          paymentMethod: "cash",
          status: "completed",
        });

        await payment.save();

        // Update booking
        const newPaidAmount =
          parseFloat(booking.paidAmount?.toString() || "0") +
          paymentForThisBooking;
        const newOutstanding =
          parseFloat(booking.totalAmount?.toString() || "0") - newPaidAmount;

        // Update booking in database
        await Booking.findByIdAndUpdate(booking._id, {
          paidAmount: newPaidAmount,
          outstandingAmount: Math.max(0, newOutstanding),
          paymentStatus: newOutstanding <= 0 ? "paid" : "partial",
          status:
            newOutstanding <= 0 && booking.status === "pending"
              ? "confirmed"
              : booking.status,
        });

        processedPayments.push({
          saleId: (booking as any)._id.toString(),
          partName: `Room ${booking.room?.roomNumber || "Unknown"}`,
          amount: paymentForThisBooking,
        });

        remainingAmount -= paymentForThisBooking;
        totalProcessed += paymentForThisBooking;
      }
    }

    return NextResponse.json({
      success: true,
      processedPayments,
      totalAmount: totalProcessed,
      remainingAmount: Math.max(0, remainingAmount),
      paymentsProcessed: processedPayments.length,
      message: `Successfully processed ${processedPayments.length} payments`,
    });
  } catch (error) {
    console.error("Error processing bulk payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process bulk payment" },
      { status: 500 }
    );
  }
}
