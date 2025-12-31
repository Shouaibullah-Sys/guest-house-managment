// app/api/public/featured-rooms/route.ts
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
    luxury: "central shahr-e-naw view",
    executive: "commercial district view",
    standard: "city comfort",
    family: "city family stay",
  };

  return categoryMap[roomCategory] || "resort";
};

// Transform amenities array to features array
const transformAmenitiesToFeatures = (
  amenities: string[] | null,
  premiumAmenities: string[] | null
): string[] => {
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

    amenities.forEach((amenity: string) => {
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

    premiumAmenities.forEach((amenity: string) => {
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
const transformRoomToHotel = (room: any, index: number) => {
  const roomType = room.roomType;
  if (!roomType) {
    return null; // Skip rooms without room type data
  }

  const basePrice = roomType.basePrice;
  const priceInUSD = Math.round(basePrice / 100); // Convert from local currency to USD

  // Generate a unique ID by combining the room's ObjectID hash and room number
  const roomIdStr = room._id.toString();
  const roomNumber = room.roomNumber || 0;
  const idHash = roomIdStr.split("").reduce((a: number, b: string): number => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a;
  }, 0);
  const uniqueId = Math.abs(idHash) * 1000 + roomNumber;

  return {
    id: uniqueId,
    name: `${roomType.name} - Room ${room.roomNumber}`,
    price: `$${priceInUSD.toLocaleString()}`,
    originalPrice:
      Math.random() > 0.8
        ? `${Math.round((priceInUSD * 1.3) / 100).toLocaleString()}`
        : undefined,
    image:
      room.imageUrl ||
      roomType.images?.[0] ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    location: getLocationFromViewType(roomType.viewType),
    category: mapRoomCategoryToHotelCategory(roomType.category),
    rating: roomType.rating || 4.5,
    reviews: Math.floor(Math.random() * 500) + 100, // Mock review count
    features: transformAmenitiesToFeatures(
      roomType.amenities,
      roomType.premiumAmenities
    ),
    description:
      roomType.description ||
      `Luxury ${roomType.category} room with modern amenities and comfortable furnishing.`,
    maxGuests: roomType.maxOccupancy,
    rooms: 1,
    discount:
      Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : undefined, // 30% chance of discount
    amenities: transformAmenitiesToFeatures(
      roomType.amenities,
      roomType.premiumAmenities
    ),
    popular: room.status === "available" && roomType.rating >= 4.5,
  };
};

// Fallback hotels in case database is empty or unavailable
const getFallbackHotels = () => [
  {
    id: 1,
    name: "Luxury Mountain Suite",
    price: "$450",
    originalPrice: "$550",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    location: "Mountain Retreat",
    category: "beach",
    rating: 4.8,
    reviews: 324,
    features: ["Mountain Views", "Fireplace", "Spa", "Fine Dining"],
    description:
      "Luxury suite with panoramic mountain views and premium amenities.",
    maxGuests: 4,
    rooms: 1,
    discount: 18,
    amenities: ["Free WiFi", "Spa", "Fine Dining", "Mountain Views"],
    popular: true,
  },
  {
    id: 2,
    name: "Executive City Room",
    price: "$320",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    location: "City Center",
    category: "city",
    rating: 4.6,
    reviews: 512,
    features: ["City Views", "Business Center", "Gym", "Concierge"],
    description:
      "Modern executive room in the heart of the city with business amenities.",
    maxGuests: 2,
    rooms: 1,
    amenities: ["Free WiFi", "Business Center", "Gym", "Concierge"],
    popular: true,
  },
  {
    id: 3,
    name: "Family Resort Suite",
    price: "$280",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
    location: "Beach Resort",
    category: "resort",
    rating: 4.4,
    reviews: 287,
    features: ["Beach Access", "Kids Club", "Pool", "Family Dining"],
    description:
      "Perfect family suite with beach access and kid-friendly amenities.",
    maxGuests: 6,
    rooms: 2,
    amenities: ["Free WiFi", "Beach Access", "Kids Club", "Pool"],
    popular: false,
  },
];

// GET /api/public/featured-rooms - Get featured rooms for public display
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch available rooms with populated room type data
    const rooms = await Room.find({ status: "available" })
      .populate({
        path: "roomType",
        model: "RoomType",
        match: { isActive: true }, // Only include active room types
        select:
          "name code category description maxOccupancy basePrice extraPersonPrice amenities premiumAmenities images size bedType viewType smokingAllowed isActive rating",
      })
      .sort({ "roomType.rating": -1, createdAt: -1 })
      .limit(9) // Limit to 9 rooms for the featured section
      .lean();

    // Transform rooms to hotel format, filtering out rooms without valid room types
    const transformedRooms = rooms
      .map((room, index) => transformRoomToHotel(room, index))
      .filter(
        (
          hotel
        ): hotel is NonNullable<ReturnType<typeof transformRoomToHotel>> =>
          hotel !== null
      ); // Remove null values with type guard

    const hotels = transformedRooms.sort((a: any, b: any) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return b.rating - a.rating;
    });

    // If no hotels found, return fallback data
    if (hotels.length === 0) {
      return NextResponse.json({
        success: true,
        data: getFallbackHotels(),
        categories: ["all", "beach", "city", "resort"],
        source: "fallback",
      });
    }

    // Get unique categories for filtering
    const categories = [...new Set(hotels.map((hotel: any) => hotel.category))];
    const availableCategories = ["all", ...categories.sort()];

    return NextResponse.json({
      success: true,
      data: hotels,
      categories: availableCategories,
      source: "database",
    });
  } catch (error) {
    console.error("Error fetching featured rooms:", error);

    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: getFallbackHotels(),
      categories: ["all", "beach", "city", "resort"],
      source: "fallback",
    });
  }
}
