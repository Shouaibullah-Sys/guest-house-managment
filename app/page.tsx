// app/page.tsx
"use client";

import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import RoomShowcase from "@/components/home/RoomShowcase";
import AmenitiesSection from "@/components/home/AmenitiesSection";
import BookingSection from "@/components/home/BookingSection";
import ContactSection from "@/components/home/ContactSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Footer from "@/components/layout/Footer";
import StatsSection from "@/components/home/StatsSection";
import QuickBookingWidget from "@/components/booking/QuickBookingWidget";
import { FeaturedHotels } from "@/components/home/FeaturedHotels";
import { useState } from "react";
import { Hotel } from "@/lib/constants";
import { BookingItem } from "@/types/booking";

export default function HomePage() {
  // State management for hotel bookings
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  // Hotel booking functionality
  const handleBookNow = (hotel: Hotel, nights: number = 1) => {
    setBookingItems((prev) => {
      const existing = prev.find((item) => item.id === hotel.id);
      return existing
        ? prev.map((item) =>
            item.id === hotel.id
              ? { ...item, nights: item.nights + nights }
              : item
          )
        : [
            ...prev,
            {
              id: hotel.id,
              name: hotel.name,
              price: hotel.price,
              image: hotel.image,
              location: hotel.location,
              nights: nights,
              rating: hotel.rating,
              checkIn: new Date().toISOString().split("T")[0],
              checkOut: new Date(Date.now() + nights * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              guests: 2,
            },
          ];
    });
    // Show success notification
    showNotification(`${hotel.name} added to bookings!`);
  };

  const removeFromBooking = (id: number) => {
    setBookingItems((prev) => prev.filter((item) => item.id !== id));
    showNotification("Booking removed");
  };

  const updateNights = (id: number, nights: number) => {
    if (nights < 1) {
      removeFromBooking(id);
    } else {
      setBookingItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, nights } : item))
      );
    }
  };

  const handleCheckoutClick = () => {
    if (bookingItems.length === 0) {
      showNotification("Please add hotels to your booking first");
      return;
    }
    setShowCheckout(true);
    // Here you would typically redirect to a checkout page or open a checkout modal
    console.log("Proceeding to checkout with items:", bookingItems);
  };

  const handleCompleteOrder = () => {
    // Handle order completion logic
    setShowCheckout(false);
    setBookingItems([]);
    showNotification("Booking completed successfully!");
    // You might want to redirect to a confirmation page
  };

  // Notification function
  const showNotification = (message: string) => {
    // You can replace this with your actual notification system
    console.log("Notification:", message);
    // For now, let's use a simple alert
    if (typeof window !== "undefined") {
      alert(message);
    }
  };

  // Calculate booking total
  const calculateBookingTotal = () => {
    return bookingItems
      .reduce(
        (total, item) =>
          total +
          parseFloat(item.price.replace("$", "").replace(",", "")) *
            item.nights,
        0
      )
      .toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
  };

  return (
    <>
      <Header
        bookingItems={bookingItems}
        onCheckoutClick={handleCheckoutClick}
        onRemoveBooking={removeFromBooking}
        onUpdateNights={updateNights}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div id="hero">
          <HeroSection />
        </div>
        <div id="stats">
          <StatsSection />
        </div>
        <div id="booking">
          <QuickBookingWidget />
        </div>

        {/* Featured Luxury Hotels Collection */}
        <div
          id="featured-hotels"
          className="py-16 bg-gradient-to-b from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/10"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Featured{" "}
                <span className="text-amber-600 dark:text-amber-400">
                  Luxury Hotels
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover our curated collection of world-class luxury hotels and
                exclusive resorts
              </p>
            </div>
            <FeaturedHotels onBookNow={handleBookNow} />
          </div>
        </div>
        <div id="amenities">
          <AmenitiesSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <div id="reservation">
          <BookingSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>

        {/* Checkout Modal (Basic Implementation) */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Complete Your Booking
              </h3>

              <div className="space-y-4 mb-6">
                {bookingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.nights} night{item.nights > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-semibold text-amber-600">
                      $
                      {(
                        parseFloat(
                          item.price.replace("$", "").replace(",", "")
                        ) * item.nights
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {calculateBookingTotal()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteOrder}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Confirm Booking
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                You will receive a confirmation email shortly
              </p>
            </div>
          </div>
        )}

        {/* Add spacing at the bottom */}
        <div className="h-[100vh]" />
      </div>
      <Footer />
    </>
  );
}
