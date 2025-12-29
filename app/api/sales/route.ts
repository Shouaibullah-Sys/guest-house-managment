// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import dbConnect from "@/lib/db";

// Ensure models are registered with mongoose
const _User = User;
const _Room = Room;
import { startOfToday, startOfWeek, startOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const period = searchParams.get("period") || "today";

    // Build filter query
    const filter: any = {};

    // Date filtering
    let dateFilter: any = {};
    if (period && period !== "lifetime") {
      const now = new Date();
      switch (period) {
        case "today":
          dateFilter = { $gte: startOfToday() };
          break;
        case "week":
          dateFilter = { $gte: startOfWeek(now) };
          break;
        case "month":
          dateFilter = { $gte: startOfMonth(now) };
          break;
      }
    }

    // Custom date range
    if (fromDate || toDate) {
      dateFilter = {};
      if (fromDate) {
        dateFilter.$gte = new Date(fromDate);
      }
      if (toDate) {
        dateFilter.$lte = new Date(toDate + "T23:59:59.999Z");
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.checkInDate = dateFilter;
    }

    // Text search
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { bookingNumber: searchRegex },
        { "guest.name": searchRegex },
        { guest: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch bookings with populated data
    const bookings = await Booking.find(filter)
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
      .populate({
        path: "createdBy",
        model: "User",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform booking data to match SaleRecord interface
    // Expand each booking into daily records
    const sales: any[] = [];

    bookings.forEach((booking: any) => {
      const totalNights = booking.totalNights || 1;
      const dailyAmount = Number(booking.totalAmount) / totalNights;
      const dailyPaid = Number(booking.paidAmount || 0) / totalNights;
      const dailyOutstanding =
        Number(booking.outstandingAmount || 0) / totalNights;

      // Create a record for each night
      for (let day = 0; day < totalNights; day++) {
        const dailyDate = new Date(booking.checkInDate);
        dailyDate.setDate(dailyDate.getDate() + day);

        sales.push({
          id: `${booking._id.toString()}-day-${day + 1}`,
          bookingId: booking._id.toString(),
          customerName: booking.guest?.name || booking.guest || "Unknown Guest",
          normalizedName: (
            booking.guest?.name ||
            booking.guest ||
            "Unknown Guest"
          )
            .trim()
            .toLowerCase(),
          totalAmount: dailyAmount.toString(),
          paidAmount: dailyPaid.toString(),
          outstanding: dailyOutstanding.toString(),
          isFullyPaid: Number(booking.outstandingAmount || 0) <= 0,
          issueDate: dailyDate.toISOString(),
          quantity: 1, // Each row represents one night
          issuedBy: booking.createdBy?.name || booking.createdBy || "System",
          partNumber: booking.room?.roomNumber || booking.bookingNumber,
          partName: `Room ${booking.room?.roomNumber || "Unknown"}`,
          itemCount: 1,
          status: booking.status === "confirmed" ? "completed" : "pending",
          dayOfStay: day + 1,
          totalNights: totalNights,
        });
      }
    });

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Calculate summary statistics
    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $toDouble: "$totalAmount" } },
          totalPaid: { $sum: { $toDouble: "$paidAmount" } },
          totalOutstanding: { $sum: { $toDouble: "$outstandingAmount" } },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const summary = stats[0] || {
      totalSales: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      totalRecords: 0,
    };

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      roomRate,
      specialRequests,
      notes,
    } = body;

    // Validate required fields
    if (!guestId || !roomId || !checkInDate || !checkOutDate || !roomRate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total nights and amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = totalNights * parseFloat(roomRate);

    if (totalNights <= 0) {
      return NextResponse.json(
        { success: false, error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    // Generate booking number
    const bookingNumber = `BKG-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // Create new booking
    const booking = new Booking({
      bookingNumber,
      guest: guestId,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children,
      totalNights,
      roomRate: parseFloat(roomRate),
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      status: "pending",
      paymentStatus: "pending",
      specialRequests,
      notes,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        totalAmount: booking.totalAmount.toString(),
        status: booking.status,
      },
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
