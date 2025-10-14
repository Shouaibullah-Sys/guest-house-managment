"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doctorCommissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateCommissionSchema = z.object({
  doctorId: z.number().min(1, "Doctor ID is required").optional(),
  commissionPercentage: z
    .number()
    .min(0)
    .max(100, "Commission percentage must be between 0 and 100")
    .optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/laboratory/doctor-commissions/[id] - Get a specific doctor commission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commission = await db
      .select()
      .from(doctorCommissions)
      .where(eq(doctorCommissions.id, parseInt(params.id)))
      .limit(1);

    if (commission.length === 0) {
      return NextResponse.json(
        { error: "Doctor commission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(commission[0]);
  } catch (error) {
    console.error("Error fetching doctor commission:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor commission" },
      { status: 500 }
    );
  }
}

// PUT /api/laboratory/doctor-commissions/[id] - Update a specific doctor commission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCommissionSchema.parse(body);

    const updateData: any = { ...validatedData };

    if (validatedData.effectiveFrom) {
      updateData.effectiveFrom = new Date(validatedData.effectiveFrom);
    }

    if (validatedData.effectiveTo) {
      updateData.effectiveTo = new Date(validatedData.effectiveTo);
    }

    const updatedCommission = await db
      .update(doctorCommissions)
      .set(updateData)
      .where(eq(doctorCommissions.id, parseInt(params.id)))
      .returning();

    if (updatedCommission.length === 0) {
      return NextResponse.json(
        { error: "Doctor commission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCommission[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating doctor commission:", error);
    return NextResponse.json(
      { error: "Failed to update doctor commission" },
      { status: 500 }
    );
  }
}

// DELETE /api/laboratory/doctor-commissions/[id] - Delete a specific doctor commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedCommission = await db
      .delete(doctorCommissions)
      .where(eq(doctorCommissions.id, parseInt(params.id)))
      .returning();

    if (deletedCommission.length === 0) {
      return NextResponse.json(
        { error: "Doctor commission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Doctor commission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting doctor commission:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor commission" },
      { status: 500 }
    );
  }
}
