// app/api/expenses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/models/Expense";
import { AuditLog } from "@/models/AuditLog";
import dbConnect from "@/lib/db";
import { z } from "zod";
import { Types } from "mongoose";
import { IExpense } from "@/models/types";

const expenseUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  amount: z
    .number()
    .positive()
    .or(z.string().regex(/^\d*\.?\d*$/))
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .optional(),
  currency: z.string().length(3).optional(),
  category: z
    .enum([
      "لوازم اداری",
      "خدمات عمومی",
      "حمل و نقل",
      "بازاریابی",
      "نگهداری",
      "سفر",
      "غذا و سرگرمی",
      "بیمه",
      "کرایه",
      "تجهیزات",
      "نرم افزار",
      "خدمات حرفه‌ای",
      "سایر",
    ])
    .optional(),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
});

// GET single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    if (!Types.ObjectId.isValid(new Types.ObjectId(id))) {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    const expense = await Expense.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense.toObject());
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    if (!Types.ObjectId.isValid(new Types.ObjectId(id))) {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Get current expense
    const currentExpense = (await Expense.findOne({
      _id: id,
      createdBy: userId,
    })) as IExpense;

    if (!currentExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = expenseUpdateSchema.parse(body);

    // Prepare update data
    const updateData: any = { ...validatedData, updatedBy: userId };

    if (validatedData.expenseDate) {
      updateData.expenseDate = new Date(validatedData.expenseDate);
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Create audit log entry
    const auditLogEntry = new AuditLog({
      user: userId,
      action: "UPDATE",
      entity: "expense",
      entityId: updatedExpense._id,
      oldValues: currentExpense.toObject(),
      newValues: updatedExpense.toObject(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "",
    });

    await auditLogEntry.save();

    return NextResponse.json(updatedExpense.toObject());
  } catch (error) {
    console.error("Error updating expense:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    if (!Types.ObjectId.isValid(new Types.ObjectId(id))) {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Get current expense
    const currentExpense = (await Expense.findOne({
      _id: id,
      createdBy: userId,
    })) as IExpense;

    if (!currentExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await Expense.findByIdAndDelete(id);

    // Create audit log entry
    const auditLogEntry = new AuditLog({
      user: userId,
      action: "DELETE",
      entity: "expense",
      entityId: currentExpense._id,
      oldValues: currentExpense.toObject(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "",
    });

    await auditLogEntry.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
