"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laboratoryStaff } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStaffSchema = z.object({
  staffName: z.string().min(1, "Staff name is required").optional(),
  position: z.string().min(1, "Position is required").optional(),
  salaryPercentage: z
    .number()
    .min(0)
    .max(100, "Salary percentage must be between 0 and 100")
    .optional(),
  baseSalary: z.number().min(0, "Base salary must be positive").optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/laboratory/staff/[id] - Get a specific laboratory staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await db
      .select()
      .from(laboratoryStaff)
      .where(eq(laboratoryStaff.id, parseInt(id)))
      .limit(1);

    if (staff.length === 0) {
      return NextResponse.json(
        { error: "Laboratory staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(staff[0]);
  } catch (error) {
    console.error("Error fetching laboratory staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch laboratory staff" },
      { status: 500 }
    );
  }
}

// PUT /api/laboratory/staff/[id] - Update a specific laboratory staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    const updateData: any = { ...validatedData };

    if (validatedData.effectiveFrom) {
      updateData.effectiveFrom = new Date(validatedData.effectiveFrom);
    }

    if (validatedData.effectiveTo) {
      updateData.effectiveTo = new Date(validatedData.effectiveTo);
    }

    const updatedStaff = await db
      .update(laboratoryStaff)
      .set(updateData)
      .where(eq(laboratoryStaff.id, parseInt(id)))
      .returning();

    if (updatedStaff.length === 0) {
      return NextResponse.json(
        { error: "Laboratory staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStaff[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating laboratory staff:", error);
    return NextResponse.json(
      { error: "Failed to update laboratory staff" },
      { status: 500 }
    );
  }
}

// DELETE /api/laboratory/staff/[id] - Delete a specific laboratory staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedStaff = await db
      .delete(laboratoryStaff)
      .where(eq(laboratoryStaff.id, parseInt(id)))
      .returning();

    if (deletedStaff.length === 0) {
      return NextResponse.json(
        { error: "Laboratory staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Laboratory staff deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting laboratory staff:", error);
    return NextResponse.json(
      { error: "Failed to delete laboratory staff" },
      { status: 500 }
    );
  }
}
