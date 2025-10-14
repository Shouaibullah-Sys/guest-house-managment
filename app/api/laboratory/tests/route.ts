import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { laboratoryTests, patients, doctors } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

// GET - Fetch all lab tests with patient and doctor info
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const testsData = await db
      .select({
        id: laboratoryTests.id,
        patientId: laboratoryTests.patientId,
        doctorId: laboratoryTests.doctorId,
        testType: laboratoryTests.testType,
        testName: laboratoryTests.testName,
        testDate: laboratoryTests.testDate,
        results: laboratoryTests.results,
        status: laboratoryTests.status,
        notes: laboratoryTests.notes,
        referredBy: laboratoryTests.referredBy,
        technician: laboratoryTests.technician,
        amountCharged: laboratoryTests.amountCharged,
        amountPaid: laboratoryTests.amountPaid,
        paymentStatus: laboratoryTests.paymentStatus,
        createdBy: laboratoryTests.createdBy,
        createdAt: laboratoryTests.createdAt,
        updatedAt: laboratoryTests.updatedAt,
        patient: patients,
        doctor: doctors,
      })
      .from(laboratoryTests)
      .leftJoin(patients, eq(laboratoryTests.patientId, patients.id))
      .leftJoin(doctors, eq(laboratoryTests.doctorId, doctors.id))
      .orderBy(desc(laboratoryTests.createdAt))
      .limit(100);

    return NextResponse.json({ tests: testsData });
  } catch (error) {
    console.error("Error fetching lab tests:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// POST - Create new lab test
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.patientId || !body.testType || !body.testName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify patient exists
    const patientExists = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, body.patientId))
      .limit(1);

    if (patientExists.length === 0) {
      return new NextResponse("Patient not found", { status: 404 });
    }

    // If doctorId is provided, verify doctor exists
    if (body.doctorId) {
      const doctorExists = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.id, body.doctorId))
        .limit(1);

      if (doctorExists.length === 0) {
        return new NextResponse("Doctor not found", { status: 404 });
      }
    }

    // Calculate payment status based on amounts
    let paymentStatus = body.paymentStatus || "pending";
    if (body.amountCharged && body.amountPaid) {
      if (body.amountPaid >= body.amountCharged) {
        paymentStatus = "paid";
      } else if (body.amountPaid > 0) {
        paymentStatus = "partial";
      }
    }

    const newTest = await db
      .insert(laboratoryTests)
      .values({
        patientId: body.patientId,
        doctorId: body.doctorId,
        testType: body.testType,
        testName: body.testName,
        testDate: body.testDate ? new Date(body.testDate) : new Date(),
        results: body.results,
        status: body.status || "pending",
        notes: body.notes,
        referredBy: body.referredBy,
        technician: body.technician,
        amountCharged: body.amountCharged,
        amountPaid: body.amountPaid,
        paymentStatus: paymentStatus,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ test: newTest[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating lab test:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
