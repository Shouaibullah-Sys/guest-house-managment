// app/api/laboratory/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { patients, laboratoryTests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = parseInt(params.id);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Fetch patient data
    const patientData = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phoneNumber: patients.phoneNumber,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        medicalHistory: patients.medicalHistory,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
      })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (patientData.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = patientData[0];

    // Fetch patient's laboratory tests
    const tests = await db
      .select({
        id: laboratoryTests.id,
        testName: laboratoryTests.testName,
        testType: laboratoryTests.testType,
        testDate: laboratoryTests.testDate,
        status: laboratoryTests.status,
        results: laboratoryTests.results,
        technician: laboratoryTests.technician,
        amountCharged: laboratoryTests.amountCharged,
        amountPaid: laboratoryTests.amountPaid,
        paymentStatus: laboratoryTests.paymentStatus,
        notes: laboratoryTests.notes,
      })
      .from(laboratoryTests)
      .where(eq(laboratoryTests.patientId, patient.id))
      .orderBy(desc(laboratoryTests.testDate));

    // Combine patient data with tests
    const patientWithTests = {
      ...patient,
      tests: tests,
      totalTests: tests.length,
      lastVisit: tests.length > 0 ? tests[0].testDate : patient.createdAt,
      status: tests.length > 0 ? ("active" as const) : ("inactive" as const),
    };

    return NextResponse.json(patientWithTests);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
