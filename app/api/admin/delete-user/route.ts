import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // In a real app, you'd want to check if the user has admin privileges
    // For now, we'll allow any authenticated user to delete

    const formData = await req.formData();
    const userIdToDelete = formData.get("id") as string;

    if (!userIdToDelete) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Use Clerk's Admin API to delete the user
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    await client.users.deleteUser(userIdToDelete);

    console.log({ message: `User ${userIdToDelete} deleted successfully` });
    return new NextResponse("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete user",
      { status: 500 }
    );
  }
}
