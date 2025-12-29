// app/hotels/[id]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Hotel, hotels as mainHotels } from "@/lib/constants";
import { fetchFeaturedRooms } from "@/lib/featured-rooms-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  Wifi, 
  Car, 
  Dumbbell, 
  Coffee, 
  Waves, 
  Utensils,
  Shield,
  ArrowLeft,
  Heart,
  Share2,
  Camera,
  CheckCircle,
  Clock,
  Crown
} from "lucide-react";
import Image from "next/image";

// Extend Hotel interface to handle database-specific fields
interface ExtendedHotel extends Hotel {
  _id?: string;
  roomNumber?: string;
  floor?: string;
  status?: string;
  roomTypeId?: string;
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<ExtendedHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Safe data access with fallbacks - always called to maintain hook order
  const safeHotelData = useMemo(() => {
    if (!hotel) return null;
    
    return {
      ...hotel,
      name: hotel.name || "Luxury Hotel",
      image: hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      location: hotel.location || "Premium Location",
      description: hotel.description || "Experience unparalleled luxury and world-class service at our premium resort destination.",
      price: hotel.price || "$500",
      originalPrice: hotel.originalPrice,
      rating: hotel.rating || 4.5,
      reviews: hotel.reviews || 100,
      maxGuests: hotel.maxGuests || 2,
      features: Array.isArray(hotel.features) ? hotel.features.slice(0, 4) : ["Luxury Accommodations", "Premium Service", "Modern Amenities"],
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : ["WiFi", "Breakfast", "Pool", "Spa"],
      category: hotel.category || "luxury",
      discount: hotel.discount,
      popular: hotel.popular || false,
    };
  }, [hotel]);

