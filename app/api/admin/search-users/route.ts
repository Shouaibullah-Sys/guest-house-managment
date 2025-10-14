import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // In a real app, you'd want to check if the user has admin privileges
    // For now, we'll allow any authenticated user to search

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    // Use Clerk's Admin API to search users
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    const users = await client.users.getUserList({
      query: query,
      limit: 50, // Limit results for performance
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
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
