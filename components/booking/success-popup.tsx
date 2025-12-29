// components/booking/success-popup.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Calendar,
  CreditCard,
  Building2,
  Banknote,
  X,
} from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "cash" | "bank" | "stripe";
  amount: number;
  bookingDetails?: {
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    guestName?: string;
  };
}

export function SuccessPopup({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  bookingDetails,
}: SuccessPopupProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show content with a slight delay for better UX
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);

      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    } else {
      setShowContent(false);
    }
  }, [isOpen, onClose]);

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case "cash":
        return <Banknote className="h-8 w-8 text-green-600" />;
      case "bank":
        return <Building2 className="h-8 w-8 text-blue-600" />;
      case "stripe":
        return <CreditCard className="h-8 w-8 text-purple-600" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case "cash":
        return "Cash Payment";
      case "bank":
        return "Bank Card Payment";
      case "stripe":
        return "Stripe Payment";
      default:
        return "Payment";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {showContent && (
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  {getPaymentIcon()}
                </div>
              </div>
              <DialogTitle className="text-xl font-bold text-green-600">
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your payment has been processed successfully
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Payment Summary */}
              <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Payment Method
                    </span>
                    <span className="font-medium">
                      {getPaymentMethodName()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Amount Paid
                    </span>
                    <span className="font-bold text-green-600">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {bookingDetails && (
                <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {bookingDetails.guestName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guest</span>
                        <span className="font-medium">
                          {bookingDetails.guestName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-medium">
                        {bookingDetails.roomNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium">
                        {formatDate(bookingDetails.checkInDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">
                        {formatDate(bookingDetails.checkOutDate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  🎉 Your booking is now confirmed! A confirmation email has
                  been sent to your registered email address.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={!showContent}
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    window.location.href = "/";
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!showContent}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
