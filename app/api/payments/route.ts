// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { Payment } from "@/models/Payment";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { saleId, amount, note, receivedBy, dayOfStay } = body;

    // Validate required fields
    if (!saleId || !amount) {
      return NextResponse.json(
        { success: false, error: "Sale ID and amount are required" },
        { status: 400 }
      );
    }

    // Find the booking (saleId is actually bookingId from sales page)
    const booking = await Booking.findById(saleId).populate("guest");
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
    }

    // If dayOfStay is provided, process day-specific payment
    if (dayOfStay) {
      const dayIndex = dayOfStay - 1;
      const totalNights = booking.totalNights;

      if (dayOfStay < 1 || dayOfStay > totalNights) {
        return NextResponse.json(
          { success: false, error: "Invalid day of stay" },
          { status: 400 }
        );
      }

      // Initialize dailyPayments if not exists
      if (!booking.dailyPayments || booking.dailyPayments.length === 0) {
        const dailyAmount =
          parseFloat(booking.totalAmount.toString()) / totalNights;
        booking.dailyPayments = [];
        for (let i = 0; i < totalNights; i++) {
          booking.dailyPayments.push({
            dayOfStay: i + 1,
            amount: dailyAmount,
            paidAmount: 0,
            outstandingAmount: dailyAmount,
            isPaid: false,
          });
        }
      }

      const dailyPayment = booking.dailyPayments[dayIndex];
      if (!dailyPayment) {
        return NextResponse.json(
          { success: false, error: "Daily payment record not found" },
          { status: 404 }
        );
      }

      const currentOutstanding = parseFloat(
        dailyPayment.outstandingAmount.toString()
      );
      if (paymentAmount > currentOutstanding) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment amount exceeds outstanding balance for this day",
          },
          { status: 400 }
        );
      }

      // Update daily payment
      const newPaidAmount =
        parseFloat(dailyPayment.paidAmount.toString()) + paymentAmount;
      const newOutstanding =
        parseFloat(dailyPayment.amount.toString()) - newPaidAmount;

      dailyPayment.paidAmount = newPaidAmount;
      dailyPayment.outstandingAmount = Math.max(0, newOutstanding);
      dailyPayment.isPaid = newOutstanding <= 0;
      dailyPayment.paymentDate = new Date();
    } else {
      // Fallback to old logic for backward compatibility
      const currentOutstanding = parseFloat(
        booking.outstandingAmount?.toString() || booking.totalAmount.toString()
      );
      if (paymentAmount > currentOutstanding) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment amount exceeds outstanding balance",
          },
          { status: 400 }
        );
      }
    }

    // Get customer name from booking
    const customerName =
      booking.guest?.name || booking.guest || "Unknown Guest";
    const normalizedName = customerName.toLowerCase().trim();

    // Create payment record
    const payment = new Payment({
      saleId: booking._id.toString(),
      customerName,
      normalizedName,
      amount: paymentAmount,
      note,
      receivedBy,
      paymentMethod: "cash", // Default for now
      status: "completed",
      dayOfStay,
    });

    await payment.save();

    // Update booking payment status
    if (dayOfStay) {
      // Calculate totals from daily payments
      let totalPaid = 0;
      let totalOutstanding = 0;

      booking.dailyPayments.forEach((daily: any) => {
        totalPaid += parseFloat(daily.paidAmount.toString());
        totalOutstanding += parseFloat(daily.outstandingAmount.toString());
      });

      booking.paidAmount = totalPaid;
      booking.outstandingAmount = Math.max(0, totalOutstanding);
    } else {
      // Fallback to old logic
      const newPaidAmount =
        parseFloat(booking.paidAmount?.toString() || "0") + paymentAmount;
      const newOutstanding =
        parseFloat(booking.totalAmount?.toString() || "0") - newPaidAmount;

      booking.paidAmount = newPaidAmount;
      booking.outstandingAmount = Math.max(0, newOutstanding);
    }

    booking.paymentStatus =
      parseFloat(booking.outstandingAmount.toString()) <= 0
        ? "paid"
        : "partial";

    // Update status if fully paid
    if (
      parseFloat(booking.outstandingAmount.toString()) <= 0 &&
      booking.status === "pending"
    ) {
      booking.status = "confirmed";
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        payment,
        booking: {
          id: booking._id.toString(),
          paidAmount: booking.paidAmount,
          outstandingAmount: booking.outstandingAmount,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
          dailyPayments: booking.dailyPayments,
        },
      },
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
