// lib/auth.ts - Helper functions for authentication
import { auth, clerkClient } from "@clerk/nextjs/server";
import { User, Staff } from "@/models";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    // Get user from Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);

    // Import models and connect to database
    const { User } = await import("@/models");
    const dbConnect = (await import("@/lib/db")).default;
    await dbConnect();

    // Get user from database
    let dbUser = await User.findOne({ _id: userId });

    // If user doesn't exist in database, create them (fallback mechanism)
    if (!dbUser) {
      console.log(
        `🔄 User ${userId} not found in database, creating from Clerk data...`
      );

      // Extract user data from Clerk
      const primaryEmail =
        clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        "";

      const firstName = clerkUser.firstName || "";
      const lastName = clerkUser.lastName || "";
      const fullName =
        `${firstName} ${lastName}`.trim() || clerkUser.username || "Guest";

      // Get role and approval status from metadata
      const metadata = clerkUser.publicMetadata || {};
      const userRole = metadata.role || "guest";
      const isApproved = metadata.approved === true;

      const userData = {
        _id: userId,
        name: fullName,
        email: primaryEmail,
        emailVerified:
          clerkUser.emailAddresses[0]?.verification?.status === "verified",
        image: clerkUser.imageUrl,
        role: userRole,
        approved: isApproved,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        isActive: !clerkUser.banned,
      };

      const newUser = new User(userData);
      await newUser.save();
      console.log(`✅ User ${userId} created in database successfully`);

      dbUser = newUser;
    }

    // Combine data from Clerk and database
    return {
      id: userId,
      clerkUser: clerkUser,
      dbUser: dbUser.toObject(),
      metadata: clerkUser.publicMetadata as {
        role?: "guest" | "staff" | "admin";
        approved?: boolean;
      },
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  return userId;
}

export async function requireRole(requiredRole: "guest" | "staff" | "admin") {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (!user.metadata.approved) {
    throw new Error("User not approved");
  }

  const userRole = user.metadata.role || "guest";

  // Check hierarchy: admin > staff > guest
  const roleHierarchy = {
    guest: ["guest"],
    staff: ["staff", "admin"],
    admin: ["admin"],
  };

  if (!roleHierarchy[requiredRole].includes(userRole)) {
    throw new Error(
      `Insufficient permissions. Required: ${requiredRole}, Has: ${userRole}`
    );
  }

  return user;
}

export async function updateUserRole(
  userId: string,
  role: "guest" | "staff" | "admin"
) {
  try {
    // Update Clerk metadata
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: {
        role,
        approved: role === "guest" ? true : false, // Guests auto-approved, staff/admin need approval
      },
    });

    // Update database
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role,
          approved: role === "guest",
        },
      }
    );

    // If assigning staff role, ensure staff profile exists
    if (role === "staff") {
      const existingStaff = await Staff.findOne({ userId });

      if (!existingStaff) {
        await ensureStaffProfile(userId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

export async function approveUser(userId: string) {
  try {
    // Get current metadata
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const currentRole = (clerkUser.publicMetadata as any)?.role || "guest";

    // Update Clerk metadata
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        approved: true,
      },
    });

    // Update database
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          approved: true,
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
}

// Helper function to ensure staff profile exists
async function ensureStaffProfile(userId: string) {
  try {
    const existingStaff = await Staff.findOne({ userId });
    if (!existingStaff) {
      const user = await User.findOne({ _id: userId });
      if (user) {
        await Staff.create({
          userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: "General",
          position: "Staff",
          hireDate: new Date(),
          isActive: true,
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring staff profile:", error);
    throw error;
  }
}
