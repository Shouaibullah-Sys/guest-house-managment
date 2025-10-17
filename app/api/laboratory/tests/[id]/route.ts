// app/api/laboratory/tests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { laboratoryTests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const testId = parseInt(params.id);

    console.log("Updating test:", testId, body); // Debug log

    // Validate required fields
    if (!body.testType || !body.testName) {
      return new NextResponse(
        "Missing required fields: testType and testName",
        { status: 400 }
      );
    }

    // Check if test exists
    const existingTest = await db
      .select()
      .from(laboratoryTests)
      .where(eq(laboratoryTests.id, testId))
      .limit(1);

    if (existingTest.length === 0) {
      return new NextResponse("Test not found", { status: 404 });
    }

    // Calculate payment status based on amounts
    let paymentStatus = body.paymentStatus || "pending";
    if (body.amountCharged && body.amountPaid !== undefined) {
      if (body.amountPaid >= body.amountCharged) {
        paymentStatus = "paid";
      } else if (body.amountPaid > 0) {
        paymentStatus = "partial";
      } else {
        paymentStatus = "pending";
      }
    }

    // Update the test
    const updatedTest = await db
      .update(laboratoryTests)
      .set({
        testType: body.testType,
        testName: body.testName,
        status: body.status,
        results: body.results,
        notes: body.notes,
        technician: body.technician,
        amountCharged: body.amountCharged,
        amountPaid: body.amountPaid,
        paymentStatus: paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(laboratoryTests.id, testId))
      .returning();

    console.log("Test updated successfully:", updatedTest[0]); // Debug log

    return NextResponse.json({ test: updatedTest[0] });
  } catch (error) {
    console.error("Error updating lab test:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Also add GET for single test (optional but useful)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const testId = parseInt(params.id);

    const testData = await db
      .select()
      .from(laboratoryTests)
      .where(eq(laboratoryTests.id, testId))
      .limit(1);

    if (testData.length === 0) {
      return new NextResponse("Test not found", { status: 404 });
    }

    return NextResponse.json({ test: testData[0] });
  } catch (error) {
    console.error("Error fetching lab test:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
