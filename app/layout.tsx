// app/layout.tsx
"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/QueryProvider";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { gsap } from "gsap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll event listener for header visibility
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle the scroll event for better performance
    let ticking = false;
    const throttledControlHeader = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlHeader();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledControlHeader, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", throttledControlHeader);
    };
  }, [lastScrollY]);

  // Animate header visibility changes
  useEffect(() => {
    if (isHeaderVisible) {
      gsap.to(".header-container", {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        opacity: 1,
      });
    } else {
      gsap.to(".header-container", {
        y: -100,
        duration: 0.3,
        ease: "power2.in",
        opacity: 0,
      });
    }
  }, [isHeaderVisible]);

  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* Header with scroll behavior */}
            <div className="header-container fixed top-0 left-0 w-full z-50 transition-all duration-300">
              <Header />
            </div>

            {/* Main content with top padding to account for fixed header */}
            <div className="pt-16">{children}</div>
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
