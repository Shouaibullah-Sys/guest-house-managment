// components/booking/QuickBookingWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  ChevronDown,
  Sparkles,
  Crown,
  X,
  Bed,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomType: {
    id: string;
    name: string;
    code: string;
    basePrice: number;
    maxOccupancy: number;
    amenities: string[];
  };
}

export default function QuickBookingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [dateError, setDateError] = useState("");

  const router = useRouter();

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setDates({
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow),
      guests: 2,
    });
  }, []);

  // Handle check availability button click
  const handleCheckAvailability = () => {
    if (!dates.checkIn || !dates.checkOut) {
      setDateError("Please select both check-in and check-out dates");
      return;
    }

    // Validate dates are not empty
    if (dates.checkIn.trim() === "" || dates.checkOut.trim() === "") {
      setDateError("Please select valid dates");
      return;
    }

    // Validate check-out is after check-in
    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);

    if (checkOutDate <= checkInDate) {
      setDateError("Check-out date must be after check-in date");
      return;
    }

    setDateError("");
    // For demo, show sample rooms
    showSampleRooms();
  };

  // Show sample rooms for demo
  const showSampleRooms = () => {
    setIsLoadingRooms(true);
    setTimeout(() => {
      setAvailableRooms([
        {
          id: "1",
          roomNumber: "101",
          floor: 1,
          status: "available",
          roomType: {
            id: "suite-1",
            name: "Presidential Suite",
            code: "PRS",
            basePrice: 1200,
            maxOccupancy: 4,
            amenities: [
              "Private Pool",
              "Butler Service",
              "Jacuzzi",
              "Bar",
              "Cinema",
            ],
          },
        },
        {
          id: "2",
          roomNumber: "202",
          floor: 2,
          status: "available",
          roomType: {
            id: "suite-2",
            name: "Ocean View Suite",
            code: "OVS",
            basePrice: 850,
            maxOccupancy: 3,
            amenities: ["Balcony", "Mini Bar", "Spa Bath", "Coffee Machine"],
          },
        },
        {
          id: "3",
          roomNumber: "305",
          floor: 3,
          status: "available",
          roomType: {
            id: "suite-3",
            name: "Executive Suite",
            code: "EXS",
            basePrice: 650,
            maxOccupancy: 2,
            amenities: [
              "Work Desk",
              "Premium WiFi",
              "Smart TV",
              "Coffee Service",
            ],
          },
        },
      ]);
      setShowRoomsModal(true);
      setIsLoadingRooms(false);
    }, 1000);
  };

  // Handle room selection
  const handleRoomSelect = (room: Room) => {
    setIsBooking(true);
    setTimeout(() => {
      alert(
        `Successfully booked ${room.roomType.name}! Your confirmation will be sent via email.`
      );
      setIsBooking(false);
      setShowRoomsModal(false);
    }, 1500);
  };

  // Floating particle effect
  const Particle = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute w-0.5 h-0.5 bg-gradient-to-r from-amber-300/30 to-amber-500/30 rounded-full"
      initial={{ y: -10, opacity: 0 }}
      animate={{
        y: [0, -20, 0],
        opacity: [0, 1, 0],
        x: [0, Math.random() * 20 - 10, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
          },
        }}
        whileHover={{ scale: 1.01 }}
        className="sticky top-24 z-40 mx-4 lg:mx-auto lg:max-w-4xl"
        id="booking"
      >
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-300/10 to-amber-500/20 blur-lg"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Main widget container */}
          <motion.div
            className={cn(
              "relative bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-gray-950",
              "rounded-2xl shadow-xl border backdrop-blur-sm",
              "transition-all duration-300",
              "border-amber-200/20 dark:border-amber-800/20"
            )}
            animate={{
              boxShadow: isHovered
                ? "0 20px 50px -15px rgba(245, 158, 11, 0.3)"
                : undefined,
            }}
          >
            {/* Luxury header */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full p-6 flex items-center justify-between relative overflow-hidden",
                "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900",
                "transition-all duration-300"
              )}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-5"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #F59E0B 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "100%" : "-100%" }}
                transition={{ duration: 1 }}
              />

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                  className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                >
                  <Calendar className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xl font-semibold tracking-wide text-white">
                      Quick Booking
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Reserve your luxury stay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <ChevronDown className="w-5 h-5 text-amber-300" />
                </motion.div>
              </div>
            </motion.button>

            {/* Expandable content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.3, ease: "easeInOut" },
                      opacity: { duration: 0.2, delay: 0.1 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.2 },
                      opacity: { duration: 0.1 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* Error message */}
                    {dateError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                          {dateError}
                        </p>
                      </motion.div>
                    )}

                    {/* Dates section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>Check-in</span>
                        </label>
                        <Input
                          type="date"
                          value={dates.checkIn}
                          onChange={(e) => {
                            setDates({ ...dates, checkIn: e.target.value });
                            setDateError("");
                          }}
                          min={new Date().toISOString().split("T")[0]}
                          className={cn(
                            "h-11 px-4 rounded-lg border",
                            "transition-all duration-200",
                            "border-gray-300 dark:border-gray-700",
                            "focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20",
                            "bg-white/70 dark:bg-gray-800/70"
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>Check-out</span>
                        </label>
                        <Input
                          type="date"
                          value={dates.checkOut}
                          onChange={(e) => {
                            setDates({ ...dates, checkOut: e.target.value });
                            setDateError("");
                          }}
                          min={
                            dates.checkIn ||
                            new Date().toISOString().split("T")[0]
                          }
                          className={cn(
                            "h-11 px-4 rounded-lg border",
                            "transition-all duration-200",
                            "border-gray-300 dark:border-gray-700",
                            "focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20",
                            "bg-white/70 dark:bg-gray-800/70"
                          )}
                        />
                      </div>
                    </div>

                    {/* Guests section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span>Guests</span>
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70">
                        <button
                          type="button"
                          onClick={() =>
                            setDates({
                              ...dates,
                              guests: Math.max(1, dates.guests - 1),
                            })
                          }
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            "border border-amber-500/20",
                            "bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900",
                            "hover:border-amber-500 transition-all duration-200"
                          )}
                        >
                          <span className="text-xl font-light text-gray-700 dark:text-gray-300">
                            -
                          </span>
                        </button>

                        <div className="text-center">
                          <div className="text-2xl font-semibold text-gray-800 dark:text-white">
                            {dates.guests}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {dates.guests === 1 ? "Guest" : "Guests"}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setDates({ ...dates, guests: dates.guests + 1 })
                          }
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            "border border-amber-500/20",
                            "bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900",
                            "hover:border-amber-500 transition-all duration-200"
                          )}
                        >
                          <span className="text-xl font-light text-gray-700 dark:text-gray-300">
                            +
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Submit button */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button
                        onClick={handleCheckAvailability}
                        disabled={isLoadingRooms}
                        className={cn(
                          "w-full h-12 rounded-lg relative overflow-hidden group",
                          "bg-gradient-to-r from-amber-500 to-amber-600",
                          "shadow-md hover:shadow-lg transition-all duration-300",
                          isLoadingRooms && "opacity-75 cursor-not-allowed"
                        )}
                      >
                        {/* Button shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-white" />
                          <span className="font-medium text-white">
                            {isLoadingRooms
                              ? "Checking..."
                              : "Check Availability"}
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <Particle key={i} delay={i * 0.3} />
            ))}
          </div>

          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-4 h-4">
            <motion.div
              className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4">
            <motion.div
              className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Available Rooms Modal */}
      <AnimatePresence>
        {showRoomsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRoomsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-amber-200/20 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50/30 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Suites
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dates.checkIn && dates.checkOut && (
                        <>
                          {new Date(dates.checkIn).toLocaleDateString()} -{" "}
                          {new Date(dates.checkOut).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRoomsModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
                {availableRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Available Suites
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please try different dates
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableRooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-white to-amber-50/20 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-amber-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Crown className="w-4 h-4 text-amber-500" />
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {room.roomType.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>Room {room.roomNumber}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Up to {room.roomType.maxOccupancy}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-amber-600">
                              ${room.roomType.basePrice}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              per night
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        {room.roomType.amenities?.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {room.roomType.amenities
                                .slice(0, 3)
                                .map((amenity, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-full"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              {room.roomType.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                  +{room.roomType.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleRoomSelect(room)}
                          disabled={isBooking}
                          className={cn(
                            "w-full py-2 rounded-lg font-medium transition-all duration-200",
                            "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                            "text-white disabled:opacity-70 disabled:cursor-not-allowed"
                          )}
                        >
                          {isBooking ? "Processing..." : "Book Now"}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
