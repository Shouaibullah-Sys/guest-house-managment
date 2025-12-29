// app/api/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/models/Expense";
import { AuditLog } from "@/models/AuditLog";
import dbConnect from "@/lib/db";
import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/types/expense";

// Validation schemas
const expenseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
});

const expenseUpdateSchema = expenseCreateSchema.partial();

const expenseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  vendor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["expenseDate", "amount", "createdAt"]).default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// GET all expenses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Expenses API - GET request received");

    const { userId } = await auth();
    console.log("🔑 Auth result - UserId:", userId);

    if (!userId) {
      console.log("❌ No user ID found in auth");
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid authentication token" },
        { status: 401 }
      );
    }

    console.log("💾 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    const searchParams = request.nextUrl.searchParams;

    // Build query object, only including non-null parameters
    const queryParams: any = {};

    if (searchParams.get("page")) queryParams.page = searchParams.get("page");
    if (searchParams.get("limit"))
      queryParams.limit = searchParams.get("limit");
    if (searchParams.get("category"))
      queryParams.category = searchParams.get("category");
    if (searchParams.get("vendor"))
      queryParams.vendor = searchParams.get("vendor");
    if (searchParams.get("startDate"))
      queryParams.startDate = searchParams.get("startDate");
    if (searchParams.get("endDate"))
      queryParams.endDate = searchParams.get("endDate");
    if (searchParams.get("minAmount"))
      queryParams.minAmount = searchParams.get("minAmount");
    if (searchParams.get("maxAmount"))
      queryParams.maxAmount = searchParams.get("maxAmount");
    if (searchParams.get("search"))
      queryParams.search = searchParams.get("search");
    if (searchParams.get("sortBy"))
      queryParams.sortBy = searchParams.get("sortBy");
    if (searchParams.get("sortOrder"))
      queryParams.sortOrder = searchParams.get("sortOrder");

    const query = expenseQuerySchema.parse(queryParams);

    // Build filter query
    const filter: any = { createdBy: userId };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.vendor) {
      filter.vendor = { $regex: query.vendor, $options: "i" };
    }

    if (query.startDate || query.endDate) {
      filter.expenseDate = {};
      if (query.startDate) {
        filter.expenseDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.expenseDate.$lte = new Date(query.endDate);
      }
    }

    if (query.minAmount || query.maxAmount) {
      filter.amount = {};
      if (query.minAmount) {
        filter.amount.$gte = query.minAmount;
      }
      if (query.maxAmount) {
        filter.amount.$lte = query.maxAmount;
      }
    }

    // Get total count
    const totalCount = await Expense.countDocuments(filter);

    // Build sort
    const sort: any = {};
    sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;

    // Get paginated data
    const data = await Expense.find(filter)
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean();

    // Get summary statistics
    const summary = await Expense.aggregate([
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

    const summaryResult = summary[0] || {
      totalAmount: 0,
      averageAmount: 0,
      count: 0,
      minAmount: 0,
      maxAmount: 0,
    };

    return NextResponse.json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
      },
      summary: {
        totalAmount: summaryResult.totalAmount || 0,
        averageAmount: summaryResult.averageAmount || 0,
        count: summaryResult.count || 0,
        minAmount: summaryResult.minAmount || 0,
        maxAmount: summaryResult.maxAmount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST create new expense
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validatedData = expenseCreateSchema.parse(body);

    const expense = new Expense({
      ...validatedData,
      amount: validatedData.amount,
      expenseDate: new Date(validatedData.expenseDate),
      createdBy: userId,
      updatedBy: userId,
    });

    await expense.save();

    // Create audit log entry
    const auditLogEntry = new AuditLog({
      user: userId,
      action: "CREATE",
      entity: "expense",
      entityId: expense._id,
      newValues: expense.toObject(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "",
    });

    await auditLogEntry.save();

    return NextResponse.json(expense.toObject(), { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
