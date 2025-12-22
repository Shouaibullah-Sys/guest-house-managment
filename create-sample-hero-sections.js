// create-sample-hero-sections.js - Create sample hero sections for testing
const mongoose = require("mongoose");

// Hero Section Schema (simplified)
const heroSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imagePath: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, required: true },
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);

const HeroSection = mongoose.model("HeroSection", heroSectionSchema);

async function createSampleHeroSections() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://abdulsaboorsaboor2024_db_user:Ys06zatNEfnnBNlw@guesthouse.xhk9jjk.mongodb.net/?appName=GuestHouse"
    );
    console.log("✅ Connected to MongoDB successfully");

    // Check if we already have hero sections
    const existingCount = await HeroSection.countDocuments({ isActive: true });
    if (existingCount > 0) {
      console.log(
        `📋 Found ${existingCount} existing hero sections. Skipping creation.`
      );
      return;
    }

    // Sample hero sections data
    const sampleHeroSections = [
      {
        title: "Luxury Mountain Resort",
        description:
          "Experience breathtaking alpine views and world-class hospitality in our exclusive mountain resort. Perfect for romantic getaways and adventure seekers.",
        location: "Swiss Alps, Switzerland",
        imageUrl:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
        imagePath: "/uploads/hero/luxury-mountain.jpg",
        isActive: true,
        displayOrder: 0,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        title: "Beach Paradise Resort",
        description:
          "Wake up to the sound of waves and pristine white sand beaches. Our tropical paradise offers the ultimate relaxation experience with luxury amenities.",
        location: "Maldives",
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
        imagePath: "/uploads/hero/beach-paradise.jpg",
        isActive: true,
        displayOrder: 1,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        title: "Historic City Boutique Hotel",
        description:
          "Step into history with our carefully restored boutique hotel in the heart of an ancient city. Modern comfort meets timeless elegance.",
        location: "Rome, Italy",
        imageUrl:
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
        imagePath: "/uploads/hero/historic-boutique.jpg",
        isActive: true,
        displayOrder: 2,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        title: "Desert Oasis Retreat",
        description:
          "Escape to our luxurious desert oasis where traditional architecture meets modern comfort under a canopy of stars.",
        location: "Dubai, UAE",
        imageUrl:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
        imagePath: "/uploads/hero/desert-oasis.jpg",
        isActive: true,
        displayOrder: 3,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        title: "Tropical Rainforest Lodge",
        description:
          "Immerse yourself in nature at our eco-friendly rainforest lodge, where sustainable luxury meets extraordinary wildlife experiences.",
        location: "Costa Rica",
        imageUrl:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
        imagePath: "/uploads/hero/rainforest-lodge.jpg",
        isActive: true,
        displayOrder: 4,
        createdBy: "system",
        updatedBy: "system",
      },
    ];

    console.log("\n➕ Creating sample hero sections...");

    // Insert all sample hero sections
    const createdSections = await HeroSection.insertMany(sampleHeroSections);

    console.log("✅ Sample hero sections created successfully!");
    console.log(`📊 Created ${createdSections.length} hero sections:`);

    createdSections.forEach((section, index) => {
      console.log(`  ${index + 1}. ${section.title} - ${section.location}`);
      console.log(
        `     Description: ${section.description.substring(0, 80)}...`
      );
      console.log(`     Image URL: ${section.imageUrl}`);
      console.log(`     Display Order: ${section.displayOrder}`);
      console.log("");
    });

    // Verify the data was saved correctly
    console.log("🔍 Verifying data in database...");
    const savedSections = await HeroSection.find({ isActive: true }).sort({
      displayOrder: 1,
    });
    console.log(
      `✅ Database contains ${savedSections.length} active hero sections`
    );

    console.log("\n🎉 Sample hero sections created successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Start your Next.js development server: npm run dev");
    console.log("2. Visit the homepage to see your hero sections");
    console.log("3. Visit /admin/hero-section to manage hero sections");
    console.log(
      "4. Check the browser console for debug messages about data source"
    );
  } catch (error) {
    console.error("❌ Error creating sample hero sections:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createSampleHeroSections();
