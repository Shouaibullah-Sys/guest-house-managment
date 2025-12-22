// components/booking/payment-dialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Reuse the Booking interface from edit-booking-form
interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  adults: number;
  children: number;
  infants: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  paymentStatus: string;
  source: string;
  specialRequests?: string;
  notes?: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  booking,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [processedBy, setProcessedBy] = useState("");

  if (!booking) return null;

  // Calculate remaining balance with null safety
  const totalAmount = booking.totalAmount || 0;
  const paidAmount = booking.paidAmount || 0;
  const outstandingAmount = booking.outstandingAmount || 0;
  const remainingBalance = outstandingAmount;
  const suggestedAmount = Math.min(
    paymentAmount || remainingBalance,
    remainingBalance
  );

  const handlePayment = async () => {
    if (!booking || !booking.id) return;

    if (paymentAmount <= 0) {
      alert("مبلغ پرداخت باید بیشتر از صفر باشد");
      return;
    }

    if (paymentAmount > remainingBalance) {
      alert("مبلغ پرداخت نمی‌تواند بیشتر از مانده بدهکاری باشد");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          transactionId: transactionId || null,
          notes,
          processedBy: processedBy || "Admin",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process payment");
      }

      // Success
      onPaymentSuccess();
      onOpenChange(false);

      // Reset form
      setPaymentAmount(0);
      setPaymentMethod("cash");
      setTransactionId("");
      setNotes("");
      setProcessedBy("");
    } catch (error) {
      console.error("Payment error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "نقدی", icon: "💵" },
    { value: "credit_card", label: "کارت اعتباری", icon: "💳" },
    { value: "debit_card", label: "کارت بدهی", icon: "💳" },
    { value: "bank_transfer", label: "حواله بانکی", icon: "🏦" },
    { value: "online", label: "آنلاین", icon: "🌐" },
    { value: "wallet", label: "کیف پول", icon: "👛" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            ثبت پرداخت
          </DialogTitle>
          <DialogDescription>
            دریافت وجه برای رزرو #{booking.bookingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{booking.guestName}</div>
              <Badge variant="outline">اتاق {booking.roomNumber}</Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">مبلغ کل</Label>
                <div className="font-medium">
                  {totalAmount.toLocaleString()} افغانی
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  پرداخت شده
                </Label>
                <div className="font-medium text-green-600">
                  {paidAmount.toLocaleString()} افغانی
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">مانده</Label>
                <div className="font-medium text-amber-600">
                  {remainingBalance.toLocaleString()} افغانی
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  وضعیت پرداخت
                </Label>
                <div>
                  {(() => {
                    switch (booking.paymentStatus) {
                      case "paid":
                        return (
                          <Badge className="bg-green-600">پرداخت شده</Badge>
                        );
                      case "partial":
                        return (
                          <Badge
                            variant="outline"
                            className="border-amber-600 text-amber-600"
                          >
                            جزئی
                          </Badge>
                        );
                      default:
                        return (
                          <Badge
                            variant="outline"
                            className="border-red-600 text-red-600"
                          >
                            پرداخت نشده
                          </Badge>
                        );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="paymentAmount"
                className="flex items-center gap-2 mb-2"
              >
                <DollarSign className="h-4 w-4" />
                مبلغ پرداختی
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  max={remainingBalance}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder={`حداکثر ${remainingBalance.toLocaleString()}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(suggestedAmount)}
                  className="whitespace-nowrap"
                >
                  پرداخت کامل
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مانده قابل پرداخت: {remainingBalance.toLocaleString()} افغانی
              </p>
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="mb-2">
                روش پرداخت
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب روش پرداخت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <span>💵</span>
                      <span>نقدی</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>کارت اعتباری</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="debit_card">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>کارت بدهی</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <span>🏦</span>
                      <span>حواله بانکی</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>آنلاین</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="wallet">
                    <div className="flex items-center gap-2">
                      <span>👛</span>
                      <span>کیف پول</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(paymentMethod === "credit_card" ||
              paymentMethod === "debit_card" ||
              paymentMethod === "bank_transfer" ||
              paymentMethod === "online") && (
              <div>
                <Label
                  htmlFor="transactionId"
                  className="flex items-center gap-2 mb-2"
                >
                  <Receipt className="h-4 w-4" />
                  شماره تراکنش / رهگیری
                </Label>
                <Input
                  id="transactionId"
                  placeholder="شماره تراکنش بانکی"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  برای پیگیری‌های بعدی ضروری است
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="processedBy" className="mb-2">
                ثبت شده توسط
              </Label>
              <Input
                id="processedBy"
                placeholder="نام کارمند"
                value={processedBy}
                onChange={(e) => setProcessedBy(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">
                یادداشت‌ها
              </Label>
              <Textarea
                id="notes"
                placeholder="توضیحات اضافی در مورد پرداخت..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Payment Preview */}
          {paymentAmount > 0 && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                پیش‌نمایش پرداخت
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>مانده قبلی:</span>
                  <span>{remainingBalance.toLocaleString()} افغانی</span>
                </div>

                <div className="flex justify-between">
                  <span>مبلغ پرداختی:</span>
                  <span className="text-green-600">
                    - {paymentAmount.toLocaleString()} افغانی
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-bold">
                  <span>مانده جدید:</span>
                  <span
                    className={
                      remainingBalance - paymentAmount === 0
                        ? "text-green-600"
                        : "text-amber-600"
                    }
                  >
                    {(remainingBalance - paymentAmount).toLocaleString()} افغانی
                  </span>
                </div>

                {remainingBalance - paymentAmount === 0 && (
                  <div className="text-center text-green-600 text-xs font-medium mt-2">
                    🎉 این پرداخت مانده را صفر خواهد کرد
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  نکات مهم
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>رسید رسمی به مهمان ارائه دهید</li>
                  <li>اطلاعات تراکنش را صحیح ثبت کنید</li>
                  <li>در صورت پرداخت نقدی، فیش بانکی دریافت کنید</li>
                  <li>تغییر وضعیت رزرو پس از پرداخت کامل</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isLoading || paymentAmount <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              "در حال پردازش..."
            ) : (
              <>
                <CreditCard className="ml-2 h-4 w-4" />
                ثبت پرداخت
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
