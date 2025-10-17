// components/Header.tsx
"use client";

import { useState } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
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
} from "lucide-react";

const Header = () => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    canAccess(item.allowedRoles)
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-2xl border-b-4 border-blue-400">
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
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <span className="hidden sm:inline">Welcome, </span>
                    {user?.firstName || "User"}
                    {userRole && (
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {userRole}
                      </span>
                    )}
                  </div>
                  <div className="border-2 border-white/30 rounded-full hover:border-white transition-colors duration-300">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        },
                      }}
                    />
                  </div>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-300">
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-transparent px-6 py-2 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <SignedIn>
              <div className="border-2 border-white/30 rounded-full">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </div>
            </SignedIn>
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
                  <div className="border-2 border-white/40 rounded-full">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-12 h-12",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-blue-100 text-sm truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    {userRole && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="px-4 py-3 mb-4 text-center">
                <SignInButton mode="modal">
                  <Button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-lg">Sign In to Access</span>
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>

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
