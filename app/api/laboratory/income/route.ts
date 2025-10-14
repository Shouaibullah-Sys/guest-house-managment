// app/api/laboratory/income/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laboratoryTests, doctors } from "@/db/schema";
import { and, gte, lte, eq, sum, between } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const doctorId = searchParams.get("doctorId");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Build where conditions
    let whereConditions = [
      between(laboratoryTests.testDate, new Date(startDate), new Date(endDate)),
      eq(laboratoryTests.status, "completed"),
    ];

    if (doctorId) {
      whereConditions.push(eq(laboratoryTests.doctorId, parseInt(doctorId)));
    }

    // Calculate total income
    const incomeResult = await db
      .select({
        totalIncome: sum(laboratoryTests.amountPaid).mapWith(Number),
      })
      .from(laboratoryTests)
      .where(and(...whereConditions));

    const totalIncome = incomeResult[0]?.totalIncome || 0;

    // If doctor is specified, also get doctor info
    let doctorInfo = null;
    if (doctorId) {
      const doctorData = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, parseInt(doctorId)))
        .limit(1);

      doctorInfo = doctorData[0] || null;
    }

    return NextResponse.json({
      totalIncome,
      doctor: doctorInfo,
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error calculating income:", error);
    return NextResponse.json(
      { error: "Failed to calculate income" },
      { status: 500 }
    );
  }
}
