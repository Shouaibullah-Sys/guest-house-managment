// lib/constants.ts

export interface Hotel {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  location: string;
  category: string;
  rating: number;
  reviews: number;
  features: string[];
  description: string;
  maxGuests: number;
  rooms: number;
  discount?: number;
  amenities: string[];
  popular: boolean;
}

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "The Ritz-Carlton Maldives",
    price: "$2,500",
    originalPrice: "$3,000",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
    location: "Maldives",
    category: "beach",
    rating: 4.9,
    reviews: 1287,
    features: ["Private Beach", "Overwater Villa", "Spa", "Infinity Pool"],
    description:
      "Experience ultimate luxury in our overwater villas with private infinity pools and butler service.",
    maxGuests: 4,
    rooms: 2,
    discount: 20,
    amenities: ["WiFi", "Breakfast", "Spa", "Pool", "Private Chef"],
    popular: true,
  },
  {
    id: 2,
    name: "Aman Tokyo",
    price: "$1,800",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w-800&auto=format&fit=crop",
    location: "Tokyo, Japan",
    category: "city",
    rating: 4.8,
    reviews: 945,
    features: ["City Views", "Zen Garden", "Kaiseki Dining", "Onsen"],
    description:
      "A sanctuary of calm in the heart of Tokyo with traditional Japanese aesthetics and modern luxury.",
    maxGuests: 2,
    rooms: 1,
    amenities: ["WiFi", "Breakfast", "Spa", "Gym", "Concierge"],
    popular: true,
  },
  {
    id: 3,
    name: "Four Seasons Safari Lodge",
    price: "$3,200",
    image:
      "https://images.unsplash.com/photo-1506530440266-22c6d3ddcd4f?w=800&auto=format&fit=crop",
    location: "Serengeti, Tanzania",
    category: "safari",
    rating: 4.9,
    reviews: 672,
    features: ["Game Drives", "Bush Dining", "Star Beds", "Wildlife"],
    description:
      "Luxury tented camp in the heart of Serengeti with exclusive wildlife viewing experiences.",
    maxGuests: 3,
    rooms: 1,
    amenities: ["WiFi", "All Meals", "Safari Tours", "Pool", "Bar"],
    popular: false,
  },
  {
    id: 4,
    name: "St. Moritz Alpine Resort",
    price: "$1,500",
    originalPrice: "$1,800",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    location: "Swiss Alps, Switzerland",
    category: "mountain",
    rating: 4.7,
    reviews: 823,
    features: ["Ski-in/Ski-out", "Fireplace", "Panoramic Views", "Spa"],
    description:
      "Luxury alpine retreat with private ski lifts and panoramic mountain views.",
    maxGuests: 6,
    rooms: 3,
    discount: 15,
    amenities: ["WiFi", "Breakfast", "Spa", "Ski Storage", "Hot Tub"],
    popular: true,
  },
  {
    id: 5,
    name: "Burj Al Arab Royal Suite",
    price: "$8,500",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
    location: "Dubai, UAE",
    category: "city",
    rating: 4.9,
    reviews: 1543,
    features: [
      "Butler Service",
      "Helicopter Transfer",
      "Private Cinema",
      "Gold Decor",
    ],
    description:
      "The world's most luxurious hotel suite with 24-karat gold iPads and a rotating bed.",
    maxGuests: 2,
    rooms: 2,
    amenities: ["WiFi", "All Meals", "Chauffeur", "Spa", "Private Chef"],
    popular: false,
  },
  {
    id: 6,
    name: "Six Senses Yao Noi",
    price: "$1,200",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    location: "Phuket, Thailand",
    category: "beach",
    rating: 4.8,
    reviews: 734,
    features: ["Villa Pool", "Jungle Views", "Private Beach", "Wellness"],
    description:
      "Eco-luxury resort with private villas nestled in the jungle overlooking Phang Nga Bay.",
    maxGuests: 4,
    rooms: 2,
    amenities: ["WiFi", "Breakfast", "Yoga", "Spa", "Bicycles"],
    popular: true,
  },
  {
    id: 7,
    name: "Ashford Castle",
    price: "$950",
    originalPrice: "$1,200",
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
    location: "County Mayo, Ireland",
    category: "castle",
    rating: 4.8,
    reviews: 589,
    features: ["Historic Castle", "Falconry", "Lake Views", "Fine Dining"],
    description:
      "800-year-old castle turned luxury hotel with medieval charm and modern amenities.",
    maxGuests: 2,
    rooms: 1,
    discount: 25,
    amenities: ["WiFi", "Breakfast", "Falconry", "Boat Tours", "Bar"],
    popular: false,
  },
  {
    id: 8,
    name: "Singita Grumeti",
    price: "$4,500",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    location: "Serengeti, Tanzania",
    category: "safari",
    rating: 4.9,
    reviews: 421,
    features: [
      "Private Reserve",
      "Wildebeest Migration",
      "Luxury Tents",
      "Conservation",
    ],
    description:
      "Exclusive safari experience in a private Serengeti reserve with exceptional wildlife viewing.",
    maxGuests: 4,
    rooms: 2,
    amenities: ["WiFi", "All Inclusive", "Game Drives", "Spa", "Pool"],
    popular: true,
  },
  {
    id: 9,
    name: "Amangiri",
    price: "$2,800",
    image:
      "https://images.unsplash.com/photo-1506530440266-22c6d3ddcd4f?w=800&auto=format&fit=crop",
    location: "Utah, USA",
    category: "desert",
    rating: 4.9,
    reviews: 512,
    features: ["Desert Views", "Natural Pool", "Hiking", "Stargazing"],
    description:
      "Minimalist luxury resort seamlessly integrated into the Utah desert landscape.",
    maxGuests: 2,
    rooms: 1,
    amenities: ["WiFi", "All Meals", "Yoga", "Spa", "Guided Hikes"],
    popular: false,
  },
];

