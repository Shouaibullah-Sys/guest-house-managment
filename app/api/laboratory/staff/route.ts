"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laboratoryStaff } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";

const createStaffSchema = z.object({
  staffName: z.string().min(1, "Staff name is required"),
  position: z.string().min(1, "Position is required"),
  salaryPercentage: z
    .number()
    .min(0)
    .max(100, "Salary percentage must be between 0 and 100"),
  baseSalary: z.number().min(0, "Base salary must be positive").optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/laboratory/staff - List all laboratory staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const isActive = searchParams.get("isActive");

    let whereConditions = [];

    if (position) {
      whereConditions.push(eq(laboratoryStaff.position, position));
    }

    if (isActive !== null) {
      whereConditions.push(eq(laboratoryStaff.isActive, isActive === "true"));
    }

    const staff = await db
      .select()
      .from(laboratoryStaff)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(laboratoryStaff.effectiveFrom));

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching laboratory staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch laboratory staff" },
      { status: 500 }
    );
  }
}

// POST /api/laboratory/staff - Create a new laboratory staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    // Check if there's already an active staff member with the same name and position
    if (validatedData.isActive !== false) {
      const existingActiveStaff = await db
        .select()
        .from(laboratoryStaff)
        .where(
          and(
            eq(laboratoryStaff.staffName, validatedData.staffName),
            eq(laboratoryStaff.position, validatedData.position),
            eq(laboratoryStaff.isActive, true)
          )
        )
        .limit(1);

      if (existingActiveStaff.length > 0) {
        return NextResponse.json(
          {
            error:
              "An active staff member with this name and position already exists",
          },
          { status: 400 }
        );
      }
    }

    const newStaff = await db
      .insert(laboratoryStaff)
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

    return NextResponse.json(newStaff[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating laboratory staff:", error);
    return NextResponse.json(
      { error: "Failed to create laboratory staff" },
      { status: 500 }
    );
  }
}
