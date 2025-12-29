// app/api/public/featured-rooms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";
import dbConnect from "@/lib/db";

// Helper function to safely convert Decimal128 to number
function convertToNumber(value: any): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return parseFloat(value.$numberDecimal);
  }
  if (value && typeof value === "object" && "toString" in value) {
    return parseFloat(value.toString());
  }
  return 0;
}

// Category mapping from room types to hotel categories
const mapRoomCategoryToHotelCategory = (roomCategory: string): string => {
  const categoryMap: Record<string, string> = {
    luxury: "luxury", // Luxury rooms
    executive: "city", // Executive rooms are typically city hotels
    standard: "resort", // Standard rooms are typically resorts
    family: "resort", // Family rooms are typically resorts
  };
  
  return categoryMap[roomCategory] || "resort";
};

// Transform amenities array to features array
const transformAmenitiesToFeatures = (amenities: string[] | null, premiumAmenities: string[] | null): string[] => {
  const features: string[] = [];
  
  if (amenities) {
    const amenityMap: Record<string, string> = {
      wifi: "Free WiFi",
      tv: "Smart TV",
      ac: "Air Conditioning",
      minibar: "Mini Bar",
      gym: "Fitness Center",
      parking: "Free Parking",
      pool: "Swimming Pool",
      spa: "Spa & Wellness",
      restaurant: "Restaurant",
      "room-service": "Room Service",
      "safe-box": "Safe Box",
      "smart-tv": "Smart TV",
      jacuzzi: "Jacuzzi",
    };
    
    amenities.forEach(amenity => {
      if (amenityMap[amenity]) {
        features.push(amenityMap[amenity]);
      }
    });
  }
  
  if (premiumAmenities) {
    const premiumAmenityMap: Record<string, string> = {
      "vip-service": "VIP Service",
      "private-pool": "Private Pool",
      "spa-suite": "Spa Suite",
      "butler-service": "Butler Service",
      "helicopter-tour": "Helicopter Tours",
      "private-dining": "Private Dining",
      "luxury-transfer": "Luxury Transfer",
    };
    
    premiumAmenities.forEach(amenity => {
      if (premiumAmenityMap[amenity]) {
        features.push(premiumAmenityMap[amenity]);
      }
    });
  }
  
  return features.slice(0, 4); // Limit to 4 features for display
};

// Get location based on view type
const getLocationFromViewType = (viewType: string): string => {
  const locationMap: Record<string, string> = {
    mountain: "Mountain Retreat",
    city: "City Center",
    garden: "Garden Resort",
    pool: "Poolside Paradise",
  };
  
  return locationMap[viewType] || "Luxury Resort";
};

// Transform room data to Hotel interface
const transformRoomToHotel = (room: any) => {
  const roomType = room.roomType;
  if (!roomType) {
    return null; // Skip rooms without room type data
  }
  
  const basePrice = roomType.basePrice;
  const priceInUSD = Math.round(basePrice / 100); // Convert from local currency to USD
  
  return {
    id: parseInt(room._id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 10000),
    name: `${roomType.name} - Room ${room.roomNumber}`,
    price: `$${priceInUSD.toLocaleString()}`,
    originalPrice: roomType.basePrice > basePrice * 1.2 ? 
      `$${Math.round(roomType.basePrice * 1.2 / 100).toLocaleString()}` : undefined,
    image: room.imageUrl || roomType.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    location: getLocationFromViewType(roomType.viewType),
    category: mapRoomCategoryToHotelCategory(roomType.category),
    rating: roomType.rating || 4.5,
    reviews: Math.floor(Math.random() * 500) + 100, // Mock review count
    features: transformAmenitiesToFeatures(roomType.amenities, roomType.premiumAmenities),
    description: roomType.description || `Luxury ${roomType.category} room with modern amenities and comfortable furnishing.`,
    maxGuests: roomType.maxOccupancy,
    rooms: 1,
    discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : undefined, // 30% chance of discount
    amenities: transformAmenitiesToFeatures(roomType.amenities, roomType.premiumAmenities),
    popular: room.status === "available" && roomType.rating >= 4.5,
    // Additional database-specific fields
    _id: room._id.toString(),
    roomNumber: room.roomNumber,
    floor: room.floor,
    status: room.status,
    roomTypeId: roomType._id.toString(),
  };
};

// GET /api/public/featured-rooms/[id] - Get a specific room/hotel by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id: hotelId } = await params;
    
    // First try to find by numeric ID (for backward compatibility)
    let room = null;
    const numericId = parseInt(hotelId);
    
    if (!isNaN(numericId)) {
      // Try to find room by generated numeric ID
      const rooms = await Room.find({ status: "available" })
        .populate({
          path: "roomType",
          model: "RoomType",
          match: { isActive: true },
          select: "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
        })
        .lean();

      // Find room with matching generated ID
      for (const r of rooms) {
        const roomId = r._id as any;
        const generatedId = parseInt(roomId.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 10000);
        if (generatedId === numericId) {
          room = r;
          break;
        }
      }
    }

    // If not found by numeric ID, try to find by MongoDB ObjectId
    if (!room) {
      try {
        room = await Room.findById(hotelId)
          .populate({
            path: "roomType",
            model: "RoomType",
            match: { isActive: true },
            select: "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
          })
          .lean();
      } catch (error) {
        // Invalid ObjectId format, continue to fallback
      }
    }

    // If still not found, try to find by room number
    if (!room) {
      room = await Room.findOne({ roomNumber: hotelId })
        .populate({
          path: "roomType",
          model: "RoomType",
          match: { isActive: true },
          select: "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
        })
        .lean();
    }

    // If not found, return 404
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Hotel/Room not found" },
        { status: 404 }
      );
    }

    // Check if room has populated roomType data
    const roomWithType = room as any;
    if (!roomWithType.roomType) {
      return NextResponse.json(
        { success: false, error: "Room type data not found" },
        { status: 404 }
      );
    }

    // Transform to hotel format
    const hotel = transformRoomToHotel(roomWithType);

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: "Invalid room data" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });

  } catch (error) {
    console.error("Error fetching room/hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch room/hotel" },
      { status: 500 }
    );
  }
}