// lib/user-management.ts - User role management utilities
import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@/models";
import dbConnect from "@/lib/db";

export interface UserRoleInfo {
  id: string;
  email: string;
  name: string;
  clerkRole?: string;
  clerkApproved?: boolean;
  dbRole?: string;
  dbApproved?: boolean;
  isActive: boolean;
  lastSignInAt?: number;
  createdAt: number;
  issues: string[];
}

/**
 * Get comprehensive user information from both Clerk and Database
 */
export async function getUserRoleInfo(
  userId: string
): Promise<UserRoleInfo | null> {
  try {
    await dbConnect();

    // Get user from Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);

    // Get user from database
    const dbUser = await User.findOne({ _id: userId });

    const clerkRole = clerkUser.publicMetadata?.role as string | undefined;
    const clerkApproved = clerkUser.publicMetadata?.approved as
      | boolean
      | undefined;

    const issues: string[] = [];

    // Check for issues
    if (!clerkRole) {
      issues.push("No role set in Clerk metadata");
    }

    if (clerkApproved === undefined) {
      issues.push("No approval status in Clerk metadata");
    }

    if (!dbUser) {
      issues.push("User not found in database");
    } else {
      if (dbUser.role !== clerkRole) {
        issues.push(`Role mismatch: Clerk=${clerkRole}, DB=${dbUser.role}`);
      }

      if (dbUser.approved !== clerkApproved) {
        issues.push(
          `Approval mismatch: Clerk=${clerkApproved}, DB=${dbUser.approved}`
        );
      }
    }

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "No email",
      name:
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "No name",
      clerkRole,
      clerkApproved,
      dbRole: dbUser?.role,
      dbApproved: dbUser?.approved,
      isActive: !clerkUser.banned && dbUser?.isActive !== false,
      lastSignInAt: clerkUser.lastSignInAt,
      createdAt: clerkUser.createdAt,
      issues,
    };
  } catch (error) {
    console.error("Error getting user role info:", error);
    return null;
  }
}

/**
 * Fix user role synchronization between Clerk and Database
 */
export async function syncUserRole(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userInfo = await getUserRoleInfo(userId);

    if (!userInfo) {
      return { success: false, message: "User not found" };
    }

    // If user doesn't exist in database, create them
    if (!userInfo.dbRole) {
      await createUserFromClerk(userId);
      return { success: true, message: "User created in database" };
    }

    // Sync role and approval status from Clerk to database
    if (userInfo.clerkRole && userInfo.clerkApproved !== undefined) {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            role: userInfo.clerkRole,
            approved: userInfo.clerkApproved,
          },
        }
      );

      return { success: true, message: "User role synchronized" };
    }

    return { success: false, message: "Cannot sync: missing Clerk metadata" };
  } catch (error) {
    console.error("Error syncing user role:", error);
    return { success: false, message: "Database error occurred" };
  }
}

/**
 * Create user in database from Clerk data
 */
async function createUserFromClerk(userId: string): Promise<void> {
  const clerkUser = await (await clerkClient()).users.getUser(userId);

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
}

/**
 * Set user role and approval status
 */
export async function setUserRole(
  userId: string,
  role: "guest" | "staff" | "admin",
  approved?: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    const isApproved = approved !== undefined ? approved : role === "guest";

    // Update Clerk metadata
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: {
        role,
        approved: isApproved,
      },
    });

    // Update database
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role,
          approved: isApproved,
        },
      }
    );

    return { success: true, message: `User role set to ${role}` };
  } catch (error) {
    console.error("Error setting user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
}

/**
 * Approve user account
 */
export async function approveUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    // Get current role
    const userInfo = await getUserRoleInfo(userId);
    if (!userInfo) {
      return { success: false, message: "User not found" };
    }

    const role = userInfo.clerkRole || "guest";

    // Update Clerk metadata
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: {
        ...{ role },
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

    return { success: true, message: "User approved successfully" };
  } catch (error) {
    console.error("Error approving user:", error);
    return { success: false, message: "Failed to approve user" };
  }
}

/**
 * Get all users with role information
 */
export async function getAllUsersWithRoles(): Promise<UserRoleInfo[]> {
  try {
    await dbConnect();

    // Get all users from Clerk
    const clerkUsers = await (await clerkClient()).users.getUserList();

    const usersWithRoles: UserRoleInfo[] = [];

    for (const clerkUser of clerkUsers.data) {
      const userInfo = await getUserRoleInfo(clerkUser.id);
      if (userInfo) {
        usersWithRoles.push(userInfo);
      }
    }

    return usersWithRoles;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

/**
 * Diagnose common authentication issues
 */
export function diagnoseAuthIssue(userInfo: UserRoleInfo): string[] {
  const diagnosis: string[] = [];

  if (!userInfo.clerkRole) {
    diagnosis.push("❌ User has no role in Clerk metadata");
    diagnosis.push("   → Solution: Set role using admin panel or API");
  }

  if (userInfo.clerkApproved === false) {
    diagnosis.push("❌ User is not approved");
    diagnosis.push("   → Solution: Approve user in admin panel");
  }

  if (userInfo.clerkRole && userInfo.clerkRole !== "admin") {
    diagnosis.push("❌ User does not have admin role");
    diagnosis.push(`   → Current role: ${userInfo.clerkRole}`);
    diagnosis.push("   → Solution: Change role to 'admin'");
  }

  if (userInfo.issues.length > 0) {
    diagnosis.push("⚠️ Data synchronization issues detected:");
    userInfo.issues.forEach((issue) => {
      diagnosis.push(`   • ${issue}`);
    });
    diagnosis.push("   → Solution: Run syncUserRole() function");
  }

  if (diagnosis.length === 0) {
    diagnosis.push("✅ User appears to have correct permissions");
  }

  return diagnosis;
}
