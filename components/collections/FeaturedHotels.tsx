// components/FeaturedHotels.tsx
import { useState, useRef, useEffect } from "react";
import { hotels, Hotel } from "@/lib/constants";
import { Button } from "./FeaturedButton";
import { HotelCard } from "./HotelCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export const FeaturedHotels = ({
  onBookNow,
}: {
  onBookNow: (hotel: Hotel) => void;
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const lastFilterRef = useRef<string>(activeFilter);

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
        "radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)";
      shimmer.style.opacity = "0";
      activeButton.appendChild(shimmer);

      gsap.to(activeButton, {
        scale: 1.05,
        boxShadow: "0 0 25px rgba(255, 215, 0, 0.5)",
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
      "radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, transparent 70%)";
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
    <section
      ref={containerRef}
      className="py-32 relative overflow-hidden bg-darker"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(180, 148, 87, 0.12) 0, rgba(180, 148, 87, 0.12) 1px, transparent 1px, transparent 22px),
            repeating-linear-gradient(-45deg, rgba(180, 148, 87, 0.08) 0, rgba(180, 148, 87, 0.08) 1px, transparent 1px, transparent 22px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div ref={headingRef} className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text 
          text-transparent bg-gradient-to-r from-gold via-amber-200 to-amber-300"
          >
            Luxury Hotels & Resorts
          </h2>
          <p className="text-lg text-silver/80 max-w-2xl mx-auto">
            Experience unparalleled luxury at the world's most exclusive hotels,
            where every stay is a masterpiece.
          </p>
        </div>

        {/* Hotel Categories Filter */}
        <div
          ref={filterRef}
          className="flex justify-center gap-4 mb-16 flex-wrap"
        >
          {["all", "beach", "mountain", "city", "safari", "resort"].map(
            (category) => (
              <Button
                key={category}
                variant={category === activeFilter ? "gradient" : "outline"}
                className={`relative overflow-hidden px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  activeFilter === category
                    ? "shadow-lg shadow-gold/20"
                    : "opacity-90 hover:opacity-100 border-gold/30 text-gold hover:bg-gold/5"
                }`}
                onClick={() => setActiveFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            )
          )}
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredHotels.map((hotel, index) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              index={index}
              onBookNow={() => onBookNow(hotel)}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="outline"
            className="px-8 py-4 text-lg border-gold/30 hover:border-gold hover:bg-gold/5 group text-gold"
          >
            <span className="mr-2 group-hover:translate-x-1 transition-transform">
              View All Destinations
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
      </div>
    </section>
  );
};
