// components/home/AmenitiesSection.tsx
"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Wifi,
  Coffee,
  Car,
  Dumbbell,
  Users,
  Bed,
  Waves,
  Sparkles,
  Umbrella,
  Wine,
  Tv,
  Wind,
  Bath,
  Shield,
  Clock,
  Heart,
  Globe,
  Zap,
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Amenity {
  icon: React.ReactNode;
  name: string;
  description: string;
  category?: string;
  featured?: boolean;
}

export default function AmenitiesSection() {
  const amenities: Amenity[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      name: "24-Hour Electricity",
      description: "Continuous electricity supply available day and night",
      category: "basic",
      featured: true,
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      name: "High-Speed Internet",
      description: "Reliable and fast Wi-Fi access in rooms and common areas",
      category: "technology",
      featured: true,
    },
    {
      icon: <Tv className="w-6 h-6" />,
      name: "Television",
      description: "Television available in rooms for guest entertainment",
      category: "comfort",
    },
    {
      icon: <Car className="w-6 h-6" />,
      name: "Car Parking",
      description: "Safe and convenient parking space for guests’ vehicles",
      category: "transport",
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      name: "Breakfast",
      description: "Daily breakfast provided for guests",
      category: "dining",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      name: "Security",
      description: "Safe environment with secure doors and monitoring",
      category: "safety",
      featured: true,
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      name: "Daily Room Cleaning",
      description: "Rooms are cleaned daily to maintain hygiene and comfort",
      category: "service",
    },
    {
      icon: <Bed className="w-6 h-6" />,
      name: "Well-Furnished Rooms",
      description: "Comfortable rooms equipped with essential furniture",
      category: "comfort",
      featured: true,
    },
  ];

  const categories = [
    { id: "all", name: "All Amenities" },
    { id: "premium", name: "Premium" },
    { id: "service", name: "Service" },
    { id: "wellness", name: "Wellness" },
    { id: "dining", name: "Dining" },
    { id: "technology", name: "Technology" },
  ];

  useEffect(() => {
    // Stagger animation for amenities
    gsap.from(".amenity-card", {
      y: 30,
      opacity: 0,
      stagger: 0.05,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".amenities-section",
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });

    // Header animation
    gsap.from(".amenities-header", {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".amenities-section",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      className="amenities-section py-20 md:py-32 relative overflow-hidden"
      id="amenities"
    >
      {/* Luxury background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Geometric pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.1) 0, rgba(245, 158, 11, 0.1) 1px, transparent 1px, transparent 30px),
              repeating-linear-gradient(-45deg, rgba(180, 83, 9, 0.05) 0, rgba(180, 83, 9, 0.05) 1px, transparent 1px, transparent 30px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing accents */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-tl from-amber-600/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="amenities-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-200/20 dark:border-amber-800/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 tracking-wider">
              PREMIUM AMENITIES
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Unmatched Luxury
            </span>
            <span className="text-gray-900 dark:text-white block">
              Amenities & Services
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg md:text-xl">
            Experience unparalleled comfort and convenience with our exclusive
            range of premium amenities and services
          </p>
        </div>

        {/* Categories (optional filter) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                bg-gradient-to-r from-amber-500/10 to-amber-600/10 
                hover:from-amber-500/20 hover:to-amber-600/20
                text-amber-700 dark:text-amber-300
                border border-amber-200/30 dark:border-amber-800/30
                hover:scale-105"
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => (
            <div key={index} className="amenity-card group relative">
              <div
                className={`
                relative rounded-xl p-6 h-full
                bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-gray-900
                border border-amber-200/20 dark:border-gray-700
                backdrop-blur-sm
                transition-all duration-300
                hover:shadow-xl hover:shadow-amber-500/10
                hover:-translate-y-2
                ${amenity.featured ? "ring-1 ring-amber-500/30" : ""}
              `}
              >
                {/* Featured badge */}
                {amenity.featured && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-lg">
                      PREMIUM
                    </div>
                  </div>
                )}

                {/* Icon container with gradient */}
                <div
                  className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4
                  bg-gradient-to-br ${
                    amenity.featured
                      ? "from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
                      : "from-amber-500/10 to-amber-600/10"
                  }
                  group-hover:scale-110 transition-transform duration-300
                `}
                >
                  <div
                    className={
                      amenity.featured
                        ? "text-white"
                        : "text-amber-600 dark:text-amber-400"
                    }
                  >
                    {amenity.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3
                    className={`
                    text-lg font-semibold
                    ${
                      amenity.featured
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent"
                        : "text-gray-900 dark:text-white"
                    }
                  `}
                  >
                    {amenity.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {amenity.description}
                  </p>

                  {/* Category */}
                  {amenity.category && (
                    <div className="pt-3">
                      <span
                        className={`
                        inline-block px-2.5 py-1 rounded-full text-xs font-medium
                        ${
                          amenity.featured
                            ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-700 dark:text-amber-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }
                      `}
                      >
                        {amenity.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover overlay effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-amber-600/5 border border-amber-200/20 dark:border-amber-800/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              All amenities included with your stay • No additional charges
            </p>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
