// components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  MessageSquare,
  Microscope,
  Settings,
  User,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
} from "lucide-react";

const Header = () => {
  const { user } = useUser();
  const { logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const userRole = user?.publicMetadata?.role as string;

  // Navigation items with icons and role-based permissions
  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      allowedRoles: ["all"], // Everyone can see home
    },
    {
      href: "/qa",
      label: "Q&A",
      icon: MessageSquare,
      allowedRoles: ["all"], // Everyone can see Q&A when logged in
    },
    {
      href: "/laboratory",
      label: "Laboratory",
      icon: Microscope,
      allowedRoles: ["admin", "laboratory"],
    },
    {
      href: "/admin",
      label: "Admin",
      icon: Settings,
      allowedRoles: ["admin"],
    },
  ];

  // Check if user can access a specific route
  const canAccess = (allowedRoles: string[]) => {
    if (allowedRoles.includes("all")) return true;
    if (!user) return false;
    return allowedRoles.includes(userRole);
  };

  // Get available navigation items for current user
  const availableNavigationItems = navigationItems.filter((item) =>
    canAccess(item.allowedRoles),
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle scroll behavior for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header when mobile menu is open
      if (isMobileMenuOpen) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsHeaderVisible(true);
      }
      // Hide header when scrolling down (but not on mobile or when mobile menu is open)
      else if (
        currentScrollY > lastScrollY &&
        currentScrollY > 100 &&
        !isMobileMenuOpen &&
        window.innerWidth >= 768
      ) {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [lastScrollY, isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-2xl border-b-4 border-blue-400 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 text-2xl font-bold hover:text-blue-100 transition-colors duration-300"
          >
            <div className="">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="Dr. Sebghat Clinic Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Dr. Sebghat Clinic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {availableNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            {/* User Auth Section */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/30">
              <SignedIn>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 hover:border-white transition-colors">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.fullName || "User"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:flex items-center space-x-2">
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName || "User"}
                        </p>
                        {userRole && (
                          <p className="text-xs text-blue-200 capitalize">
                            {userRole}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600">
                        <p className="font-semibold text-white truncate">
                          {user?.fullName || "User"}
                        </p>
                        <p className="text-sm text-blue-100 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                        {userRole && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white capitalize">
                            {userRole}
                          </span>
                        )}
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        {userRole === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-200 py-2">
                        <button
                          onClick={() => logout()}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>
              <SignedOut>
                <div className="rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-300">
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-transparent px-6 py-2 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-gradient-to-b from-blue-700/90 to-teal-700/90 backdrop-blur-lg">
            {/* User Info for Mobile */}
            <SignedIn>
              <div className="px-4 py-3 mb-4 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/40">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-blue-100 text-sm truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    {userRole && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white capitalize">
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="px-4 py-3 mb-4 text-center">
                <Link href="/sign-in">
                  <Button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-lg">Sign In to Access</span>
                  </Button>
                </Link>
              </div>
            </SignedOut>

            {/* Mobile User Actions */}
            <SignedIn>
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-gray-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300 group"
                >
                  <UserIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">My Profile</span>
                </Link>

                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-gray-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300 group"
                  >
                    <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
              </div>

              {/* Visual Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-6 w-full"></div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Sign Out</span>
              </button>
            </SignedIn>
            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              {availableNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 text-lg"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            {/* Additional Mobile Info */}
            <div className="mt-6 pt-4 border-t border-white/20 px-4">
              <SignedIn>
                <div className="text-center text-blue-100 text-sm">
                  <p>Having trouble? Contact support</p>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="text-center text-blue-100 text-sm">
                  <p>Sign in to access all features</p>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </div>

      {/* Role-based Access Notice */}
      <SignedIn>
        {userRole === "patient" && (
          <div className="bg-blue-500/80 text-white py-2 px-4 text-sm text-center">
            <span className="inline-flex items-center">
              <User className="h-3 w-3 mr-2" />
              Patient Access: Limited to essential features
            </span>
          </div>
        )}
        {userRole === "laboratory" && (
          <div className="bg-teal-500/80 text-white py-2 px-4 text-sm text-center">
            <span className="inline-flex items-center">
              <Microscope className="h-3 w-3 mr-2" />
              Laboratory Staff: Full laboratory access
            </span>
          </div>
        )}
      </SignedIn>
    </header>
  );
};

export default Header;
