"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doctorCommissions } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const createCommissionSchema = z.object({
  doctorId: z.number().min(1, "Doctor ID is required"),
  commissionPercentage: z
    .number()
    .min(0)
    .max(100, "Commission percentage must be between 0 and 100"),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/laboratory/doctor-commissions - List all doctor commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const isActive = searchParams.get("isActive");

    let whereConditions = [];

    if (doctorId) {
      whereConditions.push(eq(doctorCommissions.doctorId, parseInt(doctorId)));
    }

    if (isActive !== null) {
      whereConditions.push(eq(doctorCommissions.isActive, isActive === "true"));
    }

    const commissions = await db
      .select()
      .from(doctorCommissions)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(doctorCommissions.effectiveFrom));

    return NextResponse.json(commissions);
  } catch (error) {
    console.error("Error fetching doctor commissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor commissions" },
      { status: 500 }
    );
  }
}

// POST /api/laboratory/doctor-commissions - Create a new doctor commission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCommissionSchema.parse(body);

    // Check if there's already an active commission for this doctor
    if (validatedData.isActive !== false) {
      const existingActiveCommission = await db
        .select()
        .from(doctorCommissions)
        .where(
          and(
            eq(doctorCommissions.doctorId, validatedData.doctorId),
            eq(doctorCommissions.isActive, true)
          )
        )
        .limit(1);

      if (existingActiveCommission.length > 0) {
        return NextResponse.json(
          { error: "An active commission already exists for this doctor" },
          { status: 400 }
        );
      }
    }

    const newCommission = await db
      .insert(doctorCommissions)
      .values({
        ...validatedData,
        effectiveFrom: validatedData.effectiveFrom
          ? new Date(validatedData.effectiveFrom)
          : new Date(),
        effectiveTo: validatedData.effectiveTo
          ? new Date(validatedData.effectiveTo)
          : null,
        isActive: validatedData.isActive ?? true,
      })
      .returning();

    return NextResponse.json(newCommission[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating doctor commission:", error);
    return NextResponse.json(
      { error: "Failed to create doctor commission" },
      { status: 500 }
    );
  }
}
