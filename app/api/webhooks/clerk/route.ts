// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { User, Staff } from "@/models";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Webhook received - Starting processing...");

    // Ensure database connection
    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected successfully");

    // Get the headers
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing svix headers");
      return new NextResponse("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);
    console.log("📝 Raw webhook payload received");

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ No webhook secret configured");
      return new NextResponse("Error occurred -- no webhook secret", {
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
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return new NextResponse("Error occurred verifying webhook", {
        status: 400,
      });
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log(`🎯 Processing event type: ${eventType}`);

    switch (eventType) {
      case "user.created":
        console.log("👤 User created event - calling handler...");
        // Handle user creation - sync with database
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        console.log("✏️ User updated event - calling handler...");
        // Handle user update - sync with database
        await handleUserUpdated(evt.data);
        break;

      case "user.deleted":
        console.log("🗑️ User deleted event - calling handler...");
        // Handle user deletion - sync with database
        await handleUserDeleted(evt.data);
        break;

      case "session.created":
        // Handle session creation (optional logging)
        console.log("🔐 Session created:", evt.data.user_id);
        break;

      case "session.ended":
        // Handle session end (optional logging)
        console.log("🔓 Session ended:", evt.data.user_id);
        break;

      default:
        console.log(`❓ Unhandled event type: ${eventType}`);
    }

    console.log("✅ Webhook processing completed successfully");
    return NextResponse.json({
      message: "Webhook received successfully",
      event: eventType,
    });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

// ==================== Helper Functions ====================

async function handleUserCreated(clerkUser: any) {
  try {
    console.log("👤 Starting user creation process:", {
      id: clerkUser.id,
      email: clerkUser.email_addresses?.[0]?.email_address,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
    });

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Extract user data from Clerk
    const email = clerkUser.email_addresses?.find(
      (email: any) => email.id === clerkUser.primary_email_address_id
    )?.email_address;

    const firstName = clerkUser.first_name || "";
    const lastName = clerkUser.last_name || "";
    const fullName =
      `${firstName} ${lastName}`.trim() || clerkUser.username || "Guest";

    console.log("📋 Extracted user data:", { fullName, email });

    // Check if user already exists in database (in case of race conditions)
    console.log("🔍 Checking if user exists in database...");
    const existingUser = await User.findOne({ _id: clerkUser.id });

    if (existingUser) {
      console.log(`⚠️ User ${clerkUser.id} already exists in database`);
      return;
    }

    console.log("✅ User does not exist, proceeding with creation...");

    // Determine default role
    const defaultRole = "guest";
    const isApproved = defaultRole === "guest"; // Guests are auto-approved

    console.log("🎭 Assigning role:", { defaultRole, isApproved });

    // Create user in database
    const userData = {
      _id: clerkUser.id,
      name: fullName,
      email: email || "",
      emailVerified:
        clerkUser.email_addresses?.[0]?.verification?.status === "verified",
      image: clerkUser.image_url,
      role: defaultRole,
      approved: isApproved,
      phone: clerkUser.phone_numbers?.[0]?.phone_number || null,
      isActive: true,
    };

    console.log("💾 Saving user to database:", userData);
    const newUser = new User(userData);
    await newUser.save();
    console.log("✅ User saved to database successfully!");

    console.log(
      `🎉 User ${clerkUser.id} added to database with role: ${defaultRole}`
    );

    // Update Clerk metadata with our role
    console.log("🔄 Updating Clerk metadata...");
    await client.users.updateUser(clerkUser.id, {
      publicMetadata: {
        role: defaultRole,
        approved: isApproved,
      },
    });
    console.log("✅ Clerk metadata updated successfully");

    // If email ends with hotel domain, auto-assign as staff (optional)
    if (email && email.endsWith("@yourhotel.com")) {
      console.log("🏨 Hotel email detected, assigning staff role...");
      await assignStaffRole(client, clerkUser.id);
    }

    console.log("🎆 User creation process completed successfully!");
  } catch (error) {
    console.error("💥 Error handling user.created:", error);
    console.error(
      "💥 Error details:",
      "Error occurred during user creation process"
    );
    throw error;
  }
}

async function handleUserUpdated(clerkUser: any) {
  try {
    console.log("User updated:", clerkUser.id);

    // Extract updated data
    const email = clerkUser.email_addresses?.find(
      (email: any) => email.id === clerkUser.primary_email_address_id
    )?.email_address;

    const firstName = clerkUser.first_name || "";
    const lastName = clerkUser.last_name || "";
    const fullName =
      `${firstName} ${lastName}`.trim() || clerkUser.username || "Guest";

    const metadata = clerkUser.public_metadata || {};
    const userRole = metadata.role || "guest";
    const isApproved = metadata.approved === true;

    // Update user in database
    await User.findOneAndUpdate(
      { _id: clerkUser.id },
      {
        $set: {
          name: fullName,
          email: email || "",
          emailVerified:
            clerkUser.email_addresses?.[0]?.verification?.status === "verified",
          image: clerkUser.image_url,
          role: userRole,
          approved: isApproved,
          phone: clerkUser.phone_numbers?.[0]?.phone_number || null,
        },
      }
    );

    console.log(`User ${clerkUser.id} updated in database`);

    // Handle role-specific updates
    if (userRole === "staff") {
      await ensureStaffProfile(clerkUser.id);
    }
  } catch (error) {
    console.error("Error handling user.updated:", error);
    throw error;
  }
}

async function handleUserDeleted(clerkUser: any) {
  try {
    console.log("User deleted:", clerkUser.id);

    // Soft delete: mark user as inactive in database
    await User.findOneAndUpdate(
      { _id: clerkUser.id },
      {
        $set: {
          isActive: false,
        },
      }
    );

    console.log(`User ${clerkUser.id} marked as inactive in database`);
  } catch (error) {
    console.error("Error handling user.deleted:", error);
    throw error;
  }
}

async function assignStaffRole(clerkClient: any, userId: string) {
  try {
    // Update Clerk metadata to staff
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "staff",
        approved: true,
      },
    });

    // Update database
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role: "staff",
          approved: true,
        },
      }
    );

    console.log(`User ${userId} auto-assigned as staff`);

    // Create staff profile if not exists
    await ensureStaffProfile(userId);
  } catch (error) {
    console.error("Error assigning staff role:", error);
  }
}

async function ensureStaffProfile(userId: string) {
  try {
    // Check if staff profile already exists
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

      console.log(
        `Staff profile created for user ${userId} with ID: ${employeeId}`
      );
    }
  } catch (error) {
    console.error("Error ensuring staff profile:", error);
  }
}

// Optional: Add GET method for testing/verification
export async function GET() {
  return NextResponse.json({
    message: "Clerk webhook endpoint is active",
    status: "ok",
  });
}
