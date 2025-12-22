// components/home/RoomShowcase.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Star,
  Bed,
  Users,
  Wifi,
  Coffee,
  Wind,
  Square,
  ChevronRight,
  Sparkles,
  Moon,
  Heart,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Register GSAP plugin
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface RoomType {
  id: number;
  name: string;
  description: string;
  price: number;
  tagline: string;
  amenities: string[];
  features: Array<{ icon: React.ReactNode; label: string }>;
  image: string;
  category: string;
  size: string;
  occupancy: number;
  rating: number;
  isPopular: boolean;
}

export default function RoomShowcase() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const roomCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const luxuryRooms: RoomType[] = [
    {
      id: 1,
      name: "Presidential Sky Suite",
      description:
        "Unmatched luxury with panoramic city views, private terrace, bespoke amenities, and personalized butler service.",
      price: 899,
      tagline: "Ultimate Elegance",
      amenities: [
        "Private Butler",
        "Jacuzzi",
        "Wine Cellar",
        "Smart Home",
        "Gym Access",
        "Limo Service",
      ],
      features: [
        { icon: <Square className="w-4 h-4" />, label: "120 m²" },
        { icon: <Users className="w-4 h-4" />, label: "4 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "2 King Beds" },
        { icon: <Wifi className="w-4 h-4" />, label: "10Gbps WiFi" },
      ],
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&auto=format&fit=crop",
      category: "Suite",
      size: "120 m²",
      occupancy: 4,
      rating: 5.0,
      isPopular: true,
    },
    {
      id: 2,
      name: "Executive Ocean View",
      description:
        "Breathtaking ocean views from floor-to-ceiling windows, premium bedding, and elegant modern décor.",
      price: 499,
      tagline: "Coastal Serenity",
      amenities: [
        "Ocean View",
        "Work Desk",
        "Mini Bar",
        "Premium Toiletries",
        "Balcony",
      ],
      features: [
        { icon: <Square className="w-4 h-4" />, label: "65 m²" },
        { icon: <Users className="w-4 h-4" />, label: "2 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "King Bed" },
        { icon: <Coffee className="w-4 h-4" />, label: "Espresso Maker" },
      ],
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&auto=format&fit=crop",
      category: "Premium",
      size: "65 m²",
      occupancy: 2,
      rating: 4.9,
      isPopular: true,
    },
    {
      id: 3,
      name: "Deluxe Garden Suite",
      description:
        "Peaceful escape with calming garden views, sophisticated interior styling, and luxury spa amenities.",
      price: 349,
      tagline: "Tranquil Retreat",
      amenities: [
        "Garden View",
        "Spa Bath",
        "Balcony",
        "Sound System",
        "Fireplace",
      ],
      features: [
        { icon: <Square className="w-4 h-4" />, label: "55 m²" },
        { icon: <Users className="w-4 h-4" />, label: "3 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "King + Sofa" },
        { icon: <Wind className="w-4 h-4" />, label: "Smart AC" },
      ],
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&auto=format&fit=crop",
      category: "Deluxe",
      size: "55 m²",
      occupancy: 3,
      rating: 4.8,
      isPopular: false,
    },
    {
      id: 4,
      name: "Business Executive Room",
      description:
        "Productivity-focused room with ergonomic workspace, high-speed internet, and meeting facilities.",
      price: 299,
      tagline: "Productive Stay",
      amenities: [
        "Work Desk",
        "Printer",
        "Video Conferencing",
        "Coffee Station",
      ],
      features: [
        { icon: <Square className="w-4 h-4" />, label: "45 m²" },
        { icon: <Users className="w-4 h-4" />, label: "2 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "Queen Bed" },
        { icon: <Wifi className="w-4 h-4" />, label: "1Gbps WiFi" },
      ],
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&auto=format&fit=crop",
      category: "Business",
      size: "45 m²",
      occupancy: 2,
      rating: 4.7,
      isPopular: true,
    },
  ];

  useEffect(() => {
    // Room card animations
    roomCardsRef.current.forEach((card, index) => {
      if (!card) return;

      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
      });
    });

    // Parallax effect for background
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundPosition: "50% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleBookNow = (roomId: number) => {
    router.push(`/booking?room=${roomId}`);
  };

  const handleQuickView = (room: RoomType) => {
    // Implement quick view modal
    console.log("Quick view:", room.name);
  };

  return (
    <section
      ref={containerRef}
      id="rooms"
      className="py-24 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
          linear-gradient(to bottom, transparent, hsl(var(--background)))
        `,
      }}
    >
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
            <Sparkles className="w-3 h-3 mr-2" />
            Luxury Collection
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">Discover Our</span>
            <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Signature Rooms
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Each room is meticulously designed to provide unparalleled comfort,
            style, and luxury amenities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {luxuryRooms.map((room, index) => (
            <motion.div
              key={room.id}
              ref={(el) => {
                roomCardsRef.current[index] = el;
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="h-full overflow-hidden border-2 border-transparent hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Room badges */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        {room.category}
                      </Badge>
                    </div>
                    {room.isPopular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Quick view button */}
                    <button
                      onClick={() => handleQuickView(room)}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {room.name}
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        {room.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{room.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {room.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span className="text-amber-600 dark:text-amber-400">
                            {feature.icon}
                          </span>
                        </div>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-6">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          ${room.price}
                        </span>
                        <span className="text-gray-500 text-sm">/night</span>
                      </div>
                      <p className="text-gray-500 text-xs">Including taxes</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickView(room)}
                        className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookNow(room.id)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Moon className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="group border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 px-8"
            onClick={() => router.push("/rooms")}
          >
            View All Rooms
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-gradient-to-l from-amber-500/10 to-orange-500/5 rounded-full blur-3xl" />
    </section>
  );
}
