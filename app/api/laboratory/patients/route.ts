import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { patients } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";

// PIN generation function
function generatePatientPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
}

// GET - Fetch all patients
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const patientsData = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phoneNumber: patients.phoneNumber,
        patientPin: patients.patientPin, // Include PIN in response
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        medicalHistory: patients.medicalHistory,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
      })
      .from(patients)
      .orderBy(desc(patients.createdAt))
      .limit(100);

    return NextResponse.json({ patients: patientsData });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// POST - Create new patient
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.phoneNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate unique patient PIN
    const patientPin = generatePatientPin();

    const newPatient = await db
      .insert(patients)
      .values({
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        patientPin: patientPin, // Store the generated PIN
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        address: body.address,
        emergencyContact: body.emergencyContact,
        medicalHistory: body.medicalHistory,
      })
      .returning();

    // Return the PIN so lab staff can provide it to the patient
    return NextResponse.json(
      {
        patient: newPatient[0],
        generatedPin: patientPin, // Include PIN in response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
