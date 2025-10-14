import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new NextResponse("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new NextResponse("Error occured -- no webhook secret", {
        status: 400,
      });
    }

    // Verify the webhook
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new NextResponse("Error occured", {
        status: 400,
      });
    }

    // Handle the webhook event
    const eventType = evt.type;

    console.log(`Received webhook event: ${eventType}`);

    switch (eventType) {
      case "user.created":
        // Handle user creation - set default role to patient
        console.log("User created:", evt.data);

        try {
          const { clerkClient } = await import("@clerk/nextjs/server");
          const client = await clerkClient();

          // Set default role to patient for new users
          await client.users.updateUser(evt.data.id, {
            publicMetadata: { role: "patient" },
          });

          console.log(
            `Default role 'patient' assigned to user: ${evt.data.id}`
          );
        } catch (error) {
          console.error("Error setting default role:", error);
        }
        break;

      case "user.updated":
        // Handle user update
        console.log("User updated:", evt.data);

        // Log role changes for audit purposes
        if (evt.data.public_metadata && evt.data.public_metadata.role) {
          console.log(`User role updated to: ${evt.data.public_metadata.role}`);
        }
        break;

      case "user.deleted":
        // Handle user deletion
        console.log("User deleted:", evt.data);
        break;

      case "session.created":
        // Handle session creation
        console.log("Session created:", evt.data);
        break;

      case "session.ended":
        // Handle session end
        console.log("Session ended:", evt.data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
