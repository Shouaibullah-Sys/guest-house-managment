// app/api/expenses/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/models/Expense";
import dbConnect from "@/lib/db";
import { z } from "zod";

const summaryQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year", "custom"]).default("month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = summaryQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (query.period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        startDate = query.startDate
          ? new Date(query.startDate)
          : new Date(now.getFullYear(), 0, 1);
        endDate = query.endDate ? new Date(query.endDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build filter
    const filter: any = {
      createdBy: userId,
      expenseDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (query.category) {
      filter.category = query.category;
    }

    // Get summary by category
    const summaryByCategory = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get total summary
    const totalSummary = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
          count: { $sum: 1 },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
    ]);

    const totalSummaryResult = totalSummary[0] || {
      totalAmount: 0,
      averageAmount: 0,
      count: 0,
      minAmount: 0,
      maxAmount: 0,
    };

    // Get monthly trend (last 12 months)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const monthlyTrendFilter = {
      createdBy: userId,
      expenseDate: {
        $gte: oneYearAgo,
        $lte: now,
      },
    };

    const monthlyTrend = await Expense.aggregate([
      { $match: monthlyTrendFilter },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: { $cond: [{ $lt: ["$_id.month", 10] }, "0", ""] } },
              { $toString: "$_id.month" },
            ],
          },
          total: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    return NextResponse.json({
      period: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      summary: {
        totalAmount: totalSummaryResult.totalAmount || 0,
        averageAmount: totalSummaryResult.averageAmount || 0,
        count: totalSummaryResult.count || 0,
        minAmount: totalSummaryResult.minAmount || 0,
        maxAmount: totalSummaryResult.maxAmount || 0,
      },
      byCategory: summaryByCategory,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch expense summary" },
      { status: 500 }
    );
  }
}
