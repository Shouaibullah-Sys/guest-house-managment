// components/SoftwareAd.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Code, Shield, Microscope, Mail, Facebook, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SoftwareAdProps {
  onClose: () => void;
  show: boolean;
}

export default function SoftwareAd({ onClose, show }: SoftwareAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && !isVisible) {
      setIsVisible(true);
      startAnimation();

      // Set auto-close timeout when ad appears
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleClose();
      }, 8000);
    } else if (!show && isVisible) {
      closeAnimation();
    }
  }, [show, isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    if (!adRef.current) return;

    // Clear any existing timeout
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }

    // Reset position
    gsap.set(adRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 50,
    });

    timelineRef.current = gsap.timeline();

    timelineRef.current
      // Main container entrance
      .to(adRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      // Background pulse effect
      .to(
        ".ad-bg-pulse",
        {
          scale: 1.05,
          opacity: 0.8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
        "-=0.5"
      )
      // Floating elements
      .to(
        ".floating-icon",
        {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.2,
        },
        "-=1"
      )
      // Text reveal animation
      .fromTo(
        ".ad-text-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3"
      )
      // Button glow effect
      .to(
        ".ad-contact-btn",
        {
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
        "-=0.5"
      );
  };

  const handleClose = () => {
    // Clear the auto-close timeout
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = undefined;
    }

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    if (adRef.current) {
      gsap.to(adRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          setIsVisible(false);
          onClose();
        },
      });
    } else {
      setIsVisible(false);
      onClose();
    }
  };

  const closeAnimation = () => {
    handleClose();
  };

  const handleContactClick = () => {
    window.open("mailto:rahimisolution@outlook.com", "_blank");
  };

  const handleFacebookClick = () => {
    window.open("https://www.facebook.com/share/17MNceefpG/", "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={adRef}
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 ad-bg-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute z-50 top-3 right-3 sm:top-4 sm:right-4 bg-white/10 hover:bg-white/20 text-white border-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 sm:p-3 rounded-xl shadow-lg floating-icon">
                  <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white ad-text-reveal">
                    رحیمی سلوشن
                  </h2>
                  <p className="text-blue-200 text-sm sm:text-lg ad-text-reveal">
                    طراحی نرم افزار حرفه ای
                  </p>
                </div>
              </div>

              {/* Description - PERSIAN VERSION */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed ad-text-reveal text-right">
                  این سامانه پیشرفته مدیریت لابراتوار توسط تیم ما به صورت سفارشی
                  توسعه یافته است تا فرآیندهای تشخیص پزشکی را ساده‌تر کرده و
                  مراقبت از بیماران را بهبود بخشد.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs sm:text-sm text-gray-300 ad-text-reveal">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 floating-icon" />
                    <span>مطابق با استاندارد HIPAA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Microscope className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 floating-icon" />
                    <span>درجه پزشکی</span>
                  </div>
                </div>
              </div>

              {/* Features - PERSIAN VERSION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ad-text-reveal">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold text-xs sm:text-sm text-right">
                    راهکارهای سفارشی سلامت
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold text-xs sm:text-sm text-right">
                    برنامه‌های سازمانی
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold text-xs sm:text-sm text-right">
                    پشتیبانی ۲۴/۷
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-semibold text-xs sm:text-sm text-right">
                    امن و قابل اعتماد
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleContactClick}
                  className="ad-contact-btn bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 rounded-xl py-2 sm:py-3 px-4 sm:px-6 font-semibold transition-all duration-300 text-sm sm:text-base"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  تماس با ما
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFacebookClick}
                  className="ad-contact-btn bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 rounded-xl py-2 sm:py-3 px-4 sm:px-6 font-semibold transition-all duration-300 text-sm sm:text-base"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  ما را دنبال کنید
                </Button>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative mt-6 lg:mt-0">
              {/* Animated Icons Grid - PERSIAN VERSION */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-blue-500/20 p-2 sm:p-3 rounded-xl w-fit mx-auto mb-3 sm:mb-4 floating-icon">
                    <Code className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-400" />
                  </div>
                  <p className="text-white text-center font-semibold text-xs sm:text-sm">
                    توسعه سفارشی
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-green-500/20 p-2 sm:p-3 rounded-xl w-fit mx-auto mb-3 sm:mb-4 floating-icon">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-400" />
                  </div>
                  <p className="text-white text-center font-semibold text-xs sm:text-sm">
                    امن و مطابق
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-purple-500/20 p-2 sm:p-3 rounded-xl w-fit mx-auto mb-3 sm:mb-4 floating-icon">
                    <Microscope className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-400" />
                  </div>
                  <p className="text-white text-center font-semibold text-xs sm:text-sm">
                    متمرکز بر سلامت
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-teal-500/20 p-2 sm:p-3 rounded-xl w-fit mx-auto mb-3 sm:mb-4 floating-icon">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-teal-400" />
                  </div>
                  <p className="text-white text-center font-semibold text-xs sm:text-sm">
                    پشتیبانی حرفه‌ای
                  </p>
                </div>
              </div>

              {/* Floating Contact Info */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-gray-300 text-xs sm:text-sm">
                  ایمیل:{" "}
                  <a
                    href="mailto:rahimisolution@outlook.com"
                    className="text-blue-300 hover:text-blue-200 underline break-all"
                  >
                    rahimisolution@outlook.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note - PERSIAN VERSION */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              قدرتمندسازی مراقبت‌های بهداشتی مدرن با راهکارهای نرم‌افزاری
              نوآورانه
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
