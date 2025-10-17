"use client";

import { useState, useEffect } from "react";
import { gsap } from "gsap";
import Header from "@/components/Header";

export default function HeaderWrapper() {
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

  return <Header />;
}
