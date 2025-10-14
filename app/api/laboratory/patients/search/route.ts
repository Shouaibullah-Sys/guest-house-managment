import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { patients } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has lab access
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get("phone");

    if (!phoneNumber) {
      return NextResponse.json({ patients: [] });
    }

    // Search for patients by phone number
    const patientsData = await db
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
      .limit(10);

    return NextResponse.json({ patients: patientsData });
  } catch (error) {
    console.error("Error searching patients:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
