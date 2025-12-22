// app/api/rooms/stats/route.ts
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
    const roomsByStatus = await Room.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize status counts
    const statusCounts = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
      cleaning: 0,
    };

    // Populate status counts
    roomsByStatus.forEach((item: any) => {
      if (statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // Calculate occupancy rate
    const occupiedRooms = statusCounts.occupied + statusCounts.reserved;
    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Get revenue data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Revenue today
    const revenueTodayResult = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["checked_in", "checked_out"] },
          checkInDate: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$totalAmount" } },
        },
      },
    ]);

    const revenueToday = revenueTodayResult[0]?.total || 0;

    // Revenue this month
    const revenueThisMonthResult = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["checked_in", "checked_out"] },
          checkInDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$totalAmount" } },
        },
      },
    ]);

    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    // Get most popular room type
    const roomTypeBookings = await Booking.aggregate([
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "roomData",
        },
      },
      {
        $unwind: "$roomData",
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
        $unwind: "$roomTypeData",
      },
      {
        $group: {
          _id: "$roomTypeData.name",
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: { bookings: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const mostPopularType = roomTypeBookings[0]?._id || "نامشخص";

    // Calculate average rating
    const averageRatingResult = await RoomType.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating = averageRatingResult[0]?.avgRating || 0;

    // Count VIP rooms (luxury category)
    const vipRooms = await RoomType.countDocuments({ category: "luxury" });

    const stats = {
      total: totalRooms,
      available: statusCounts.available,
      occupied: statusCounts.occupied,
      reserved: statusCounts.reserved,
      maintenance: statusCounts.maintenance,
      cleaning: statusCounts.cleaning,
      vip: vipRooms,
      occupancyRate,
      revenueToday: Number(revenueToday),
      revenueThisMonth: Number(revenueThisMonth),
      averageRating: Number(averageRating.toFixed(1)),
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
