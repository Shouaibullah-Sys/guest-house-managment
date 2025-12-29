// app/api/bookings/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Transform Booking document to CSV format
function transformBookingToCSV(booking: any) {
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
    bookingNumber: booking.bookingNumber,
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
    source: booking.source || "",
    specialRequests: booking.specialRequests || "",
    notes: booking.notes || "",
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

// Convert array of objects to CSV string
function arrayToCSV(data: any[]): string {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

// GET /api/bookings/export - Export bookings to CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const dateRange = searchParams.get("dateRange") || "";

    // Build filter (same as in main bookings endpoint)
    const filter: any = {};

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ bookingNumber: searchRegex }, { guest: searchRegex }];
    }

    // Apply status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Apply payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }

    // Apply date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateRange) {
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

    // Get all bookings (no pagination for export)
    const bookings = await Booking.find(filter)
      .populate({
        path: "guest",
        model: "User",
        select: "name email phone",
      })
      .populate({
        path: "room",
        model: "Room",
        select: "roomNumber floor roomType",
        populate: {
          path: "roomType",
          model: "RoomType",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform to CSV format
    const csvData = bookings.map((booking: any) =>
      transformBookingToCSV(booking)
    );

    // Convert to CSV
    const csvContent = arrayToCSV(csvData);

    // Create response with CSV headers
    const response = new NextResponse(csvContent);
    response.headers.set("Content-Type", "text/csv; charset=utf-8");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="bookings-export-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );

    return response;
  } catch (error) {
    console.error("Error exporting bookings:", error);
    return NextResponse.json(
      { error: "Failed to export bookings" },
      { status: 500 }
    );
  }
}
