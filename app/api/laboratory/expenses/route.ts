"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laboratoryExpenses } from "@/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

// app/api/laboratory/expenses/route.ts (updated schema)
const createExpenseSchema = z.object({
  expenseType: z.enum([
    "regular_payment",
    "doctor_percentage",
    "laboratory_salary",
  ]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  expenseDate: z.string().optional(),
  relatedTestId: z.number().optional(),
  relatedDoctorId: z.number().optional(),
  percentage: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["monthly", "weekly", "daily"]).optional(),
  status: z.enum(["active", "inactive", "paid"]).optional(),
  notes: z.string().optional(),
});

// GET /api/laboratory/expenses - List all expenses with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const expenseType = searchParams.get("expenseType");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const doctorId = searchParams.get("doctorId");

    let whereConditions = [];

    if (expenseType) {
      whereConditions.push(eq(laboratoryExpenses.expenseType, expenseType));
    }

    if (status) {
      whereConditions.push(eq(laboratoryExpenses.status, status));
    }

    if (startDate) {
      whereConditions.push(
        gte(laboratoryExpenses.expenseDate, new Date(startDate))
      );
    }

    if (endDate) {
      whereConditions.push(
        lte(laboratoryExpenses.expenseDate, new Date(endDate))
      );
    }

    if (doctorId) {
      whereConditions.push(
        eq(laboratoryExpenses.relatedDoctorId, parseInt(doctorId))
      );
    }

    const expenses = await db
      .select()
      .from(laboratoryExpenses)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(laboratoryExpenses.expenseDate));

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/laboratory/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);

    const newExpense = await db
      .insert(laboratoryExpenses)
      .values({
        ...validatedData,
        expenseDate: validatedData.expenseDate
          ? new Date(validatedData.expenseDate)
          : new Date(),
        createdBy: "system", // TODO: Get from auth context
      })
      .returning();

    return NextResponse.json(newExpense[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
