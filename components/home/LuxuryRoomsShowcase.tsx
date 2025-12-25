// components/home/LuxuryRoomsShowcase.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Star,
  Bed,
  Users,
  Wifi,
  Coffee,
  Wind,
  Square,
  ChevronDown,
  Shield,
  Heart,
  Sparkles,
  Moon,
} from "lucide-react";

// Register GSAP plugin
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function LuxuryRoomsShowcase() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();

  const luxuryRooms = [
    {
      id: 1,
      name: "Presidential Suite",
      description:
        "Experience unmatched luxury with a private terrace, bespoke amenities, and panoramic skyline views.",
      price: 899,
      tagline: "Ultimate Elegance",
      amenities: ["Private Butler", "Jacuzzi", "Wine Cellar", "Smart Home"],
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600",
      features: [
        { icon: <Square className="w-4 h-4" />, label: "120 m²" },
        { icon: <Users className="w-4 h-4" />, label: "4 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "2 Beds" },
        { icon: <Wifi className="w-4 h-4" />, label: "Premium WiFi" },
      ],
      highlight: "Most Booked Suite",
    },
    {
      id: 2,
      name: "Executive Ocean View",
      description:
        "Wake up to breathtaking ocean views, premium bedding, and elegant modern décor.",
      price: 499,
      tagline: "Coastal Serenity",
      amenities: ["Ocean View", "Work Desk", "Mini Bar", "Premium Toiletries"],
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600",
      features: [
        { icon: <Square className="w-4 h-4" />, label: "65 m²" },
        { icon: <Users className="w-4 h-4" />, label: "2 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "King Bed" },
        { icon: <Coffee className="w-4 h-4" />, label: "Coffee Maker" },
      ],
      highlight: "Oceanfront Exclusive",
    },
    {
      id: 3,
      name: "Deluxe Garden Suite",
      description:
        "A peaceful escape with calming garden views, sophisticated interior styling, and luxury amenities.",
      price: 349,
      tagline: "Tranquil Retreat",
      amenities: ["Garden View", "Balcony", "Spa Bath", "Sound System"],
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600",
      features: [
        { icon: <Square className="w-4 h-4" />, label: "55 m²" },
        { icon: <Users className="w-4 h-4" />, label: "3 Guests" },
        { icon: <Bed className="w-4 h-4" />, label: "King + Sofa" },
        { icon: <Wind className="w-4 h-4" />, label: "AC Control" },
      ],
      highlight: "Family Favorite",
    },
  ];

  // ------------------------------------------------------------
  // GSAP Animations
  // ------------------------------------------------------------
  useEffect(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());

    sectionsRef.current.forEach((section, i) => {
      if (!section) return;

      const bg = section.querySelector(".lux-bg");
      const overlay = overlayRefs.current[i];
      const title = section.querySelector(".lux-title");
      const tagline = section.querySelector(".lux-tagline");
      const description = section.querySelector(".lux-description");
      const details = section.querySelector(".lux-details");
      const indexNum = section.querySelector(".lux-index");
      const highlight = section.querySelector(".lux-highlight");

      if (!bg || !overlay || !title) return;

      // Shorter animation timeline for better viewport fit
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=100%", // Reduced from 140% to fit screen
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Subtle zoom that fits within viewport
      tl.fromTo(
        bg,
        {
          scale: 1.05,
          filter: "brightness(1.1)",
        },
        {
          scale: 1.15,
          filter: "brightness(0.9)",
          ease: "power2.out",
        },
        0
      );

      // Dark overlay appears gradually
      tl.fromTo(
        overlay,
        { opacity: 0.4 },
        {
          opacity: 0.8,
          duration: 0.8,
          ease: "power2.out",
        },
        0.2
      );

      // Faster tagline animation
      tl.fromTo(
        tagline,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        0.3
      );

      // Title animation
      tl.fromTo(
        title,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        },
        0.5
      );

      // Quick description fade
      tl.fromTo(
        description,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        0.7
      );

      // Highlight badge
      if (highlight) {
        tl.fromTo(
          highlight,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          0.8
        );
      }

      // Compact details animation
      tl.fromTo(
        details,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        0.9
      );

      // Background number
      tl.fromTo(
        indexNum,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 0.06,
          duration: 0.8,
          ease: "power3.out",
        },
        0.6
      );

      // Exit animation with shorter distance
      if (i < sectionsRef.current.length - 1) {
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom-=10% bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        exitTl.to([tagline, title, description, details], {
          y: -25,
          opacity: 0,
          ease: "power1.inOut",
        });
      }
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  // ------------------------------------------------------------
  // Book Now
  // ------------------------------------------------------------
  const handleBookNow = async (id: number) => {
    router.push(isSignedIn && userId ? `/booking?room=${id}` : "/sign-up");
  };

  return (
    <>
      {luxuryRooms.map((room, i) => (
        <section
          key={room.id}
          ref={(el) => {
            sectionsRef.current[i] = el;
          }}
          className="relative h-screen flex items-center justify-center overflow-hidden"
          style={{ height: "100vh" }}
        >
          {/* Background */}
          <div
            className="lux-bg absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${room.image})`,
            }}
          />

          {/* Dark overlay */}
          <div
            ref={(el) => {
              overlayRefs.current[i] = el;
            }}
            className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-charcoal/80 to-gray-800/75 z-10"
          />

          {/* Content container - COMPACT LAYOUT */}
          <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
              {/* Text Content - COMPACT */}
              <div className="space-y-4 sm:space-y-6">
                {/* Tagline - COMPACT */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <span className="lux-tagline text-xs sm:text-sm font-medium tracking-wider text-amber-300 opacity-0">
                    {room.tagline}
                  </span>
                </div>

                {/* Room Highlight - COMPACT */}
                {room.highlight && (
                  <div className="lux-highlight inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-full border border-amber-500/30 mb-1 opacity-0">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-medium text-amber-300">
                      {room.highlight}
                    </span>
                  </div>
                )}

                {/* Title - COMPACT */}
                <h2 className="lux-title text-3xl sm:text-4xl md:text-5xl font-bold leading-snug opacity-0">
                  <span className="text-white">{room.name}</span>
                </h2>

                {/* Description - COMPACT */}
                <p className="lux-description text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg opacity-0 line-clamp-3">
                  {room.description}
                </p>

                {/* Details Card - COMPACT */}
                <div className="lux-details bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/15 shadow-xl opacity-0">
                  {/* Features Grid - COMPACT */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {room.features.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                          <span className="text-amber-400">{f.icon}</span>
                        </div>
                        <span className="text-white text-sm font-medium">
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Amenities - COMPACT */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm sm:text-base font-semibold text-amber-100">
                        Amenities
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {room.amenities.map((a, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 bg-gradient-to-r from-amber-900/30 to-amber-800/20 backdrop-blur-sm rounded-full text-amber-200 text-xs sm:text-sm border border-amber-700/30"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA - COMPACT */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                          ${room.price}
                        </span>
                        <span className="text-gray-400 text-sm">/night</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart className="w-3 h-3 text-amber-500" />
                        <span>All inclusive</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleBookNow(room.id)}
                      className="px-6 py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                    >
                      <span className="flex items-center gap-1 sm:gap-2">
                        <Moon className="w-4 h-4" />
                        Book Now
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Preview - COMPACT */}
              <div className="relative hidden lg:block h-full">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-500/20 h-4/5 max-h-[500px]">
                  <div className="h-full overflow-hidden">
                    <img
                      src={room.image}
                      className="w-full h-full object-cover"
                      alt={room.name}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Background Index Number - SMALLER */}
          <div className="lux-index absolute inset-0 flex justify-center items-center pointer-events-none select-none opacity-0">
            <span className="text-[15vw] sm:text-[20vw] md:text-[25vw] font-black bg-gradient-to-b from-gray-900/10 to-charcoal/20 bg-clip-text text-transparent">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        </section>
      ))}

      {/* End Section - COMPACT */}
      <div className="h-40 bg-gradient-to-b from-charcoal to-gray-900 flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Continue Exploring
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Discover our premium amenities
        </p>
        <ChevronDown className="w-6 h-6 text-amber-400 animate-bounce" />
      </div>
    </>
  );
}