  // Optimized data loading with better error handling
  useEffect(() => {
    const loadHotel = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const hotelId = params.id as string;
        
        // Strategy 1: Try to find in main hotels list (fastest, no network)
        const numericId = parseInt(hotelId);
        if (!isNaN(numericId)) {
          const foundInConstants = mainHotels.find(h => h.id === numericId);
          if (foundInConstants) {
            setHotel(foundInConstants);
            return;
          }
        }
        
        // Strategy 2: Try API endpoint (most reliable for database data)
        try {
          const response = await fetch(`/api/public/featured-rooms/${hotelId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setHotel(result.data);
              return;
            }
          }
        } catch (apiError) {
          console.warn("API endpoint not available, trying fallback methods");
        }
        
        // Strategy 3: Try to find in featured rooms list (fallback)
        try {
          const hotels = await fetchFeaturedRooms();
          const foundHotel = hotels.find(h => {
            // Safe type checking for different data structures
            if (typeof h === 'object' && h !== null) {
              return (h as any).id === numericId || 
                     (h as any)._id === hotelId || 
                     (h as any).roomNumber === hotelId ||
                     h.name?.toLowerCase().includes(hotelId.toLowerCase()) ||
                     h.location?.toLowerCase().includes(hotelId.toLowerCase());
            }
            return false;
          });
          
          if (foundHotel) {
            setHotel(foundHotel as ExtendedHotel);
            return;
          }
        } catch (fallbackError) {
          console.warn("Fallback search failed:", fallbackError);
        }
        
        // If all strategies fail
        setError("Hotel not found");
      } catch (err) {
        console.error("Critical error loading hotel:", err);
        setError("Failed to load hotel details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
  }, [params.id]);

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const getAmenityIcon = (amenity: string) => {
    // Handle various amenity name formats
    const normalizedAmenity = amenity.toLowerCase().replace(/[^a-z]/g, '');
    
    const iconMap: { [key: string]: React.ReactNode } = {
      "wifi": <Wifi className="w-5 h-5" />,
      "breakfast": <Coffee className="w-5 h-5" />,
      "pool": <Waves className="w-5 h-5" />,
      "spa": <Heart className="w-5 h-5" />,
      "gym": <Dumbbell className="w-5 h-5" />,
      "fitness": <Dumbbell className="w-5 h-5" />,
      "parking": <Car className="w-5 h-5" />,
      "bar": <Utensils className="w-5 h-5" />,
      "restaurant": <Utensils className="w-5 h-5" />,
      "concierge": <Shield className="w-5 h-5" />,
      "butlerservice": <Shield className="w-5 h-5" />,
      "privatebeach": <Waves className="w-5 h-5" />,
      "jacuzzi": <Waves className="w-5 h-5" />,
      "minibar": <Coffee className="w-5 h-5" />,
      "room": <CheckCircle className="w-5 h-5" />,
      "service": <Shield className="w-5 h-5" />
    };
    
    return iconMap[normalizedAmenity] || <CheckCircle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading hotel details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !safeHotelData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hotel Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error === "Hotel not found" 
                ? "The hotel you're looking for doesn't exist or may have been removed."
                : "Unable to load hotel details. Please try again later."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => router.push('/')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate additional images for the gallery
  const hotelImages = [
    safeHotelData.image,
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <Header />
      
      {/* Hero Section with Image Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-[70vh] overflow-hidden">
          <Image
            src={hotelImages[selectedImageIndex]}
            alt={safeHotelData.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Navigation & Actions */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/90 hover:bg-white text-gray-900 border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`bg-white/90 hover:bg-white border-white/20 ${
                  isFavorite ? 'text-red-500' : 'text-gray-900'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                className="bg-white/90 hover:bg-white text-gray-900 border-white/20"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hotel Title Overlay */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-amber-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                5-Star Luxury
              </Badge>
              {safeHotelData.popular && (
                <Badge className="bg-rose-600 text-white">
                  Most Popular
                </Badge>
              )}
              {safeHotelData.discount && (
                <Badge className="bg-green-600 text-white">
                  {safeHotelData.discount}% Off
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {safeHotelData.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{safeHotelData.location}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery Thumbnails */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2 bg-black/50 rounded-full p-2 backdrop-blur-sm">
            {hotelImages.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-amber-400 ring-2 ring-amber-400/50' 
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <Image
                  src={image}
                  alt={`${safeHotelData.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-16 h-16 rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Overview */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Hotel Overview
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-600">
                      {safeHotelData.price}
                      <span className="text-lg text-gray-500 font-normal">/night</span>
                    </div>
                    {safeHotelData.originalPrice && (
                      <div className="text-lg text-gray-500 line-through">
                        {safeHotelData.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < safeHotelData.rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {safeHotelData.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {safeHotelData.reviews} reviews
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {safeHotelData.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {safeHotelData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Amenities & Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {safeHotelData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-amber-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Room Details */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Room Information
              </h3>
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Max Guests</p>
                      <p className="text-gray-600 dark:text-gray-300">{safeHotelData.maxGuests} guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Available</p>
                      <p className="text-gray-600 dark:text-gray-300">Year-round</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Check-in</p>
                      <p className="text-gray-600 dark:text-gray-300">3:00 PM</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {safeHotelData.price}
                </div>
                <div className="text-gray-600 dark:text-gray-300">per night</div>
                {safeHotelData.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    {safeHotelData.originalPrice}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Free cancellation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>No booking fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Best price guarantee</span>
                </div>
              </div>

              <Button 
                onClick={handleBookNow}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg font-semibold"
              >
                Book Now
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  You won't be charged yet
                </p>
              </div>
            </Card>

            {/* Location Card */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Location
              </h4>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{safeHotelData.location}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Prime location with easy access to major attractions
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                View on Map
              </Button>
            </Card>

            {/* Category Badge */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category
              </h4>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1">
                {safeHotelData.category.charAt(0).toUpperCase() + safeHotelData.category.slice(1)} Hotel
              </Badge>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Book {safeHotelData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete your luxury experience
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {safeHotelData.price}/night
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Includes taxes and fees
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowBookingModal(false);
                  // Add to booking logic here
                  alert(`${safeHotelData.name} added to your booking!`);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Add to Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}