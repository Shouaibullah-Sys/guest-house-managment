// app/api/payments/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import dbConnect from "@/lib/db";

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

    // Find all unpaid bookings for this customer
    const unpaidBookings = await Booking.find({
      outstandingAmount: { $gt: 0 },
    })
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

    // Filter bookings by customer name after population
    const customerUnpaidBookings = unpaidBookings.filter((booking: any) => {
      const guestName = booking.guest?.name || booking.guest || "";
      return guestName.toLowerCase().includes(normalizedName.toLowerCase());
    });

    if (customerUnpaidBookings.length === 0) {
      return NextResponse.json(
        { success: false, error: "No unpaid bookings found for this customer" },
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
