"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laboratoryExpenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateExpenseSchema = z.object({
  expenseType: z
    .enum(["regular_payment", "doctor_percentage", "laboratory_salary"])
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  amount: z.number().min(0, "Amount must be positive").optional(),
  expenseDate: z.string().optional(),
  relatedTestId: z.number().optional(),
  relatedDoctorId: z.number().optional(),
  percentage: z.number().min(0).max(100).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["monthly", "weekly", "daily"]).optional(),
  status: z.enum(["active", "inactive", "paid"]).optional(),
  notes: z.string().optional(),
});

// GET /api/laboratory/expenses/[id] - Get a specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = await db
      .select()
      .from(laboratoryExpenses)
      .where(eq(laboratoryExpenses.id, parseInt(id)))
      .limit(1);

    if (expense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense[0]);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT /api/laboratory/expenses/[id] - Update a specific expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    const updateData: any = { ...validatedData };

    if (validatedData.expenseDate) {
      updateData.expenseDate = new Date(validatedData.expenseDate);
    }

    const updatedExpense = await db
      .update(laboratoryExpenses)
      .set(updateData)
      .where(eq(laboratoryExpenses.id, parseInt(id)))
      .returning();

    if (updatedExpense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(updatedExpense[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/laboratory/expenses/[id] - Delete a specific expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedExpense = await db
      .delete(laboratoryExpenses)
      .where(eq(laboratoryExpenses.id, parseInt(id)))
      .returning();

    if (deletedExpense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
