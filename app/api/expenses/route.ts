// app/api/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/models/Expense";
import { AuditLog } from "@/models/AuditLog";
import dbConnect from "@/lib/db";
import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { convertMongoData, sanitizeExpenseData } from "@/lib/db-utils";

// Validation schemas
const expenseCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  amount: z
    .union([
      z.number().positive("Amount must be positive"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    ])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]),
  expenseDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
      z.date(),
    ])
    .transform((val) =>
      val instanceof Date ? val.toISOString().split("T")[0] : val
    ),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
});

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const queryParams: any = {};

    // Parse all possible query parameters
    const validParams = [
      "page",
      "limit",
      "category",
      "vendor",
      "startDate",
      "endDate",
      "minAmount",
      "maxAmount",
      "search",
      "sortBy",
      "sortOrder",
    ];

    validParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value !== null) queryParams[param] = value;
    });

    const query = expenseQuerySchema.parse(queryParams);

    // Build filter query
    const filter: any = { createdBy: userId };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { vendor: { $regex: query.search, $options: "i" } },
        { receiptNumber: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.category && query.category !== "all") {
      filter.category = query.category;
    }

    if (query.vendor) {
      filter.vendor = { $regex: query.vendor, $options: "i" };
    }

    if (query.startDate || query.endDate) {
      filter.expenseDate = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        start.setHours(0, 0, 0, 0);
        filter.expenseDate.$gte = start;
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.expenseDate.$lte = end;
      }
    }

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      filter.amount = {};
      if (query.minAmount !== undefined) {
        filter.amount.$gte = query.minAmount;
      }
      if (query.maxAmount !== undefined) {
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
      .lean()
      .exec();

    // Convert MongoDB data to plain JavaScript
    const transformedData = convertMongoData(data);

    // Get summary statistics with proper aggregation
    const summaryPipeline = [
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
    ];

    const summaryResult = await Expense.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalAmount: 0,
      averageAmount: 0,
      count: 0,
      minAmount: 0,
      maxAmount: 0,
    };

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
      },
      summary: {
        totalAmount: summary.totalAmount || 0,
        averageAmount: summary.averageAmount || 0,
        count: summary.count || 0,
        minAmount: summary.minAmount || 0,
        maxAmount: summary.maxAmount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to fetch expenses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
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
    const sanitizedBody = sanitizeExpenseData(body);
    const validatedData = expenseCreateSchema.parse(sanitizedBody);

    const expense = new Expense({
      ...validatedData,
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

    return NextResponse.json(convertMongoData(expense.toObject()), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
