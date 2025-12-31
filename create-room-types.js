// create-room-types.js
import mongoose from "mongoose";
import { RoomType } from "./models/RoomType.js";
import dbConnect from "./lib/db.js";

const roomTypesData = [
  {
    name: "Luxury Central View",
    code: "LUX-CENTRAL",
    category: "luxury",
    description: "Premium luxury accommodation with central shahr-e-naw view",
    maxOccupancy: 2,
    basePrice: 250.0,
    amenities: [
      "WiFi",
      "Air Conditioning",
      "Minibar",
      "Room Service",
      "Concierge",
    ],
    premiumAmenities: ["Jacuzzi", "Balcony", "City View", "Premium Bedding"],
    size: "45 sqm",
    bedType: "King Size",
    viewType: "central shahr-e-naw view",
    smokingAllowed: false,
    rating: 5,
    isActive: true,
  },
  {
    name: "Executive Commercial",
    code: "EXEC-COM",
    category: "executive",
    description: "Executive rooms with commercial district view",
    maxOccupancy: 2,
    basePrice: 180.0,
    amenities: [
      "WiFi",
      "Air Conditioning",
      "Work Desk",
      "Business Center Access",
    ],
    premiumAmenities: [
      "City View",
      "Executive Lounge Access",
      "Premium Coffee",
    ],
    size: "35 sqm",
    bedType: "Queen Size",
    viewType: "commercial district view",
    smokingAllowed: false,
    rating: 4,
    isActive: true,
  },
  {
    name: "Standard City Comfort",
    code: "STD-CITY",
    category: "standard",
    description: "Comfortable standard rooms with city amenities",
    maxOccupancy: 2,
    basePrice: 120.0,
    amenities: ["WiFi", "Air Conditioning", "TV", "Private Bathroom"],
    premiumAmenities: ["City View", "Coffee Maker"],
    size: "25 sqm",
    bedType: "Double Bed",
    viewType: "city comfort",
    smokingAllowed: false,
    rating: 3,
    isActive: true,
  },
  {
    name: "Family City Stay",
    code: "FAM-CITY",
    category: "family",
    description: "Spacious family rooms for city family stay",
    maxOccupancy: 4,
    basePrice: 160.0,
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Mini Fridge",
      "Extra Beds Available",
    ],
    premiumAmenities: ["City View", "Family Amenities", "Kids Welcome Kit"],
    size: "40 sqm",
    bedType: "Double + Single",
    viewType: "city family stay",
    smokingAllowed: false,
    rating: 4,
    isActive: true,
  },
];

async function createRoomTypes() {
  try {
    await dbConnect();

    console.log("Creating room types...");

    for (const roomTypeData of roomTypesData) {
      // Check if room type already exists
      const existingRoomType = await RoomType.findOne({
        code: roomTypeData.code,
      });

      if (existingRoomType) {
        console.log(
          `Room type ${roomTypeData.code} already exists, skipping...`
        );
        continue;
      }

      // Create new room type
      const roomType = new RoomType(roomTypeData);
      await roomType.save();
      console.log(
        `Created room type: ${roomTypeData.name} (${roomTypeData.code})`
      );
    }

    console.log("Room types creation completed!");

    // Display all created room types
    const allRoomTypes = await RoomType.find({}).sort({ category: 1, name: 1 });
    console.log("\nAll Room Types:");
    allRoomTypes.forEach((roomType) => {
      console.log(
        `- ${roomType.name} (${roomType.category}): ${roomType.viewType}`
      );
    });
  } catch (error) {
    console.error("Error creating room types:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
createRoomTypes();
