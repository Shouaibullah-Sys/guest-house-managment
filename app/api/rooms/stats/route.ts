import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import { Booking } from "@/models/Booking";
import dbConnect from "@/lib/db";

// GET /api/rooms/stats - Get room statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get total rooms count
    const totalRooms = await Room.countDocuments();

    // Get rooms by status
    const availableRooms = await Room.countDocuments({ status: "available" });
    const occupiedRooms = await Room.countDocuments({ status: "occupied" });
    const reservedRooms = await Room.countDocuments({ status: "reserved" });
    const maintenanceRooms = await Room.countDocuments({
      status: "maintenance",
    });
    const cleaningRooms = await Room.countDocuments({ status: "cleaning" });

    // Calculate occupancy rate
    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get today's revenue from completed bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.find({
      status: "checked_out",
      actualCheckOut: { $gte: today, $lt: tomorrow },
    });

    const revenueToday = todayBookings.reduce((total, booking) => {
      const paidAmount = booking.paidAmount?.toString() || "0";
      return total + parseFloat(paidAmount);
    }, 0);

    // Get this month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthBookings = await Booking.find({
      status: "checked_out",
      actualCheckOut: { $gte: monthStart, $lte: monthEnd },
    });

    const revenueThisMonth = monthBookings.reduce((total, booking) => {
      const paidAmount = booking.paidAmount?.toString() || "0";
      return total + parseFloat(paidAmount);
    }, 0);

    // Get average rating from room types
    const roomTypes = await RoomType.find({ isActive: true });
    const averageRating =
      roomTypes.length > 0
        ? roomTypes.reduce((sum, rt) => sum + (rt.rating || 0), 0) /
          roomTypes.length
        : 0;

    // Get most popular room type
    const popularRoomType = await Booking.aggregate([
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "roomData",
        },
      },
      {
        $lookup: {
          from: "roomtypes",
          localField: "roomData.roomType",
          foreignField: "_id",
          as: "roomTypeData",
        },
      },
      {
        $group: {
          _id: "$roomData.roomType",
          count: { $sum: 1 },
          roomTypeName: { $first: "$roomTypeData.name" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const mostPopularType =
      popularRoomType.length > 0
        ? popularRoomType[0].roomTypeName?.[0] || "Standard"
        : "Standard";

    // VIP rooms count (simplified)
    const vipRoomsCount = await Room.countDocuments({
      status: { $in: ["available", "occupied"] },
    });

    const stats = {
      total: totalRooms,
      available: availableRooms,
      occupied: occupiedRooms,
      reserved: reservedRooms,
      maintenance: maintenanceRooms,
      cleaning: cleaningRooms,
      vip: vipRoomsCount,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      revenueToday,
      revenueThisMonth,
      averageRating: Math.round(averageRating * 10) / 10,
      mostPopularType,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching room stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch room statistics" },
      { status: 500 }
    );
  }
}
