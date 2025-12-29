// components/home/BookingSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Bed,
  MapPin,
  UserCheck,
  LogIn,
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
import { useAuth } from "@clerk/nextjs";
import { useAuthenticatedFetch } from "@/lib/auth-client";
import { GuestInfoDialog } from "@/components/booking/guest-info-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function BookingSection() {
  const { isSignedIn, userId } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

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

    setBookingData({
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
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setDateError("Please select both check-in and check-out dates");
      return;
    }

    // Validate dates are not empty
    if (
      bookingData.checkIn.trim() === "" ||
      bookingData.checkOut.trim() === ""
    ) {
      setDateError("Please select valid dates");
      return;
    }
    // Validate check-out is after check-in
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);

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
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
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
      toast.error("Failed to process booking. Please try again.");
      setIsBooking(false);
    }
  };

  // Proceed to checkout with guest data
  const proceedToCheckout = async (room: Room, guestData: GuestData) => {
    try {
      // Create URL parameters for checkout
      const params = new URLSearchParams({
        room: encodeURIComponent(JSON.stringify(room)),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests.toString(),
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

  const calculateTotalNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

          {/* Right side - Enhanced booking form */}
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
                    <div className="flex items-center justify-center gap-4 mb-3">
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
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your dates and check availability
                    </p>
                  </div>

                  <div className="space-y-6">
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
                          min={new Date().toISOString().split("T")[0]}
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
                          min={
                            bookingData.checkIn ||
                            new Date().toISOString().split("T")[0]
                          }
                          className="h-11 border-amber-200/50 dark:border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>

                    {/* Guests */}
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
                              guests: Math.max(1, bookingData.guests - 1),
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
                            {bookingData.guests} Guest
                            {bookingData.guests !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              guests: bookingData.guests + 1,
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

                    {/* Check availability button */}
                    <Button
                      onClick={handleCheckAvailability}
                      disabled={isLoadingRooms}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {isLoadingRooms
                          ? "Checking Availability..."
                          : "Check Availability"}
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
                      {bookingData.checkIn && bookingData.checkOut && (
                        <>
                          {new Date(bookingData.checkIn).toLocaleDateString()} -{" "}
                          {new Date(bookingData.checkOut).toLocaleDateString()}{" "}
                          • {calculateTotalNights()} night
                          {calculateTotalNights() !== 1 ? "s" : ""} •{" "}
                          {bookingData.guests} guest
                          {bookingData.guests !== 1 ? "s" : ""}
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
    </section>
  );
}
