// app/api/laboratory/doctors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { doctors } from "@/db/schema";
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
    const doctorId = parseInt(params.id);

    console.log("Updating doctor:", doctorId, body);

    // Validate required fields
    if (!body.name) {
      return new NextResponse("Doctor name is required", { status: 400 });
    }

    // Check if doctor exists
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (existingDoctor.length === 0) {
      return new NextResponse("Doctor not found", { status: 404 });
    }

    // Update the doctor
    const updatedDoctor = await db
      .update(doctors)
      .set({
        name: body.name,
        specialization: body.specialization,
        phoneNumber: body.phoneNumber,
        clinicName: body.clinicName,
        licenseNumber: body.licenseNumber,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, doctorId))
      .returning();

    console.log("Doctor updated successfully:", updatedDoctor[0]);

    return NextResponse.json({ doctor: updatedDoctor[0] });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Optional: GET single doctor
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const doctorId = parseInt(params.id);

    const doctorData = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (doctorData.length === 0) {
      return new NextResponse("Doctor not found", { status: 404 });
    }

    return NextResponse.json({ doctor: doctorData[0] });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
