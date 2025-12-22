// app/api/guests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/User";
import dbConnect from "@/lib/db";
import { z } from "zod";
import {
  guestUpdateSchema,
  guestResponseSchema,
  type GuestUpdateData,
  type GuestResponse,
} from "@/lib/validation/guest";

// Transform User document to Guest response format
function transformUserToGuest(user: any): GuestResponse {
  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    nationality: user.nationality || "",
    idType: user.idType,
    idNumber: user.idNumber,
    passportNumber: user.passportNumber,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split("T")[0]
      : undefined,
    address: user.address,
    city: user.city,
    country: user.country,
    postalCode: user.postalCode,
    emergencyContact: user.emergencyContact,
    preferences: user.preferences,
    loyaltyPoints: user.loyaltyPoints || 0,
    totalStays: user.totalStays || 0,
    totalSpent: Number(user.totalSpent) || 0, // Convert Decimal128 to number
    isActive: user.isActive !== false,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// GET /api/guests/[id] - Get a specific guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Find guest by ID and role (should be "guest")
    const guest = await User.findOne({
      _id: id,
      role: "guest",
    }).lean();

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Transform and return the guest
    const transformedGuest = transformUserToGuest(guest);

    return NextResponse.json({
      data: transformedGuest,
    });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest" },
      { status: 500 }
    );
  }
}

// PUT /api/guests/[id] - Update a specific guest
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const updateData: GuestUpdateData = guestUpdateSchema.parse(body);

    // Check if guest exists and is actually a guest
    const existingGuest = await User.findOne({
      _id: id,
      role: "guest",
    });

    if (!existingGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingGuest.email) {
      const emailExists = await User.findOne({
        email: updateData.email,
        _id: { $ne: id }, // Exclude current guest
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    // Check for phone uniqueness if phone is being updated
    if (updateData.phone && updateData.phone !== existingGuest.phone) {
      const phoneExists = await User.findOne({
        phone: updateData.phone,
        _id: { $ne: id }, // Exclude current guest
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: "این شماره تلفن قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateFields: any = { ...updateData };

    // Convert date string to Date object if provided
    if (updateFields.dateOfBirth) {
      updateFields.dateOfBirth = new Date(updateFields.dateOfBirth);
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    // Update the guest
    const updatedGuest = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Transform and return the updated guest
    const transformedGuest = transformUserToGuest(updatedGuest);

    return NextResponse.json({
      data: transformedGuest,
      message: "Guest updated successfully",
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}

// DELETE /api/guests/[id] - Delete a specific guest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Check if guest exists and is actually a guest
    const existingGuest = await User.findOne({
      _id: id,
      role: "guest",
    });

    if (!existingGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // TODO: Check if guest has active bookings before deletion
    // This would require checking the Booking model for any active bookings
    // For now, we'll allow deletion but in a real system you'd want to prevent deletion
    // of guests with active bookings

    // Delete the guest
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Guest deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
