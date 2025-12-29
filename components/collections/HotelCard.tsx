// components/collections/HotelCard.tsx
import { Hotel } from "@/lib/constants";
import { Button } from "./FeaturedButton";
import { MapPin, Star, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HotelCardProps {
  hotel: Hotel;
  index: number;
  onBookNow: (hotel: Hotel) => void;
}

export const HotelCard = ({ hotel, index, onBookNow }: HotelCardProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/hotels/${hotel.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark/50 to-darker border border-silver/10 hover:border-gold/30 transition-all duration-300"
      role="article"
      aria-labelledby={`hotel-${hotel.id}-title`}
    >
      {/* Luxury Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 bg-gradient-to-r from-gold to-amber-500 text-dark text-xs font-bold rounded-full">
          5-STAR LUXURY
        </span>
      </div>

      {/* Discount Badge */}
      {hotel.discount && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold rounded-full">
            {hotel.discount}% OFF
          </span>
        </div>
      )}

      {/* Hotel Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Quick Actions Overlay */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="gradient"
            onClick={() => onBookNow(hotel)}
            className="shadow-lg"
            aria-label={`Book ${hotel.name} now`}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3
              id={`hotel-${hotel.id}-title`}
              className="text-xl font-bold mb-2 group-hover:text-gold transition-colors"
            >
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-silver text-sm mb-2">
              <MapPin size={14} aria-hidden="true" />
              <span>{hotel.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">
              {hotel.price}
              <span className="text-sm text-silver font-normal">/night</span>
            </div>
            {hotel.originalPrice && (
              <div className="text-sm text-silver line-through">
                {hotel.originalPrice}
              </div>
            )}
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center gap-1"
            role="img"
            aria-label={`${hotel.rating} star rating`}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < hotel.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-silver"
                }
                aria-hidden="true"
              />
            ))}
            <span className="ml-2 text-sm text-silver">
              {hotel.rating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-silver">{hotel.reviews} reviews</div>
        </div>

        {/* Hotel Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hotel.features?.slice(0, 4).map((feature, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-dark/50 text-silver text-xs rounded-full border border-silver/20"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Availability Info */}
        <div className="flex items-center justify-between text-sm text-silver border-t border-silver/10 pt-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} aria-hidden="true" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} aria-hidden="true" />
            <span>Up to {hotel.maxGuests} guests</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="gradient"
            className="flex-1 group/btn"
            onClick={() => onBookNow(hotel)}
            aria-label={`Book ${hotel.name}`}
          >
            <span>Book Now</span>
          </Button>
          <Button
            variant="outline"
            className="group/btn"
            onClick={handleViewDetails}
            aria-label={`View details for ${hotel.name}`}
          >
            <span className="group-hover/btn:translate-x-1 transition-transform">
              View Details
            </span>
          </Button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};
