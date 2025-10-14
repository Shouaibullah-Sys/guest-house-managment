import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use Clerk's Admin API to get all users
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    const users = await client.users.getUserList({
      limit: 500, // Get up to 500 users
    });

    // Transform the data to match our interface
    const transformedUsers = users.data.map((user) => ({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      emailAddresses: user.emailAddresses.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
      })),
      primaryEmailAddressId: user.primaryEmailAddressId,
      publicMetadata: user.publicMetadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
