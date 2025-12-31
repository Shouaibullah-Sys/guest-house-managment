// lib/user-utils.ts
import { User } from "@/models";
import { clerkClient } from "@clerk/nextjs/server";

export async function findOrCreateUser(clerkUserId: string) {
  // Try to find user by _id
  let user = await User.findOne({ _id: clerkUserId });

  if (!user) {
    // Try to find user by clerkId
    user = await User.findOne({ clerkId: clerkUserId });
  }

  if (!user) {
    // Create new user from Clerk data
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses.find(
      (email: any) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    const firstName = clerkUser.firstName || "";
    const lastName = clerkUser.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Guest";
    const metadata = clerkUser.publicMetadata || {};

    user = new User({
      _id: clerkUserId,
      clerkId: clerkUserId, // Store both for redundancy
      name: fullName,
      email: email || "",
      role: metadata.role || "guest",
      approved: metadata.approved !== false, // Default to true
      isActive: true,
    });

    await user.save();

    // Update Clerk metadata if needed
    if (!metadata.role || metadata.role === "") {
      await client.users.updateUser(clerkUserId, {
        publicMetadata: {
          role: "guest",
          approved: true,
        },
      });
    }
  }

  return user;
}
