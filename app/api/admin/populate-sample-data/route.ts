// app/api/admin/populate-sample-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// POST /api/admin/populate-sample-data - Populate sample room and room type data
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Room.deleteMany({});
    await RoomType.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create sample room types
    console.log("🏨 Creating sample room types...");
    const roomTypes = [
      {
        name: "Deluxe Mountain View Suite",
        code: "DLX-MTN",
        category: "luxury",
        description: "Luxurious suite with panoramic mountain views, featuring a private balcony and premium amenities.",
        maxOccupancy: 4,
        basePrice: new mongoose.Types.Decimal128("25000"), // Afghani
        extraPersonPrice: new mongoose.Types.Decimal128("5000"),
        amenities: ["wifi", "tv", "ac", "minibar", "gym", "parking", "spa", "restaurant", "room-service", "safe-box", "smart-tv"],
        premiumAmenities: ["vip-service", "spa-suite", "butler-service", "private-dining"],
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
        ],
        size: "55 m²",
        bedType: "King Size Bed",
        viewType: "mountain",
        smokingAllowed: false,
        isActive: true,
        rating: 4.8,
      },
      {
        name: "Executive City Room",
        code: "EXE-CITY",
        category: "executive",
        description: "Modern executive room in the heart of the city with business amenities and city views.",
        maxOccupancy: 2,
        basePrice: new mongoose.Types.Decimal128("18000"),
        extraPersonPrice: new mongoose.Types.Decimal128("3500"),
        amenities: ["wifi", "tv", "ac", "minibar", "gym", "parking", "room-service", "safe-box", "smart-tv"],
        premiumAmenities: ["vip-service", "luxury-transfer"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
        ],
        size: "35 m²",
        bedType: "Queen Size Bed",
        viewType: "city",
        smokingAllowed: false,
        isActive: true,
        rating: 4.6,
      },
      {
        name: "Family Garden Suite",
        code: "FAM-GRD",
        category: "family",
        description: "Spacious family suite with garden views, perfect for families with children.",
        maxOccupancy: 6,
        basePrice: new mongoose.Types.Decimal128("22000"),
        extraPersonPrice: new mongoose.Types.Decimal128("4000"),
        amenities: ["wifi", "tv", "ac", "minibar", "parking", "pool", "restaurant", "room-service", "safe-box"],
        premiumAmenities: ["vip-service", "private-pool"],
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop"
        ],
        size: "65 m²",
        bedType: "2 Queen Size Beds",
        viewType: "garden",
        smokingAllowed: false,
        isActive: true,
        rating: 4.5,
      },
      {
        name: "Standard Pool View",
        code: "STD-POOL",
        category: "standard",
        description: "Comfortable standard room with pool view and essential amenities.",
        maxOccupancy: 3,
        basePrice: new mongoose.Types.Decimal128("12000"),
        extraPersonPrice: new mongoose.Types.Decimal128("2500"),
        amenities: ["wifi", "tv", "ac", "minibar", "pool", "restaurant", "safe-box"],
        premiumAmenities: [],
        images: [
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop"
        ],
        size: "30 m²",
        bedType: "Double Bed",
        viewType: "pool",
        smokingAllowed: false,
        isActive: true,
        rating: 4.3,
      },
      {
        name: "Presidential Suite",
        code: "PRS-SUT",
        category: "luxury",
        description: "The ultimate in luxury accommodation with private butler service and panoramic views.",
        maxOccupancy: 4,
        basePrice: new mongoose.Types.Decimal128("50000"),
        extraPersonPrice: new mongoose.Types.Decimal128("10000"),
        amenities: ["wifi", "tv", "ac", "minibar", "gym", "parking", "spa", "restaurant", "room-service", "safe-box", "smart-tv", "jacuzzi"],
        premiumAmenities: ["vip-service", "private-pool", "spa-suite", "butler-service", "helicopter-tour", "private-dining", "luxury-transfer"],
        images: [
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506530440266-22c6d3ddcd4f?w=800&auto=format&fit=crop"
        ],
        size: "120 m²",
        bedType: "King Size Bed + Sofa Bed",
        viewType: "mountain",
        smokingAllowed: false,
        isActive: true,
        rating: 4.9,
      }
    ];

    const createdRoomTypes = await RoomType.insertMany(roomTypes);
    console.log(`✅ Created ${createdRoomTypes.length} room types`);

    // Create sample rooms
    console.log("🛏️ Creating sample rooms...");
    const rooms = [
      // Deluxe Mountain View Suite rooms
      {
        roomNumber: "101",
        roomType: createdRoomTypes[0]._id, // DLX-MTN
        floor: 1,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "102",
        roomType: createdRoomTypes[0]._id, // DLX-MTN
        floor: 1,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "201",
        roomType: createdRoomTypes[0]._id, // DLX-MTN
        floor: 2,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
      },
      // Executive City Room
      {
        roomNumber: "301",
        roomType: createdRoomTypes[1]._id, // EXE-CITY
        floor: 3,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "302",
        roomType: createdRoomTypes[1]._id, // EXE-CITY
        floor: 3,
        status: "occupied",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "401",
        roomType: createdRoomTypes[1]._id, // EXE-CITY
        floor: 4,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      },
      // Family Garden Suite
      {
        roomNumber: "103",
        roomType: createdRoomTypes[2]._id, // FAM-GRD
        floor: 1,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "104",
        roomType: createdRoomTypes[2]._id, // FAM-GRD
        floor: 1,
        status: "reserved",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
      },
      // Standard Pool View
      {
        roomNumber: "105",
        roomType: createdRoomTypes[3]._id, // STD-POOL
        floor: 1,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "106",
        roomType: createdRoomTypes[3]._id, // STD-POOL
        floor: 1,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "205",
        roomType: createdRoomTypes[3]._id, // STD-POOL
        floor: 2,
        status: "cleaning",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
      },
      // Presidential Suite
      {
        roomNumber: "501",
        roomType: createdRoomTypes[4]._id, // PRS-SUT
        floor: 5,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
      },
      {
        roomNumber: "502",
        roomType: createdRoomTypes[4]._id, // PRS-SUT
        floor: 5,
        status: "maintenance",
        imageUrl: "https://images.unsplash.com/photo-1506530440266-22c6d3ddcd4f?w=800&auto=format&fit=crop",
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Summary
    console.log("\n🎉 Sample data population completed!");
    console.log(`📊 Summary:`);
    console.log(`   • Room Types: ${createdRoomTypes.length}`);
    console.log(`   • Rooms: ${createdRooms.length}`);
    console.log(`   • Categories: luxury, executive, family, standard`);
    console.log(`   • Statuses: available, occupied, reserved, cleaning, maintenance`);

    return NextResponse.json({
      success: true,
      message: "Sample data populated successfully",
      data: {
        roomTypes: createdRoomTypes.length,
        rooms: createdRooms.length,
        availableRooms: createdRooms.filter(r => r.status === "available").length
      }
    });

  } catch (error) {
    console.error("❌ Error populating sample data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to populate sample data", details: error },
      { status: 500 }
    );
  }
}