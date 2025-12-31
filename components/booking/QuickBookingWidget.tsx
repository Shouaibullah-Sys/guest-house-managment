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
  UserCheck,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthenticatedFetch } from "@/lib/auth-client";
import { GuestInfoDialog } from "./guest-info-dialog";
import { toast } from "sonner";

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

interface GuestData {
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function QuickBookingWidget() {
  const { isSignedIn, userId } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();

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

  // Guest info collection states
  const [showGuestInfoDialog, setShowGuestInfoDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [currentGuestData, setCurrentGuestData] = useState<GuestData>({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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

  // Check user's existing guest information
  const checkUserGuestInfo = async () => {
    if (!userId) return { missingFields: [], existingData: null };

    try {
      // Get current user data from our database using their Clerk ID
      const response = await authenticatedFetch(
        `/api/admin/users?search=${userId}&limit=1`
      );

      if (response.ok) {
        const usersData = await response.json();

        if (usersData.data && usersData.data.length > 0) {
          const existingData = usersData.data[0];

          // Define required fields for booking
          const requiredFields = [
            "name",
            "email",
            "phone",
            "nationality",
            "idNumber",
          ];

          // Check which required fields are missing
          const missingFields = requiredFields.filter((field) => {
            const value = existingData[field as keyof typeof existingData];
            return !value || (typeof value === "string" && value.trim() === "");
          });

          return { missingFields, existingData };
        }
      }
    } catch (error) {
      console.log("User guest info not found or error occurred:", error);
    }

    // If we get here, user doesn't exist in our guest database
    // For now, assume all fields are missing for new users
    return {
      missingFields: ["name", "email", "phone", "nationality", "idNumber"],
      existingData: null,
    };
  };

  // Handle check availability button click
  const handleCheckAvailability = async () => {
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
    setIsLoadingRooms(true);

    try {
      // Fetch available rooms from our API
      const response = await authenticatedFetch("/api/rooms/availability", {
        method: "POST",
        body: JSON.stringify({
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests: dates.guests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", response.status, errorData);

        // More robust error handling
        let errorMessage = "Failed to fetch available rooms";

        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else if (response.status === 401) {
          errorMessage = "You need to sign in to check room availability";
        } else if (response.status === 500) {
          errorMessage = "Server error: Please try again later";
        } else if (response.status === 400) {
          errorMessage =
            "Invalid request: Please check your dates and try again";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAvailableRooms(data.data || []);
      setShowRoomsModal(true);
    } catch (error) {
      console.error("Error fetching rooms:", error);

      // More specific error messages based on the error type
      let errorMessage = "Failed to check availability";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Try to extract error message from different error formats
        errorMessage = (error as any).message || errorMessage;
      }

      toast.error(errorMessage);
      setAvailableRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Handle room selection and booking flow
  const handleRoomSelect = async (room: Room) => {
    if (!isSignedIn) {
      // Redirect to sign in page
      router.push("/sign-in");
      return;
    }

    setIsBooking(true);
    setSelectedRoom(room);

    try {
      // Ensure user is synced to database before proceeding
      console.log("🔄 Syncing user to database before booking...");
      const syncResponse = await authenticatedFetch(
        "/api/auth/sync-user-metadata",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json();
        console.error("❌ User sync failed:", syncError);
        throw new Error(
          "Failed to sync user data. Please try signing out and back in."
        );
      }

      const syncResult = await syncResponse.json();
      console.log("✅ User synced successfully:", syncResult);

      // Check user's existing guest information
      const { missingFields, existingData } = await checkUserGuestInfo();

      if (missingFields.length > 0) {
        // Show guest info dialog to collect missing information
        setMissingFields(missingFields);
        setCurrentGuestData(existingData || {});
        setShowGuestInfoDialog(true);
        setIsBooking(false);
        return;
      }

      // All required information is available, proceed to checkout
      await proceedToCheckout(room, existingData || {});
    } catch (error) {
      console.error("Error processing booking:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process booking. Please try again."
      );
      setIsBooking(false);
    }
  };

  // Proceed to checkout with guest data
  const proceedToCheckout = async (room: Room, guestData: GuestData) => {
    try {
      // Create URL parameters for checkout
      const params = new URLSearchParams({
        room: encodeURIComponent(JSON.stringify(room)),
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        guests: dates.guests.toString(),
        guestInfo: encodeURIComponent(JSON.stringify(guestData)),
      });

      // Navigate to checkout page
      router.push(`/checkout?${params.toString()}`);
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      toast.error("Failed to proceed to checkout");
      setIsBooking(false);
    }
  };

  // Handle guest info completion
  const handleGuestInfoComplete = async (completedGuestData: GuestData) => {
    if (!selectedRoom) return;

    try {
      // Update or create guest record if needed
      // For now, we'll just proceed to checkout with the provided data
      await proceedToCheckout(selectedRoom, completedGuestData);
    } catch (error) {
      console.error("Error completing guest info:", error);
      toast.error("Failed to save guest information");
    } finally {
      setShowGuestInfoDialog(false);
      setIsBooking(false);
    }
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
                {/* Authentication Status */}
                {isSignedIn ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      Logged In
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <LogIn className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Sign In Required
                    </span>
                  </div>
                )}

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
                              {room.roomType.basePrice.toLocaleString("fa-IR")}{" "}
                              افغانی
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

      {/* Guest Information Dialog */}
      <GuestInfoDialog
        open={showGuestInfoDialog}
        onOpenChange={setShowGuestInfoDialog}
        missingFields={missingFields}
        onComplete={handleGuestInfoComplete}
        isLoading={isBooking}
      />
    </>
  );
}
