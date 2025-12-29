// components/home/FeaturedHotels.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Hotel } from "@/lib/constants";
import { Button } from "@/components/collections/FeaturedButton";
import { HotelCard } from "@/components/collections/HotelCard";
import { fetchFeaturedRooms, getAvailableCategories } from "@/lib/featured-rooms-service";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface FeaturedHotelsProps {
  onBookNow: (hotel: Hotel) => void;
}

export const FeaturedHotels = ({ onBookNow }: FeaturedHotelsProps) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["all"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const lastFilterRef = useRef<string>(activeFilter);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [hotelsData, categoriesData] = await Promise.all([
          fetchFeaturedRooms(),
          getAvailableCategories(),
        ]);
        setHotels(hotelsData);
        setAvailableCategories(categoriesData);
      } catch (err) {
        setError("Failed to load featured rooms. Please try again later.");
        console.error("Error loading featured rooms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredHotels =
    activeFilter === "all"
      ? hotels
      : hotels.filter((hotel) => hotel.category === activeFilter);

  // Enhanced GSAP Animations
  useEffect(() => {
    if (
      !containerRef.current ||
      !gridRef.current ||
      !filterRef.current ||
      !headingRef.current
    )
      return;

    // Luxury entrance animation
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 80,
      scale: 0.98,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none none",
      },
    });

    // Heading animation
    gsap.from(headingRef.current, {
      opacity: 0,
      y: 50,
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    // Filter buttons animation
    gsap.set(filterRef.current.children, { opacity: 0, y: 30 });

    gsap.to(filterRef.current.children, {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: filterRef.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    // Card animations
    const cards = Array.from(gridRef.current?.children || []);

    gsap.set(cards, {
      opacity: 0,
      y: 60,
      scale: 0.95,
    });

    cards.forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        delay: index * 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Filter change animation
  useEffect(() => {
    if (
      !gridRef.current ||
      !filterRef.current ||
      lastFilterRef.current === activeFilter
    )
      return;

    // Animate active filter button
    const activeButton = Array.from(filterRef.current.children).find(
      (btn) => btn.textContent?.toLowerCase() === activeFilter
    ) as HTMLElement;

    if (activeButton) {
      const shimmer = document.createElement("div");
      shimmer.className =
        "absolute inset-0 rounded-full overflow-hidden pointer-events-none";
      shimmer.style.background =
        "radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, transparent 70%)";
      shimmer.style.opacity = "0";
      activeButton.appendChild(shimmer);

      gsap.to(activeButton, {
        scale: 1.05,
        boxShadow: "0 0 25px rgba(245, 158, 11, 0.5)",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(shimmer, {
        opacity: 0.6,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(shimmer, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => shimmer.remove(),
          });
        },
      });
    }

    // Grid shimmer effect
    const gridShimmer = document.createElement("div");
    gridShimmer.className = "absolute inset-0 z-20 pointer-events-none";
    gridShimmer.style.background =
      "radial-gradient(circle at center, rgba(245, 158, 11, 0.3) 0%, transparent 70%)";
    gridShimmer.style.opacity = "0";
    gridRef.current.parentElement?.appendChild(gridShimmer);

    gsap.to(gridShimmer, {
      opacity: 0.4,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(gridShimmer, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => gridShimmer.remove(),
        });
      },
    });

    // Animate new cards
    const newCards = Array.from(gridRef.current.children);
    gsap.set(newCards, {
      opacity: 0,
      y: 80,
    });

    gsap.to(newCards, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.2,
    });

    lastFilterRef.current = activeFilter;
  }, [filteredHotels, activeFilter]);

  return (
    <section ref={containerRef} className="py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.12) 0, rgba(245, 158, 11, 0.12) 1px, transparent 1px, transparent 22px),
            repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.08) 0, rgba(245, 158, 11, 0.08) 1px, transparent 1px, transparent 22px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div ref={headingRef} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-600 via-amber-500 to-yellow-500">
              Curated Luxury Collections
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Handpicked selection of the world's most exclusive hotels and
            resorts
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <span className="ml-3 text-amber-600 dark:text-amber-400">Loading luxury rooms...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-amber-300 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Hotel Categories Filter */}
            <div
              ref={filterRef}
              className="flex justify-center gap-3 mb-12 flex-wrap"
            >
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={category === activeFilter ? "gradient" : "outline"}
                  className={`relative overflow-hidden px-5 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 text-sm ${
                    activeFilter === category
                      ? "shadow-lg shadow-amber-500/20"
                      : "opacity-90 hover:opacity-100 border-amber-300 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  }`}
                  onClick={() => setActiveFilter(category)}
                  disabled={hotels.length === 0}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel, index) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                index={index}
                onBookNow={() => onBookNow(hotel)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-amber-600/70 dark:text-amber-400/70 text-lg mb-4">
                No rooms available in this category
              </p>
              <Button
                variant="outline"
                onClick={() => setActiveFilter("all")}
                className="border-amber-300 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                View All Rooms
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="px-8 py-4 text-lg border-amber-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 group text-amber-600 dark:text-amber-400"
            onClick={() => (window.location.href = "/admin/rooms")}
          >
            <span className="mr-2 group-hover:translate-x-1 transition-transform">
              View All Rooms
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
          </>
        )}
      </div>
    </section>
  );
};
