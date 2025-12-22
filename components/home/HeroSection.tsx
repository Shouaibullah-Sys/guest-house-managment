// components/home/HeroSection.tsx

"use client";

import { Righteous } from "next/font/google";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BackgroundImage from "@/components/slider/BackgroundImage";
import Slides from "@/components/slider/Slides";
import SlideInfo from "@/components/slider/SlideInfo";
import Controls from "@/components/slider/Controls";
import Loader from "@/components/loader";

const inter = Righteous({
  subsets: ["latin"],
  weight: ["400"],
});

export type Data = {
  img: string;
  title: string;
  description: string;
  location: string;
};

export type CurrentSlideData = {
  data: Data;
  index: number;
};

interface HeroSectionData {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

interface ApiResponse {
  success: boolean;
  data: HeroSectionData[];
}

// Default fallback data - only used when no data is available
const defaultSliderData: Data[] = [
  {
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
    location: "Swiss Alps",
    description:
      "The journey to Machu Picchu typically starts in the mountain city of Cusco, which was the capital city of the Inca Empire",
    title: "SAINT ANTÖNEN",
  },
  {
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    title: "The Grand Canyon",
    description:
      "The earth's geological history opens before your eyes in a mile-deep chasm",
    location: "Arizona",
  },
  {
    img: "/3.png",
    title: "Masai Mara",
    description:
      "Wild animals in their natural environment, luxury safari lodges",
    location: "Kenya",
  },
  {
    img: "/4.png",
    title: "Angkor Wat",
    description:
      "A stunning ancient jungle city with hundreds of intricately constructed temples",
    location: "Cambodia",
  },
  {
    img: "/7.png",
    title: "Bali",
    description:
      "Tropical beaches, volcano hikes, ancient temples, and friendly people",
    location: "Indonesia",
  },
];

// Fetch hero sections from API
const fetchHeroSections = async (): Promise<HeroSectionData[]> => {
  try {
    const response = await fetch("/api/hero-section?isActive=true");
    if (!response.ok) {
      throw new Error("Failed to fetch hero sections");
    }
    const result: ApiResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    return [];
  }
};

// Transform API data to component format
const transformData = (heroSections: HeroSectionData[]): Data[] => {
  return heroSections
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((section) => ({
      img: section.imageUrl,
      title: section.title,
      description: section.description,
      location: section.location,
    }));
};

export default function Home() {
  // Fetch hero sections from API
  const {
    data: heroSections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["heroSections"],
    queryFn: fetchHeroSections,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API data to component format
  const sliderData = React.useMemo(() => {
    const transformed = transformData(heroSections);
    // Only use fallback if we have no data and there's no error
    if (transformed.length === 0 && !error) {
      return defaultSliderData;
    }
    return transformed;
  }, [heroSections, error]);

  const [data, setData] = React.useState<Data[]>([]);
  const [transitionData, setTransitionData] = React.useState<Data>(
    sliderData[0] || defaultSliderData[0]
  );
  const [currentSlideData, setCurrentSlideData] =
    React.useState<CurrentSlideData>({
      data: sliderData[0] || defaultSliderData[0],
      index: 0,
    });

  // Update data when sliderData changes
  useEffect(() => {
    if (sliderData.length > 0) {
      setData(sliderData.slice(1));
      setTransitionData(sliderData[0]);
      setCurrentSlideData({
        data: sliderData[0],
        index: 0,
      });
    }
  }, [sliderData]);

  // Debug: Log when we're using real vs fallback data
  useEffect(() => {
    if (heroSections.length > 0) {
      console.log(
        "✅ Using REAL database data for hero sections:",
        heroSections
      );
    } else if (error) {
      console.log("❌ Error loading hero sections:", error);
    } else {
      console.log("⚠️  No hero sections found, using fallback data");
    }
  }, [heroSections, error]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader
          title="Loading hero sections"
          subtitle="Please wait while we fetch the latest content"
        />
      </div>
    );
  }

  // Show error state with helpful message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">
            Unable to load hero sections
          </h2>
          <p className="text-gray-400 mb-4">
            There was an error loading the hero sections from the database.
          </p>
          <p className="text-sm text-gray-500">Error: {error.message}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please check if you have hero sections saved in the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`
       ${inter.className}
        relative min-h-screen select-none overflow-hidden text-white antialiased`}
    >
      <AnimatePresence>
        <BackgroundImage
          key="background-image"
          transitionData={transitionData}
          currentSlideData={currentSlideData}
        />
        <div key="content-overlay" className="  absolute z-20  h-full w-full">
          <div className=" flex h-full w-full grid-cols-10 flex-col md:grid">
            <div className=" col-span-4 mb-3 flex h-full flex-1 flex-col justify-end px-5 md:mb-0 md:justify-center md:px-10">
              <SlideInfo
                transitionData={transitionData}
                currentSlideData={currentSlideData}
              />
            </div>
            <div className=" col-span-6 flex h-full flex-1 flex-col justify-start p-4 md:justify-center md:p-10">
              <Slides data={data} />
              <Controls
                currentSlideData={currentSlideData}
                data={data}
                transitionData={transitionData}
                initData={sliderData[0] || defaultSliderData[0]}
                handleData={setData}
                handleTransitionData={setTransitionData}
                handleCurrentSlideData={setCurrentSlideData}
                sliderData={sliderData}
              />
            </div>
          </div>
        </div>
      </AnimatePresence>
    </main>
  );
}

// Static data removed - using dynamic data from API
