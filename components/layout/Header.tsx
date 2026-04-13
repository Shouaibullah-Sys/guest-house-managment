// components/layout/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Menu,
  User,
  Calendar,
  X,
  Sparkles,
  Shield,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Crown,
  LogOut,
  LogIn,
  Key,
  UserPlus,
  Bell,
  Heart,
  Star,
  Package,
  HelpCircle,
  Home,
  BarChart3,
  Building2,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { BookingItem } from "@/types/booking";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  bookingItems?: BookingItem[];
  onCheckoutClick?: () => void;
  onRemoveBooking?: (id: number) => void;
  onUpdateNights?: (id: number, nights: number) => void;
}

function Header({
  bookingItems = [],
  onCheckoutClick,
  onRemoveBooking,
  onUpdateNights,
}: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isBookingCartOpen, setIsBookingCartOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth store
  const {
    user,
    isLoading,
    isAuthenticated: isSignedIn,
    logout,
  } = useAuthStore();
  const isUserLoaded = !isLoading;
  const router = useRouter();

  // Calculate booking total
  const bookingTotal = bookingItems
    .reduce(
      (total, item) =>
        total +
        parseFloat(item.price.replace("$", "").replace(",", "")) * item.nights,
      0,
    )
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // Total nights
  const totalNights = bookingItems.reduce(
    (total, item) => total + item.nights,
    0,
  );

  // Scroll to booking section
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      const headerHeight = 80;
      const offset = bookingSection.offsetTop - headerHeight;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  // Optimize scroll-based transforms
  const { scrollY } = useScroll();

  // Reduced number of transforms for better performance
  const headerHeight = useTransform(scrollY, [0, 100], [100, 80]);
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const scale = useTransform(scrollY, [0, 50], [1, 0.98]);

  // Smooth the transforms with optimized settings
  const smoothHeaderHeight = useSpring(headerHeight, {
    stiffness: 150,
    damping: 25,
    mass: 0.1,
  });
  const smoothScale = useSpring(scale, {
    stiffness: 150,
    damping: 25,
    mass: 0.1,
  });

  useEffect(() => {
    let lastKnownScrollY = 0;
    let ticking = false;
    const SCROLL_THRESHOLD = 10;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 100) {
        setIsVisible(true);
        lastKnownScrollY = currentScrollY;
        ticking = false;
        return;
      }

      setIsSticky(currentScrollY > 300);
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastKnownScrollY + SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else if (lastKnownScrollY > currentScrollY + SCROLL_THRESHOLD) {
        setIsVisible(true);
      }

      lastKnownScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navigationItems = [
    { name: "Home", id: "hero" },
    { name: "Stats", id: "stats" },
    { name: "Hotels", id: "featured-hotels" },
    { name: "Amenities", id: "amenities" },
    { name: "Testimonials", id: "testimonials" },
    { name: "Reservation", id: "reservation" },
    { name: "Contact", id: "contact" },
  ];

  const handleLogin = () => {
    setIsUserProfileOpen(false);
    setShowLoginOptions(false);
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    setIsUserProfileOpen(false);
    setShowLoginOptions(false);
    router.push("/sign-up");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking on navigation items
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        data-testid="header"
        style={{
          height: smoothHeaderHeight,
          opacity: headerOpacity,
          scale: smoothScale,
          y: isVisible ? 0 : -100,
          backgroundColor: isSticky
            ? "rgba(17, 24, 39, 0.95)"
            : "rgba(17, 24, 39, 0)",
          boxShadow: isSticky
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 0px 0px 0px rgba(0, 0, 0, 0)",
        }}
        className={`fixed top-0 left-0 right-0 z-50 w-full will-change-transform transition-colors duration-300 ${
          isSticky ? "bg-gray-900/95 backdrop-blur-sm" : "bg-transparent"
        }`}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          y: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        <div className="container mx-auto px-4 md:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <motion.div
              data-testid="header-logo"
              style={{
                scale: isScrolled ? 0.95 : 1,
                opacity: isScrolled ? 0.9 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-3 will-change-transform"
            >
              <motion.div
                style={{
                  scale: isScrolled ? 0.9 : 1,
                  rotate: isScrolled ? 0 : 5,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative h-10 w-10 md:h-12 md:w-12 will-change-transform"
              >
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-amber-400 to-amber-600" />
                <div className="absolute inset-2 rounded-full bg-gray-900" />
                <div className="absolute inset-3 rounded-full bg-linear-to-br from-amber-400 to-amber-600" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-linear-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  NAWAZ TOTAKHAIL
                </h1>
                <p className="text-xs text-gray-400 tracking-wider">
                  HOTELS & RESORTS
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav
              data-testid="header-navigation"
              className="hidden lg:flex items-center gap-6"
            >
              {navigationItems.map((item, index) => {
                const scrollToSection = () => {
                  const section = document.getElementById(item.id);
                  if (section) {
                    const headerHeight = 80;
                    const offset = section.offsetTop - headerHeight;
                    window.scrollTo({ top: offset, behavior: "smooth" });
                  }
                };

                return (
                  <motion.button
                    key={item.id}
                    data-testid={`nav-item-${item.id}`}
                    id={`nav-${item.id}`}
                    onClick={scrollToSection}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      scale: 1.05,
                      color: "#fbbf24",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-300 hover:text-amber-400 font-medium text-sm tracking-wide relative group will-change-transform"
                  >
                    {item.name}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-amber-400 to-amber-600 group-hover:w-full"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Booking Cart Button */}
              {bookingItems.length > 0 && (
                <motion.button
                  data-testid="booking-cart-button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookingCartOpen(true)}
                  className="relative flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/50 px-3 md:px-4 py-2 text-sm text-gray-300 backdrop-blur-sm hover:border-amber-500/50 hover:text-amber-400 transition-all will-change-transform"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden lg:inline">My Bookings</span>
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {bookingItems.length}
                  </span>
                </motion.button>
              )}

              {/* Quick Book Button */}
              <motion.button
                data-testid="quick-book-button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToBooking}
                style={{
                  scale: isScrolled ? 0.95 : 1,
                  opacity: isScrolled ? 0.9 : 1,
                }}
                className="hidden md:flex items-center gap-2 rounded-full border border-gray-700 bg-linear-to-r from-amber-500/20 to-amber-600/20 px-4 py-2 text-sm text-amber-300 backdrop-blur-sm hover:border-amber-500/70 hover:from-amber-500/30 hover:to-amber-600/30 hover:text-amber-200 transition-all will-change-transform group"
              >
                <Sparkles className="h-4 w-4" />
                <span>Quick Book</span>
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              {/* Admin Button - Only visible for admin users */}
              {isUserLoaded && isSignedIn && user && user.role === "admin" && (
                <motion.button
                  data-testid="admin-button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/admin")}
                  style={{
                    scale: isScrolled ? 0.95 : 1,
                    opacity: isScrolled ? 0.9 : 1,
                  }}
                  className="flex items-center gap-2 rounded-full border border-red-500/50 bg-linear-to-r from-red-500/20 to-red-600/20 px-4 py-2 text-sm text-red-300 backdrop-blur-sm hover:border-red-500/70 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-200 transition-all will-change-transform group"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}

              {/* User/Login Button */}
              {isUserLoaded && isSignedIn && user ? (
                <div className="relative">
                  <motion.button
                    data-testid="profile-button"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserProfileOpen(true)}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-700 bg-gray-900/60 text-white flex items-center justify-center overflow-hidden"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </motion.button>
                  {user.approved && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-gray-900 z-10"></div>
                  )}
                </div>
              ) : (
                <motion.button
                  data-testid="login-button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  style={{
                    scale: isScrolled ? 0.95 : 1,
                    opacity: isScrolled ? 0.9 : 1,
                  }}
                  className="flex items-center gap-2 rounded-full border border-gray-700 bg-linear-to-r from-blue-500/20 to-blue-600/20 px-4 py-2 text-sm text-blue-300 backdrop-blur-sm hover:border-blue-500/70 hover:from-blue-500/30 hover:to-blue-600/30 hover:text-blue-200 transition-all will-change-transform group"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </motion.button>
              )}

              <motion.button
                data-testid="mobile-menu-button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-300 hover:text-amber-400 transition-colors will-change-transform"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Sticky indicator line */}
          {isSticky && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-500/50 to-transparent"
            />
          )}
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700"
        >
          <div className="container mx-auto px-4 py-6">
            <nav className="space-y-4">
              {navigationItems.map((item, index) => {
                const scrollToSection = () => {
                  const section = document.getElementById(item.id);
                  if (section) {
                    const headerHeight = 80;
                    const offset = section.offsetTop - headerHeight;
                    window.scrollTo({ top: offset, behavior: "smooth" });
                    handleMobileNavClick();
                  }
                };

                return (
                  <motion.button
                    key={item.id}
                    onClick={scrollToSection}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-white font-medium transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all">
                      {item.name === "Home" && (
                        <Home className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Stats" && (
                        <BarChart3 className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Hotels" && (
                        <Building2 className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Amenities" && (
                        <Sparkles className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Testimonials" && (
                        <Star className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Reservation" && (
                        <Calendar className="h-4 w-4 text-amber-400" />
                      )}
                      {item.name === "Contact" && (
                        <PhoneIcon className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <span className="text-lg">{item.name}</span>
                    <motion.div
                      className="ml-auto w-2 h-2 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                );
              })}
            </nav>

            {/* Mobile Menu Actions */}
            <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-4">
              {/* Quick Book Button */}
              <motion.button
                onClick={() => {
                  scrollToBooking();
                  handleMobileNavClick();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-amber-500/25"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-lg">Quick Book Now</span>
              </motion.button>

              {/* Admin Button for Admin Users */}
              {isUserLoaded && isSignedIn && user && user.role === "admin" && (
                <motion.button
                  onClick={() => {
                    router.push("/admin");
                    handleMobileNavClick();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-lg">Admin Panel</span>
                </motion.button>
              )}

              {/* Booking Cart Button (if items exist) */}
              {bookingItems.length > 0 && (
                <motion.button
                  onClick={() => {
                    setIsBookingCartOpen(true);
                    handleMobileNavClick();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-white font-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-lg">My Bookings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                      {bookingItems.length}
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {bookingTotal}
                    </span>
                  </div>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* User Profile Dialog */}
      <Dialog
        data-testid="user-profile-dialog"
        open={isUserProfileOpen}
        onOpenChange={setIsUserProfileOpen}
      >
        <DialogContent className="max-w-md w-[92vw] border border-gray-800 bg-gray-950/95 text-white backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
          {!isUserLoaded ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              <p className="text-gray-300">Loading profile...</p>
            </div>
          ) : !isSignedIn || showLoginOptions ? (
            <div className="p-6 space-y-5">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold">
                  Welcome
                </DialogTitle>
                <p className="text-sm text-gray-400">
                  Sign in to manage your bookings and account.
                </p>
              </DialogHeader>

              <div className="space-y-3">
                <Button
                  data-testid="dialog-sign-in-button"
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  data-testid="dialog-create-account-button"
                  type="button"
                  onClick={handleSignUp}
                  variant="outline"
                  className="w-full border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowLoginOptions(false);
                    setIsUserProfileOpen(false);
                  }}
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold">
                  Profile
                </DialogTitle>
                <p className="text-sm text-gray-400">
                  Personal information and account actions.
                </p>
              </DialogHeader>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold">
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {user?.email || "No email"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {(user?.role || "guest").toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          user?.approved
                            ? "bg-green-500/15 text-green-300 border-green-500/30"
                            : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                        }`}
                      >
                        {user?.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {user?.role === "admin" && user?.approved && (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsUserProfileOpen(false);
                      router.push("/admin");
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Open Admin Dashboard
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    setIsUserProfileOpen(false);
                    router.push("/sign-in");
                  }}
                  className="w-full border-gray-700 text-gray-200 hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Cart Modal */}
      {isBookingCartOpen && (
        <>
          <div
            data-testid="booking-cart-overlay"
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            onClick={() => setIsBookingCartOpen(false)}
          />

          <motion.div
            data-testid="booking-cart-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-50 p-6 h-[85vh] overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">Your Bookings</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {totalNights} nights total
                </p>
              </div>
              <button
                data-testid="booking-cart-close-button"
                onClick={() => setIsBookingCartOpen(false)}
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {bookingItems.length === 0 ? (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <Calendar size={64} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 text-lg">Your bookings are empty</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start exploring our luxury hotels
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                  {bookingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            📍 {item.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            ⭐ {item.rating || "5.0"}
                          </span>
                        </div>
                        <p className="text-amber-400 font-semibold mt-2">
                          {item.price}/night
                        </p>
                        <div className="text-sm text-gray-400 mt-1">
                          {item.checkIn} - {item.checkOut} • {item.guests} guest
                          {item.guests > 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            data-testid={`decrease-nights-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateNights)
                                onUpdateNights(item.id, item.nights - 1);
                            }}
                            className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-colors"
                            disabled={item.nights <= 1}
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-white">
                            {item.nights} night{item.nights > 1 ? "s" : ""}
                          </span>
                          <button
                            data-testid={`increase-nights-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateNights)
                                onUpdateNights(item.id, item.nights + 1);
                            }}
                            className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          data-testid={`remove-booking-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRemoveBooking) onRemoveBooking(item.id);
                          }}
                          className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-700 shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-lg text-gray-400">Total</span>
                      <p className="text-sm text-gray-500">
                        {totalNights} nights
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {bookingTotal}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsBookingCartOpen(false);
                        if (onCheckoutClick) onCheckoutClick();
                      }}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                    >
                      Complete Booking
                    </button>
                    <button
                      data-testid="continue-browsing-button"
                      onClick={() => setIsBookingCartOpen(false)}
                      className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-colors"
                    >
                      Continue Browsing
                    </button>
                  </div>

                  <p className="text-center text-gray-500 text-sm mt-4">
                    Need help? Call us at +1 (555) 123-4567
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </>
  );
}

export default Header;
