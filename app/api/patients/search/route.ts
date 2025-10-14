// app/api/patients/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { patients, laboratoryTests } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get("phone");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Search for patient by phone number
    const patientData = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phoneNumber: patients.phoneNumber,
        email: patients.email,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        medicalHistory: patients.medicalHistory,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
      })
      .from(patients)
      .where(
        or(
          eq(patients.phoneNumber, phoneNumber),
          ilike(patients.phoneNumber, `%${phoneNumber}%`)
        )
      )
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
        reportId: laboratoryTests.id, // Using test ID as report ID
      })
      .from(laboratoryTests)
      .where(eq(laboratoryTests.patientId, patient.id))
      .orderBy(desc(laboratoryTests.testDate));

    // Combine patient data with tests
    const patientWithTests = {
      ...patient,
      tests: tests,
    };

    return NextResponse.json(patientWithTests);
  } catch (error) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
