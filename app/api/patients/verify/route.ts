//app/api/patients/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { patients, laboratoryTests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, patientPin } = await req.json();

    if (!phoneNumber || !patientPin) {
      return NextResponse.json(
        { error: "Phone number and PIN are required" },
        { status: 400 }
      );
    }

    // Search for patient by phone number and PIN
    const patientData = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phoneNumber: patients.phoneNumber,
        patientPin: patients.patientPin,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        medicalHistory: patients.medicalHistory,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
      })
      .from(patients)
      .where(eq(patients.phoneNumber, phoneNumber))
      .limit(1);

    if (patientData.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = patientData[0];

    // Verify PIN
    if (patient.patientPin !== patientPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

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
        reportId: laboratoryTests.id,
      })
      .from(laboratoryTests)
      .where(eq(laboratoryTests.patientId, patient.id))
      .orderBy(desc(laboratoryTests.testDate));

    // Combine patient data with tests (remove PIN from response for security)
    const { patientPin: _, ...patientWithoutPin } = patient;
    const patientWithTests = {
      ...patientWithoutPin,
      tests: tests,
    };

    return NextResponse.json(patientWithTests);
  } catch (error) {
    console.error("Error verifying patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
