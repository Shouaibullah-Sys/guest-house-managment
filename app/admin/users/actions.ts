"use server";

import { clerkClient } from "@clerk/nextjs/server";
// import { checkRole } from "./utils";

export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(formData.get("id") as string, {
      publicMetadata: { role: formData.get("role") },
    });
    console.log({ message: res.publicMetadata });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

// Laboratory Management System Roles
export async function setLaboratoryRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(formData.get("id") as string, {
      publicMetadata: { role: formData.get("role") },
    });
    console.log({ message: res.publicMetadata });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function removeRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(formData.get("id") as string, {
      publicMetadata: { role: null },
    });
    console.log({ message: res.publicMetadata });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

export async function deleteUser(formData: FormData): Promise<void> {
  const client = await clerkClient();

  try {
    const userId = formData.get("id") as string;
    await client.users.deleteUser(userId);
    console.log({ message: `User ${userId} deleted successfully` });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}

// API route handler for DELETE requests
export async function DELETE(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const userId = formData.get("id") as string;

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    console.log({ message: `User ${userId} deleted successfully` });
    return new Response("User deleted successfully", { status: 200 });
  } catch (err) {
    console.error("Error deleting user:", err);
    return new Response(
      err instanceof Error ? err.message : "Failed to delete user",
      { status: 500 }
    );
  }
}
