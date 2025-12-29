// lib/featured-rooms-service.ts
import { Hotel } from "./constants";

// Fetch and transform featured rooms
export const fetchFeaturedRooms = async (): Promise<Hotel[]> => {
  try {
    // Fetch featured rooms from public endpoint
    const response = await fetch('/api/public/featured-rooms');
    if (!response.ok) {
      throw new Error('Failed to fetch featured rooms');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error('Invalid response format');
    }
    
  } catch (error) {
    console.error('Error fetching featured rooms:', error);
    // Return fallback data if API fails
    return getFallbackHotels();
  }
};

// Fallback hotels in case API fails
const getFallbackHotels = (): Hotel[] => {
  return [
    {
      id: 1,
      name: "Luxury Mountain Suite",
      price: "$450",
      originalPrice: "$550",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
      location: "Mountain Retreat",
      category: "mountain",
      rating: 4.8,
      reviews: 324,
      features: ["Mountain Views", "Fireplace", "Spa", "Fine Dining"],
      description: "Luxury suite with panoramic mountain views and premium amenities.",
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
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      location: "City Center",
      category: "city",
      rating: 4.6,
      reviews: 512,
      features: ["City Views", "Business Center", "Gym", "Concierge"],
      description: "Modern executive room in the heart of the city with business amenities.",
      maxGuests: 2,
      rooms: 1,
      amenities: ["Free WiFi", "Business Center", "Gym", "Concierge"],
      popular: true,
    },
    {
      id: 3,
      name: "Family Resort Suite",
      price: "$280",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
      location: "Beach Resort",
      category: "resort",
      rating: 4.4,
      reviews: 287,
      features: ["Beach Access", "Kids Club", "Pool", "Family Dining"],
      description: "Perfect family suite with beach access and kid-friendly amenities.",
      maxGuests: 6,
      rooms: 2,
      amenities: ["Free WiFi", "Beach Access", "Kids Club", "Pool"],
      popular: false,
    },
  ];
};

// Get available categories based on actual room data
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    // Fetch featured rooms from public endpoint to get categories
    const response = await fetch('/api/public/featured-rooms');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const result = await response.json();
    
    if (result.success && result.categories) {
      return result.categories;
    } else {
      // Fallback categories if API response doesn't include them
      return ["all", "mountain", "city", "resort", "beach"];
    }
    
  } catch (error) {
    console.error('Error getting available categories:', error);
    return ["all", "mountain", "city", "resort", "beach"];
  }
};