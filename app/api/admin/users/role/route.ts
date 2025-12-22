// app/api/admin/users/role/route.ts - Separate route for role management
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { User, Staff } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser || currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const userIdToUpdate = formData.get("id") as string;
    const role = formData.get("role") as "guest" | "staff" | "admin";

    if (!userIdToUpdate || !role) {
      return new NextResponse("User ID and role are required", { status: 400 });
    }

    // Use Clerk's Admin API to update user
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Get current user metadata
    const clerkUser = await client.users.getUser(userIdToUpdate);
    const currentMetadata = clerkUser.publicMetadata as any;

    const approved = role === "guest" ? true : false;

    // Update Clerk metadata
    await client.users.updateUser(userIdToUpdate, {
      publicMetadata: {
        ...currentMetadata,
        role,
        approved,
      },
    });

    // Update MongoDB user
    await User.findOneAndUpdate(
      { _id: userIdToUpdate },
      {
        $set: {
          role,
          approved,
        },
      }
    );

    // If assigning staff role, ensure staff profile exists
    if (role === "staff") {
      await ensureStaffProfile(userIdToUpdate);
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Helper function to ensure staff profile exists
async function ensureStaffProfile(userId: string) {
  try {
    const existingStaff = await Staff.findOne({ userId });

    if (!existingStaff) {
      // Generate employee ID
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;

      const newStaff = new Staff({
        userId: userId,
        employeeId: employeeId,
        department: "General",
        position: "Staff Member",
        hireDate: new Date(),
        employmentType: "full_time",
        isActive: true,
        accessLevel: 1,
        permissions: ["basic_access"],
      });

      await newStaff.save();

      // Update user with staff profile reference
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            staffProfile: newStaff._id,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error ensuring staff profile:", error);
  }
}