export const categories = [
  { id: "all", name: "All Hotels" },
  { id: "beach", name: "Beach Resorts" },
  { id: "mountain", name: "Mountain Retreats" },
  { id: "city", name: "City Hotels" },
  { id: "safari", name: "Safari Lodges" },
  { id: "castle", name: "Castle Hotels" },
  { id: "desert", name: "Desert Resorts" },
  { id: "resort", name: "Luxury Resorts" },
];

export const amenities = [
  { id: "wifi", name: "Free WiFi", icon: "📶" },
  { id: "pool", name: "Swimming Pool", icon: "🏊" },
  { id: "spa", name: "Spa & Wellness", icon: "💆" },
  { id: "gym", name: "Fitness Center", icon: "💪" },
  { id: "breakfast", name: "Breakfast Included", icon: "🍳" },
  { id: "parking", name: "Free Parking", icon: "🅿️" },
  { id: "bar", name: "Luxury Bar", icon: "🍸" },
  { id: "concierge", name: "24/7 Concierge", icon: "🛎️" },
  { id: "beach", name: "Private Beach", icon: "🏖️" },
  { id: "chef", name: "Private Chef", icon: "👨‍🍳" },
];

export const popularDestinations = [
  {
    id: 1,
    name: "Maldives",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop",
    hotels: 24,
  },
  {
    id: 2,
    name: "Swiss Alps",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    hotels: 18,
  },
  {
    id: 3,
    name: "Tokyo",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
    hotels: 32,
  },
  {
    id: 4,
    name: "Santorini",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop",
    hotels: 15,
  },
  {
    id: 5,
    name: "Bali",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop",
    hotels: 28,
  },
  {
    id: 6,
    name: "Dubai",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop",
    hotels: 21,
  },
];

export const luxuryServices = [
  {
    id: 1,
    title: "Private Butler Service",
    description: "Dedicated butler available 24/7 to cater to your every need",
    icon: "🛎️",
  },
  {
    id: 2,
    title: "Helicopter Transfers",
    description:
      "Arrive in style with private helicopter transfers from the airport",
    icon: "🚁",
  },
  {
    id: 3,
    title: "Personal Chef",
    description: "Customized dining experiences prepared by world-class chefs",
    icon: "👨‍🍳",
  },
  {
    id: 4,
    title: "Spa & Wellness",
    description:
      "Exclusive spa treatments and wellness programs tailored to you",
    icon: "💆",
  },
  {
    id: 5,
    title: "Private Guide",
    description: "Expert guides for exclusive tours and experiences",
    icon: "🎯",
  },
  {
    id: 6,
    title: "Luxury Transport",
    description: "Chauffeur-driven Rolls Royce, Bentley or Mercedes fleet",
    icon: "🚗",
  },
];

export const experiences = [
  {
    id: 1,
    title: "Private Safari Adventure",
    description: "Exclusive wildlife viewing in private game reserves",
    price: "$1,200",
    duration: "3 days",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Michelin Star Dining",
    description: "Private dining with world-renowned chefs",
    price: "$850",
    duration: "1 night",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Private Yacht Charter",
    description: "Explore hidden coves and islands on a luxury yacht",
    price: "$5,000",
    duration: "7 days",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Alpine Ski Experience",
    description: "Private ski instructor and exclusive mountain access",
    price: "$1,500",
    duration: "5 days",
    image:
      "https://images.unsplash.com/photo-1533873987715-b1f2c3c5d1f4?w=800&auto=format&fit=crop",
  },
];

export const bookingSteps = [
  {
    step: 1,
    title: "Select Your Hotel",
    description: "Browse our collection of luxury hotels worldwide",
  },
  {
    step: 2,
    title: "Customize Your Stay",
    description: "Add experiences, transfers, and special requests",
  },
  {
    step: 3,
    title: "Confirm Booking",
    description: "Secure your reservation with our concierge team",
  },
  {
    step: 4,
    title: "Enjoy Your Stay",
    description: "Experience unparalleled luxury and service",
  },
];

export const hotelBrands = [
  { name: "Four Seasons", logo: "🏨" },
  { name: "Aman", logo: "⛩️" },
  { name: "Ritz-Carlton", logo: "🌟" },
  { name: "St. Regis", logo: "⚜️" },
  { name: "Six Senses", logo: "🌿" },
  { name: "Belmond", logo: "🚂" },
  { name: "One&Only", logo: "🌴" },
  { name: "Rosewood", logo: "🌹" },
];
