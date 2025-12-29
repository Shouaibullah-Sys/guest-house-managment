// components/home/RoomTypesList.tsx - For static room cards
"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Bed, Users, Square, Eye } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Room {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  amenities: string[];
  features: string[];
}

interface RoomTypesListProps {
  rooms: Room[];
}

export default function RoomTypesList({ rooms }: RoomTypesListProps) {
  useEffect(() => {
    // Room cards animation
    gsap.utils.toArray(".room-card").forEach((card: any, i) => {
      gsap.from(card, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
        delay: i * 0.2,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room, index) => (
        <div key={room.id} className="room-card">
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
            {/* Room Card Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {room.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {room.description}
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {room.maxOccupancy} Guests
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    King Bed
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    45 m²
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {room.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-50 dark:bg-gray-800 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    ${room.basePrice}
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                </div>
                <Button variant="ghost" className="text-amber-600">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
