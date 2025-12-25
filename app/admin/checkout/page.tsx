// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Crown,
  Bed,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StripePaymentForm } from "@/components/payment/StripePaymentForm";
import { BankPaymentDialog } from "@/components/booking/bank-payment-dialog";
import { SuccessPopup } from "@/components/booking/success-popup";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface BookingData {
  room: any;
  dates: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  guestInfo?: any;
  bookingId?: string;
}

type PaymentMethod = "cash" | "bank" | "stripe";

export default function CheckoutPage() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showBankPaymentDialog, setShowBankPaymentDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentMethod: PaymentMethod;
    amount: number;
    bookingDetails?: {
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
      guestName?: string;
    };
  } | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // Get booking data from URL params
    const roomData = searchParams.get("room");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const guestInfo = searchParams.get("guestInfo");

    if (!roomData || !checkIn || !checkOut || !guests) {
      router.push("/");
      return;
    }

    try {
      const room = JSON.parse(decodeURIComponent(roomData));
      const parsedGuestInfo = guestInfo
        ? JSON.parse(decodeURIComponent(guestInfo))
        : null;

      setBookingData({
        room,
        dates: {
          checkIn,
          checkOut,
          guests: parseInt(guests),
        },
        guestInfo: parsedGuestInfo,
      });
    } catch (error) {
      console.error("Error parsing booking data:", error);
      toast.error("Invalid booking data");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, router, searchParams]);

  // Handle cleanup when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      setShowSuccessPopup(false);
      setPaymentSuccessData(null);
    };
  }, []);

  const calculateNights = () => {
    if (!bookingData) return 0;
    const checkIn = new Date(bookingData.dates.checkIn);
    const checkOut = new Date(bookingData.dates.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    const nights = calculateNights();
    const basePrice = Number(bookingData.room.roomType.basePrice);
    return basePrice * nights;
  };

  const createBooking = async () => {
    if (!bookingData || !userId) return null;

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guest: userId,
        room: bookingData.room.id,
        checkInDate: bookingData.dates.checkIn,
        checkOutDate: bookingData.dates.checkOut,
        adults: bookingData.dates.guests,
        children: 0,
        infants: 0,
        totalNights: calculateNights(),
        roomRate: bookingData.room.roomType.basePrice,
        totalAmount: calculateTotal(),
        status: "confirmed",
        source: "quick_booking",
        specialRequests: "",
        notes: `Booking created via Quick Booking Widget for ${
          bookingData.guestInfo?.name || "logged in user"
        }`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking");
    }

    return data.data.id;
  };

  const handleCashPayment = async () => {
    if (!bookingData) return;

    try {
      setIsProcessing(true);
      const newBookingId = await createBooking();

      // Store success data for popup
      const successData = {
        paymentMethod: "cash" as PaymentMethod,
        amount: totalAmount,
        bookingDetails: {
          roomNumber: bookingData.room.roomNumber,
          checkInDate: bookingData.dates.checkIn,
          checkOutDate: bookingData.dates.checkOut,
          guestName: bookingData.guestInfo?.name,
        },
      };

      // Redirect to home first
      router.push("/");

      // Show success popup after delay
      setTimeout(() => {
        setPaymentSuccessData(successData);
        setShowSuccessPopup(true);
      }, 2000); // 2 second delay
    } catch (error) {
      console.error("Cash booking error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm booking"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankPayment = () => {
    setShowBankPaymentDialog(true);
  };

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      const newBookingId = await createBooking();
      setBookingId(newBookingId);

      // Create Stripe payment intent
      const response = await fetch(
        "/api/payments/stripe/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: calculateTotal(),
            currency: "usd",
            bookingId: newBookingId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      setStripeClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Stripe payment setup error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to setup Stripe payment"
      );
      setIsProcessing(false);
    }
  };

  const handleBankPaymentSuccess = async () => {
    if (!bookingData) return;

    try {
      // Store success data for popup
      const successData = {
        paymentMethod: "bank" as PaymentMethod,
        amount: totalAmount,
        bookingDetails: {
          roomNumber: bookingData.room.roomNumber,
          checkInDate: bookingData.dates.checkIn,
          checkOutDate: bookingData.dates.checkOut,
          guestName: bookingData.guestInfo?.name,
        },
      };

      // Redirect to home first
      router.push("/");

      // Show success popup after delay
      setTimeout(() => {
        setPaymentSuccessData(successData);
        setShowSuccessPopup(true);
      }, 2000); // 2 second delay
    } catch (error) {
      console.error("Bank payment error:", error);
      toast.error("Failed to complete booking");
    }
  };

  const handleBankPaymentError = (error: string) => {
    toast.error(error);
  };

  const handleStripePaymentSuccess = () => {
    if (!bookingData) return;

    // Store success data for popup
    const successData = {
      paymentMethod: "stripe" as PaymentMethod,
      amount: totalAmount,
      bookingDetails: {
        roomNumber: bookingData.room.roomNumber,
        checkInDate: bookingData.dates.checkIn,
        checkOutDate: bookingData.dates.checkOut,
        guestName: bookingData.guestInfo?.name,
      },
    };

    // Redirect to home first
    router.push("/");

    // Show success popup after delay
    setTimeout(() => {
      setPaymentSuccessData(successData);
      setShowSuccessPopup(true);
    }, 2000); // 2 second delay
  };

  const handleStripePaymentError = (error: string) => {
    toast.error(error);
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Invalid booking data</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-white dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Confirm Your Booking
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Please review your booking details before confirming
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-amber-500" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {bookingData.room.roomType.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Room {bookingData.room.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>
                          Up to {bookingData.room.roomType.maxOccupancy} guests
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-600"
                  >
                    Available
                  </Badge>
                </div>

                {/* Amenities */}
                {bookingData.room.roomType.amenities?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.room.roomType.amenities
                        .slice(0, 5)
                        .map((amenity: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      {bookingData.room.roomType.amenities.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bookingData.room.roomType.amenities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stay Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Check-in
                    </Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(
                          new Date(bookingData.dates.checkIn),
                          "EEEE, MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Check-out
                    </Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(
                          new Date(bookingData.dates.checkOut),
                          "EEEE, MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Guests
                    </Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {bookingData.dates.guests} guest
                        {bookingData.dates.guests !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Duration
                    </Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {nights} night{nights !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            {bookingData.guestInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-500" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Name
                      </Label>
                      <div className="font-medium">
                        {bookingData.guestInfo.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <div className="font-medium">
                        {bookingData.guestInfo.email}
                      </div>
                    </div>
                    {bookingData.guestInfo.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Phone
                        </Label>
                        <div className="font-medium">
                          {bookingData.guestInfo.phone}
                        </div>
                      </div>
                    )}
                    {bookingData.guestInfo.nationality && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Nationality
                        </Label>
                        <div className="font-medium">
                          {bookingData.guestInfo.nationality}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary & Payment */}
          <div className="space-y-6">
            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Room rate per night</span>
                    <span>
                      $
                      {Number(
                        bookingData.room.roomType.basePrice
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of nights</span>
                    <span>× {nights}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-amber-600">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Taxes and fees included
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "cash"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Pay with Cash</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay the amount upon arrival
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "bank"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                    }`}
                    onClick={() => setPaymentMethod("bank")}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Pay with Bank Card</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enter your bank card details to pay
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "stripe"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Pay with Stripe</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay securely with Stripe payment gateway
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Action */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {!stripeClientSecret ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Ready to confirm</span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {paymentMethod === "cash"
                          ? "You'll pay with cash upon arrival."
                          : paymentMethod === "bank"
                          ? "You'll pay with your bank card."
                          : "You'll pay securely with Stripe."}
                      </p>

                      <Button
                        onClick={
                          paymentMethod === "cash"
                            ? handleCashPayment
                            : paymentMethod === "bank"
                            ? handleBankPayment
                            : handleStripePayment
                        }
                        disabled={isProcessing}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {paymentMethod === "cash"
                              ? "Confirming Booking..."
                              : paymentMethod === "bank"
                              ? "Processing Bank Payment..."
                              : "Setting up Stripe Payment..."}
                          </>
                        ) : (
                          <>
                            {paymentMethod === "cash" ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Booking (Cash)
                              </>
                            ) : paymentMethod === "bank" ? (
                              <>
                                <Building2 className="mr-2 h-4 w-4" />
                                Pay with Bank Card
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay with Stripe
                              </>
                            )}
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="w-full"
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                          <CreditCard className="h-5 w-5" />
                          <span className="font-medium">Complete Payment</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please enter your payment details to complete the
                          booking.
                        </p>

                        <Elements
                          stripe={stripePromise}
                          options={{ clientSecret: stripeClientSecret }}
                        >
                          <StripePaymentForm
                            clientSecret={stripeClientSecret}
                            onSuccess={handleStripePaymentSuccess}
                            onError={handleStripePaymentError}
                          />
                        </Elements>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bank Payment Dialog */}
        <BankPaymentDialog
          open={showBankPaymentDialog}
          onOpenChange={setShowBankPaymentDialog}
          amount={totalAmount}
          onPaymentSuccess={handleBankPaymentSuccess}
          onPaymentError={handleBankPaymentError}
        />

        {/* Success Popup */}
        {paymentSuccessData && (
          <SuccessPopup
            isOpen={showSuccessPopup}
            onClose={() => {
              setShowSuccessPopup(false);
              setPaymentSuccessData(null);
            }}
            paymentMethod={paymentSuccessData.paymentMethod}
            amount={paymentSuccessData.amount}
            bookingDetails={paymentSuccessData.bookingDetails}
          />
        )}
      </div>
    </div>
  );
}
