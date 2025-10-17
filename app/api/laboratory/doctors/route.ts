import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { doctors } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET - Fetch all doctors
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const doctorsData = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        specialization: doctors.specialization,
        phoneNumber: doctors.phoneNumber,
        clinicName: doctors.clinicName,
        licenseNumber: doctors.licenseNumber,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
      })
      .from(doctors)
      .orderBy(desc(doctors.createdAt))
      .limit(100);

    return NextResponse.json({ doctors: doctorsData });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// POST - Create new doctor
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name) {
      return new NextResponse("Doctor name is required", { status: 400 });
    }

    const newDoctor = await db
      .insert(doctors)
      .values({
        name: body.name,
        specialization: body.specialization,
        phoneNumber: body.phoneNumber,
        clinicName: body.clinicName,
        licenseNumber: body.licenseNumber,
      })
      .returning();

    return NextResponse.json({ doctor: newDoctor[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// PUT - Update a doctor
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new NextResponse("Doctor ID is required", { status: 400 });
    }

    // Validate required fields
    if (!updateData.name) {
      return new NextResponse("Doctor name is required", { status: 400 });
    }

    const updatedDoctor = await db
      .update(doctors)
      .set({
        name: updateData.name,
        specialization: updateData.specialization,
        phoneNumber: updateData.phoneNumber,
        clinicName: updateData.clinicName,
        licenseNumber: updateData.licenseNumber,
      })
      .where(eq(doctors.id, id))
      .returning();

    if (updatedDoctor.length === 0) {
      return new NextResponse("Doctor not found", { status: 404 });
    }

    return NextResponse.json({ doctor: updatedDoctor[0] }, { status: 200 });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
