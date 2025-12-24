#!/usr/bin/env node

// create-sample-guests.js
// Script to create sample guest data for testing PDF generation

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Import User model
const User = require("./models/User").default;

const sampleGuests = [
  {
    _id: uuidv4(),
    name: "احمد محمدی",
    email: "ahmed.mohammadi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 700 123 456",
    nationality: "افغان",
    city: "کابل",
    country: "افغانستان",
    totalStays: 5,
    totalSpent: 25000,
    isActive: true,
    loyaltyPoints: 150,
    createdAt: new Date("2024-12-20T10:30:00Z"),
    updatedAt: new Date("2024-12-20T10:30:00Z"),
  },
  {
    _id: uuidv4(),
    name: "فاطمة احمدی",
    email: "fatima.ahmadi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 701 234 567",
    nationality: "افغان",
    city: "هرات",
    country: "افغانستان",
    totalStays: 2,
    totalSpent: 8000,
    isActive: true,
    loyaltyPoints: 75,
    createdAt: new Date("2024-12-21T14:15:00Z"),
    updatedAt: new Date("2024-12-21T14:15:00Z"),
  },
  {
    _id: uuidv4(),
    name: "محمد علی رضایی",
    email: "mohammad.ali.rezaei@example.com",
    role: "guest",
    approved: true,
    phone: "+93 702 345 678",
    nationality: "ایرانی",
    city: "مشهد",
    country: "ایران",
    totalStays: 8,
    totalSpent: 45000,
    isActive: true,
    loyaltyPoints: 300,
    createdAt: new Date("2024-12-19T09:45:00Z"),
    updatedAt: new Date("2024-12-19T09:45:00Z"),
  },
  {
    _id: uuidv4(),
    name: "زهرا سعیدی",
    email: "zahra.saidi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 703 456 789",
    nationality: "افغان",
    city: "قندهار",
    country: "افغانستان",
    totalStays: 1,
    totalSpent: 3500,
    isActive: false,
    loyaltyPoints: 25,
    createdAt: new Date("2024-12-22T16:20:00Z"),
    updatedAt: new Date("2024-12-22T16:20:00Z"),
  },
  {
    _id: uuidv4(),
    name: "حسین احمدی",
    email: "hosein.ahmadi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 704 567 890",
    nationality: "افغان",
    city: "کابل",
    country: "افغانستان",
    totalStays: 12,
    totalSpent: 72000,
    isActive: true,
    loyaltyPoints: 500,
    createdAt: new Date("2024-12-18T11:00:00Z"),
    updatedAt: new Date("2024-12-18T11:00:00Z"),
  },
  {
    _id: uuidv4(),
    name: "نرگس محمدی",
    email: "narges.mohammadi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 705 678 901",
    nationality: "افغان",
    city: "بلخ",
    country: "افغانستان",
    totalStays: 3,
    totalSpent: 12500,
    isActive: true,
    loyaltyPoints: 90,
    createdAt: new Date("2024-12-23T13:30:00Z"),
    updatedAt: new Date("2024-12-23T13:30:00Z"),
  },
  {
    _id: uuidv4(),
    name: "عبدالله سادات",
    email: "abdullah.sadat@example.com",
    role: "guest",
    approved: true,
    phone: "+93 706 789 012",
    nationality: "افغان",
    city: "کابل",
    country: "افغانستان",
    totalStays: 6,
    totalSpent: 28500,
    isActive: true,
    loyaltyPoints: 180,
    createdAt: new Date("2024-12-17T08:45:00Z"),
    updatedAt: new Date("2024-12-17T08:45:00Z"),
  },
  {
    _id: uuidv4(),
    name: "فروغ احمدی",
    email: "forugh.ahmadi@example.com",
    role: "guest",
    approved: true,
    phone: "+93 707 890 123",
    nationality: "افغان",
    city: "کابل",
    country: "افغانستان",
    totalStays: 4,
    totalSpent: 18000,
    isActive: false,
    loyaltyPoints: 120,
    createdAt: new Date("2024-12-24T07:15:00Z"),
    updatedAt: new Date("2024-12-24T07:15:00Z"),
  },
];

async function createSampleGuests() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-management";

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing guest data
    console.log("🧹 Clearing existing guest data...");
    await User.deleteMany({ role: "guest" });
    console.log("✅ Cleared existing guests");

    // Create sample guests
    console.log("📝 Creating sample guests...");
    const createdGuests = await User.insertMany(sampleGuests);
    console.log(`✅ Created ${createdGuests.length} sample guests`);

    // Display created guests
    console.log("\n📊 Created Guests Summary:");
    console.log(
      "Name".padEnd(25) +
        "Email".padEnd(30) +
        "Nationality".padEnd(15) +
        "Total Spent"
    );
    console.log("-".repeat(85));

    createdGuests.forEach((guest) => {
      console.log(
        guest.name.padEnd(25) +
          guest.email.padEnd(30) +
          (guest.nationality || "N/A").padEnd(15) +
          `${guest.totalSpent} AFN`
      );
    });

    // Calculate summary statistics
    const totalGuests = createdGuests.length;
    const activeGuests = createdGuests.filter((g) => g.isActive).length;
    const totalSpent = createdGuests.reduce((sum, g) => sum + g.totalSpent, 0);
    const totalStays = createdGuests.reduce((sum, g) => sum + g.totalStays, 0);

    console.log("\n📈 Statistics:");
    console.log(`Total Guests: ${totalGuests}`);
    console.log(`Active Guests: ${activeGuests}`);
    console.log(`Total Revenue: ${totalSpent.toLocaleString()} AFN`);
    console.log(`Total Stays: ${totalStays}`);
    console.log(
      `Average Spent: ${Math.round(
        totalSpent / totalGuests
      ).toLocaleString()} AFN`
    );

    console.log("\n✨ Sample guest data created successfully!");
    console.log("You can now test the PDF generation with real data.");
    console.log("\nTo test PDF generation:");
    console.log("1. Start your development server: npm run dev");
    console.log("2. Go to /admin/reports/daily-guests");
    console.log('3. Select a date and click "دانلود PDF"');
  } catch (error) {
    console.error("❌ Error creating sample guests:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  createSampleGuests();
}

module.exports = { createSampleGuests, sampleGuests };
