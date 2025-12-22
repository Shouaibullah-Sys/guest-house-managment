// components/home/BookingSection.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Check,
  Shield,
  Clock,
  CreditCard,
  Sparkles,
  Crown,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function BookingSection() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    roomType: "",
  });

  const roomTypes = [
    {
      id: "presidential",
      name: "Presidential Suite",
      price: 2500,
      icon: <Crown className="w-4 h-4" />,
      features: ["Private Pool", "Butler", "Cinema"],
    },
    {
      id: "penthouse",
      name: "Penthouse Ocean View",
      price: 1800,
      icon: <Star className="w-4 h-4" />,
      features: ["Panoramic Views", "Jacuzzi", "Bar"],
    },
    {
      id: "executive",
      name: "Executive Suite",
      price: 1200,
      icon: <Sparkles className="w-4 h-4" />,
      features: ["Lounge Access", "Spa Bath", "Workspace"],
    },
    {
      id: "deluxe",
      name: "Deluxe Suite",
      price: 850,
      icon: <Star className="w-4 h-4" />,
      features: ["Balcony", "Mini Bar", "Premium WiFi"],
    },
  ];

  const calculateTotalNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const selectedRoom = roomTypes.find((r) => r.id === bookingData.roomType);
    if (!selectedRoom) return 0;
    const nights = calculateTotalNights();
    return selectedRoom.price * nights;
  };

  const handleBookNow = () => {
    // In a real app, you would validate and submit the booking
    router.push(
      `/booking?checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.adults}&roomType=${bookingData.roomType}`
    );
  };

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      id="reservation"
    >
      {/* Luxury background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Geometric pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.1) 0, rgba(245, 158, 11, 0.1) 1px, transparent 1px, transparent 30px),
              repeating-linear-gradient(-45deg, rgba(180, 83, 9, 0.05) 0, rgba(180, 83, 9, 0.05) 1px, transparent 1px, transparent 30px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing accents */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-tl from-amber-600/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-200/20 dark:border-amber-800/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 tracking-wider">
              EXCLUSIVE RESERVATION
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Reserve Your Luxury
            </span>
            <span className="text-gray-900 dark:text-white block">
              Experience Today
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Book directly for exclusive benefits and guaranteed best rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Premium features */}
            <div className="space-y-6">
              {[
                {
                  icon: <Crown className="w-5 h-5" />,
                  title: "Best Rate Guarantee",
                  description:
                    "Found a lower price? We'll match it plus give you 10% off.",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  title: "Flexible Cancellation",
                  description:
                    "Free cancellation up to 48 hours before check-in.",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Secure Booking",
                  description: "Bank-level encryption for all transactions.",
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Exclusive Perks",
                  description:
                    "Complimentary upgrades & amenities for direct bookings.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center flex-shrink-0">
                    <div className="text-amber-600 dark:text-amber-400">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="bg-gradient-to-r from-amber-500/5 to-amber-600/5 rounded-xl p-6 border border-amber-200/20 dark:border-amber-800/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Why Book Direct?
              </h3>
              <div className="space-y-3">
                {[
                  "No third-party booking fees",
                  "Priority room assignment",
                  "Early check-in / late check-out",
                  "Personalized welcome amenities",
                  "Dedicated concierge service",
                  "Loyalty rewards points",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side - Booking form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-300/10 to-amber-500/20 blur-lg" />

              {/* Booking card */}
              <Card className="relative rounded-2xl border border-amber-200/30 dark:border-gray-700 bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-gray-950 shadow-xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Luxury Booking
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your dates and suite preference
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          Check-in
                        </Label>
                        <Input
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              checkIn: e.target.value,
                            })
                          }
                          className="h-11 border-amber-200/50 dark:border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          Check-out
                        </Label>
                        <Input
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              checkOut: e.target.value,
                            })
                          }
                          className="h-11 border-amber-200/50 dark:border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>

                    {/* Guests & Room Type */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500" />
                          Guests
                        </Label>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-600/5 border border-amber-200/20 dark:border-amber-800/20">
                          <button
                            type="button"
                            onClick={() =>
                              setBookingData({
                                ...bookingData,
                                adults: Math.max(1, bookingData.adults - 1),
                              })
                            }
                            className="w-9 h-9 rounded-full flex items-center justify-center border border-amber-300/50 hover:border-amber-500 transition-colors"
                          >
                            <span className="text-lg font-light text-gray-700 dark:text-gray-300">
                              -
                            </span>
                          </button>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {bookingData.adults} Adult
                              {bookingData.adults !== 1 ? "s" : ""}
                            </div>
                            {bookingData.children > 0 && (
                              <div className="text-xs text-gray-500">
                                + {bookingData.children} Children
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setBookingData({
                                ...bookingData,
                                adults: bookingData.adults + 1,
                              })
                            }
                            className="w-9 h-9 rounded-full flex items-center justify-center border border-amber-300/50 hover:border-amber-500 transition-colors"
                          >
                            <span className="text-lg font-light text-gray-700 dark:text-gray-300">
                              +
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          Suite Type
                        </Label>
                        <Select
                          value={bookingData.roomType}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              roomType: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-11 border-amber-200/50 dark:border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20">
                            <SelectValue placeholder="Select your suite" />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((room) => (
                              <SelectItem
                                key={room.id}
                                value={room.id}
                                className="py-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="text-amber-500">
                                      {room.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {room.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {room.features.slice(0, 2).join(" • ")}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="font-bold text-amber-600">
                                    ${room.price}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price summary */}
                    {bookingData.roomType &&
                      bookingData.checkIn &&
                      bookingData.checkOut && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 bg-gradient-to-r from-amber-500/5 to-amber-600/5 rounded-xl p-4 border border-amber-200/20 dark:border-amber-800/20"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Suite Rate
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              $
                              {
                                roomTypes.find(
                                  (r) => r.id === bookingData.roomType
                                )?.price
                              }{" "}
                              × {calculateTotalNights()} nights
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Taxes & Fees
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${Math.round(calculateTotalPrice() * 0.15)}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                              ${Math.round(calculateTotalPrice() * 1.15)}
                            </span>
                          </div>
                        </motion.div>
                      )}

                    {/* Book button */}
                    <Button
                      onClick={handleBookNow}
                      disabled={
                        !bookingData.roomType ||
                        !bookingData.checkIn ||
                        !bookingData.checkOut
                      }
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {bookingData.roomType
                          ? "Book Now"
                          : "Select Suite & Dates"}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>

                    {/* Trust message */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3" />
                        Secure booking • No hidden fees • Best price guaranteed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
