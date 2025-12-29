// components/booking/bank-payment-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Building2,
  User,
  Hash,
  Calendar,
  Lock,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BankPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

interface BankDetails {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  bankName: string;
}

export function BankPaymentDialog({
  open,
  onOpenChange,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: BankPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "form" | "processing" | "success"
  >("form");
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    bankName: "",
  });
  const [errors, setErrors] = useState<Partial<BankDetails>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetails> = {};

    // Validate card number (16 digits)
    const cleanCardNumber = bankDetails.cardNumber.replace(/\s/g, "");
    if (
      !cleanCardNumber ||
      cleanCardNumber.length !== 16 ||
      !/^\d+$/.test(cleanCardNumber)
    ) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    // Validate cardholder name
    if (!bankDetails.cardholderName || bankDetails.cardholderName.length < 3) {
      newErrors.cardholderName = "Please enter the cardholder name";
    }

    // Validate expiry month
    const month = parseInt(bankDetails.expiryMonth);
    if (!bankDetails.expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = "Invalid month";
    }

    // Validate expiry year
    const currentYear = new Date().getFullYear() % 100;
    const year = parseInt(bankDetails.expiryYear);
    if (
      !bankDetails.expiryYear ||
      year < currentYear ||
      year > currentYear + 10
    ) {
      newErrors.expiryYear = "Invalid year";
    }

    // Validate CVV (3-4 digits)
    if (
      !bankDetails.cvv ||
      bankDetails.cvv.length < 3 ||
      bankDetails.cvv.length > 4 ||
      !/^\d+$/.test(bankDetails.cvv)
    ) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    // Validate bank name
    if (!bankDetails.bankName || bankDetails.bankName.length < 2) {
      newErrors.bankName = "Please enter your bank name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    if (field === "cardNumber") {
      value = formatCardNumber(value);
    } else if (
      field === "expiryMonth" ||
      field === "expiryYear" ||
      field === "cvv"
    ) {
      value = value.replace(/\D/g, "");
    }

    setBankDetails((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const simulatePayment = async (): Promise<boolean> => {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For testing: simulate successful payment (90% success rate)
    // Using specific test card numbers for different scenarios
    const cleanCardNumber = bankDetails.cardNumber.replace(/\s/g, "");

    // Test card numbers:
    // 4111111111111111 - Always succeeds
    // 4000000000000002 - Always fails (insufficient funds)
    // Any other valid 16-digit number - 90% success rate

    if (cleanCardNumber === "4000000000000002") {
      return false; // Simulate declined payment
    }

    if (cleanCardNumber === "4111111111111111") {
      return true; // Simulate successful payment
    }

    // Random success for other cards
    return Math.random() > 0.1;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setPaymentStep("processing");

    try {
      const success = await simulatePayment();

      if (success) {
        setPaymentStep("success");
        // Wait a moment to show success message
        await new Promise((resolve) => setTimeout(resolve, 1500));
        onPaymentSuccess();
        resetForm();
      } else {
        setPaymentStep("form");
        onPaymentError(
          "Payment declined. Please check your card details or try a different card."
        );
      }
    } catch (error) {
      setPaymentStep("form");
      onPaymentError("Payment processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBankDetails({
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      bankName: "",
    });
    setErrors({});
    setPaymentStep("form");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Bank Card Payment
          </DialogTitle>
          <DialogDescription>
            Enter your bank card details to complete the payment
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Processing Payment...
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your payment
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Payment Successful!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your payment of ${amount.toLocaleString()} has been processed
            </p>
          </div>
        )}

        {paymentStep === "form" && (
          <>
            {/* Amount Display */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Amount to Pay
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Test Mode Banner */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Test Mode Active
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Use test card:{" "}
                    <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
                      4111 1111 1111 1111
                    </code>{" "}
                    for successful payment. Use{" "}
                    <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
                      4000 0000 0000 0002
                    </code>{" "}
                    to test declined payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details Form */}
            <div className="space-y-4">
              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  placeholder="e.g., Afghanistan International Bank"
                  value={bankDetails.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  className={errors.bankName ? "border-red-500" : ""}
                />
                {errors.bankName && (
                  <p className="text-xs text-red-500">{errors.bankName}</p>
                )}
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={bankDetails.cardNumber}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  maxLength={19}
                  className={errors.cardNumber ? "border-red-500" : ""}
                />
                {errors.cardNumber && (
                  <p className="text-xs text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="cardholderName"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Cardholder Name
                </Label>
                <Input
                  id="cardholderName"
                  placeholder="JOHN DOE"
                  value={bankDetails.cardholderName}
                  onChange={(e) =>
                    handleInputChange(
                      "cardholderName",
                      e.target.value.toUpperCase()
                    )
                  }
                  className={errors.cardholderName ? "border-red-500" : ""}
                />
                {errors.cardholderName && (
                  <p className="text-xs text-red-500">
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="expiryMonth"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Month
                  </Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={bankDetails.expiryMonth}
                    onChange={(e) =>
                      handleInputChange("expiryMonth", e.target.value)
                    }
                    maxLength={2}
                    className={errors.expiryMonth ? "border-red-500" : ""}
                  />
                  {errors.expiryMonth && (
                    <p className="text-xs text-red-500">{errors.expiryMonth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    value={bankDetails.expiryYear}
                    onChange={(e) =>
                      handleInputChange("expiryYear", e.target.value)
                    }
                    maxLength={2}
                    className={errors.expiryYear ? "border-red-500" : ""}
                  />
                  {errors.expiryYear && (
                    <p className="text-xs text-red-500">{errors.expiryYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="***"
                    value={bankDetails.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    maxLength={4}
                    className={errors.cvv ? "border-red-500" : ""}
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ${amount.toLocaleString()}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
