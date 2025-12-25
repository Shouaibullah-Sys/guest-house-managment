// sync-clerk-users.js - Sync existing Clerk users to MongoDB
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import { User } from "@/models";

export async function syncClerkUsers() {
  try {
    console.log("🚀 Starting Clerk users sync process...");

    // Connect to database
    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    // Get Clerk client
    const client = await clerkClient();
    console.log("✅ Clerk client initialized");

    // Get all users from Clerk
    console.log("📥 Fetching users from Clerk...");
    const clerkUsers = await client.users.getUserList({
      limit: 100, // Adjust as needed
    });

    console.log(`📊 Found ${clerkUsers.data.length} users in Clerk`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each user
    for (const clerkUser of clerkUsers.data) {
      try {
        console.log(
          `\n👤 Processing user: ${
            clerkUser.emailAddresses[0]?.emailAddress || "No email"
          }`
        );

        // Check if user already exists in database
        const existingUser = await User.findOne({ _id: clerkUser.id });

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
          _id: clerkUser.id,
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

        if (existingUser) {
          // Update existing user
          console.log(`✏️ User exists, updating...`);
          await User.findOneAndUpdate(
            { _id: clerkUser.id },
            { $set: userData }
          );
          updatedCount++;
        } else {
          // Create new user
          console.log(`➕ User doesn't exist, creating...`);
          const newUser = new User(userData);
          await newUser.save();
          createdCount++;
        }
      } catch (userError) {
        const errorMessage =
          userError instanceof Error ? userError.message : String(userError);
        console.error(
          `❌ Error processing user ${clerkUser.id}:`,
          errorMessage
        );
        skippedCount++;
      }
    }

    // Final statistics
    console.log(`\n🎯 Sync completed!`);
    console.log(`✅ Created: ${createdCount} users`);
    console.log(`✏️ Updated: ${updatedCount} users`);
    console.log(`⚠️ Skipped: ${skippedCount} users`);
    console.log(`📊 Total processed: ${clerkUsers.data.length} users`);

    // Show final user count in database
    const totalDbUsers = await User.countDocuments({});
    console.log(`📈 Total users in database: ${totalDbUsers}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("💥 Sync failed:", errorMessage);
    throw error;
  }
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncClerkUsers()
    .then(() => {
      console.log("🎉 Sync process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("💥 Sync process failed:", errorMessage);
      process.exit(1);
    });
}
