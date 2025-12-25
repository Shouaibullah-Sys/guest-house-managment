// app/actions/user-actions.ts - Server Actions
"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { User, Staff } from "@/models";
import { revalidatePath } from "next/cache";

export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;
  const role = formData.get("role") as
    | "guest"
    | "staff"
    | "admin"
    | "laboratory"
    | "patient";
  const approved = role === "guest" || role === "patient" ? true : false; // Guests and patients auto-approved

  try {
    // Update Clerk metadata
    const res = await client.users.updateUser(userId, {
      publicMetadata: { role, approved },
    });

    // Update MongoDB user
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role,
          approved,
        },
      }
    );

    console.log({ message: res.publicMetadata });

    // If assigning staff role, ensure staff profile exists
    if (role === "staff") {
      await ensureStaffProfile(userId);
    }

    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function approveUser(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    // Get current user from Clerk to preserve existing metadata
    const clerkUser = await client.users.getUser(userId);
    const currentMetadata = clerkUser.publicMetadata as any;

    // Update Clerk metadata
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        ...currentMetadata,
        approved: true,
      },
    });

    // Update MongoDB user
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          approved: true,
        },
      }
    );

    console.log({ message: res.publicMetadata });
    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function disableUser(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    // Update Clerk to ban user
    await client.users.banUser(userId);

    // Update MongoDB user to inactive
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isActive: false,
        },
      }
    );

    console.log({ message: `User ${userId} disabled successfully` });
    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function enableUser(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    // Update Clerk to unban user
    await client.users.unbanUser(userId);

    // Update MongoDB user to active
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isActive: true,
        },
      }
    );

    console.log({ message: `User ${userId} enabled successfully` });
    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function deleteUser(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    // Delete from Clerk
    await client.users.deleteUser(userId);

    // Soft delete from MongoDB (mark as inactive and add deletedAt)
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      }
    );

    console.log({ message: `User ${userId} deleted successfully` });
    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function removeRole(formData: FormData): Promise<void> {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    // Get current user from Clerk to preserve existing metadata
    const clerkUser = await client.users.getUser(userId);
    const currentMetadata = clerkUser.publicMetadata as any;

    // Remove role from Clerk metadata
    const { role, ...otherMetadata } = currentMetadata;
    const res = await client.users.updateUser(userId, {
      publicMetadata: otherMetadata,
    });

    // Update MongoDB user to remove role
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $unset: {
          role: "",
          approved: "",
        },
      }
    );

    console.log({ message: res.publicMetadata });
    revalidatePath("/admin/users");
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
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

      console.log(`Staff profile created for user ${userId}`);
    }
  } catch (error) {
    console.error("Error ensuring staff profile:", error);
  }
}
