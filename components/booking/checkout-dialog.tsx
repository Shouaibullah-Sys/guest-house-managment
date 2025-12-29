// components/booking/checkout-dialog.tsx
"use client";

import { useState, useEffect } from "react";
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
  Clock,
  User,
  DollarSign,
  Calculator,
  AlertTriangle,
  Receipt,
  Building,
  Key,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CheckOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onCheckOutSuccess: () => void;
}

export function CheckOutDialog({
  open,
  onOpenChange,
  booking,
  onCheckOutSuccess,
}: CheckOutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string>(
    new Date().toISOString().split("T")[1].slice(0, 5)
  );
  const [actualNights, setActualNights] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [processedBy, setProcessedBy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [roomStatus, setRoomStatus] = useState("cleaning");

  useEffect(() => {
    if (booking && booking.actualCheckIn) {
      const checkIn = new Date(booking.actualCheckIn);
      const checkOut = new Date();
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      setActualNights(diffDays > 0 ? diffDays : 1);
    } else if (booking && booking.checkInDate) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date();
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      setActualNights(diffDays > 0 ? diffDays : 1);
    }
  }, [booking]);

  if (!booking) return null;

  // Calculate charges
  const nightlyRate = booking.totalAmount / (booking.totalNights || 1);
  const roomCharges = nightlyRate * actualNights;
  const totalExtraCharges = extraCharges;
  const finalTotal = roomCharges + totalExtraCharges;
  const balanceDue = finalTotal - (booking.paidAmount || 0);

  const handleCheckOut = async () => {
    if (!booking || !booking.id) return;

    setIsLoading(true);
    try {
      // Prepare check-out time
      const checkOutDate = new Date();
      const [hours, minutes] = checkOutTime.split(":");
      checkOutDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      const checkOutData = {
        actualCheckOut: checkOutDate.toISOString(),
        actualNights,
        extraCharges,
        notes: notes.trim(),
        processedBy: processedBy.trim() || "Administrator",
        finalAmount: finalTotal,
        balanceDue,
        paymentMethod,
        roomStatus,
      };

      const response = await fetch(`/api/bookings/${booking.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkOutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check out");
      }

      // Success
      toast("✅ چک اوت موفق", {
        description: `مهمان با موفقیت چک اوت شد. مبلغ نهایی: ${finalTotal.toLocaleString()} افغانی`,
      });

      onCheckOutSuccess();
      onOpenChange(false);

      // Reset form
      setExtraCharges(0);
      setNotes("");
      setProcessedBy("");
      setPaymentMethod("cash");
      setRoomStatus("cleaning");
    } catch (error) {
      console.error("Check-out error:", error);
      toast("❌ خطا در چک اوت", {
        description:
          error instanceof Error ? error.message : "عملیات با شکست مواجه شد",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[95vh] overflow-y-auto px-4">    
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            چک اوت مهمان
          </DialogTitle>
          <DialogDescription>
            خروج مهمان و تسویه حساب اتاق {booking.roomNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Summary */}
          <div className="rounded-lg border p-4 space-y-3 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold">{booking.guestName}</h3>
                  <p className="text-sm text-muted-foreground">
                    اتاق {booking.roomNumber} • {booking.roomType}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">
                #{booking.bookingNumber}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  تاریخ ورود
                </Label>
                <div className="text-sm">
                  {booking.actualCheckIn
                    ? format(
                        new Date(booking.actualCheckIn),
                        "yyyy/MM/dd HH:mm"
                      )
                    : format(new Date(booking.checkInDate), "yyyy/MM/dd")}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  تاریخ خروج برنامه‌ای
                </Label>
                <div className="text-sm">
                  {format(new Date(booking.checkOutDate), "yyyy/MM/dd")}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  پرداخت شده
                </Label>
                <div className="font-medium text-green-600">
                  {booking.paidAmount?.toLocaleString() || "0"} افغانی
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

          {/* Check-out Details */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="checkOutTime"
                className="flex items-center gap-2 mb-2"
              >
                <Clock className="h-4 w-4" />
                زمان واقعی خروج
              </Label>
              <Input
                id="checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actualNights" className="mb-2">
                  تعداد شب‌های واقعی
                </Label>
                <Input
                  id="actualNights"
                  type="number"
                  min="1"
                  value={actualNights}
                  onChange={(e) =>
                    setActualNights(parseInt(e.target.value) || 1)
                  }
                />
              </div>

              <div>
                <Label htmlFor="roomCharges" className="mb-2">
                  هزینه اتاق (شبانه)
                </Label>
                <div className="p-2 border rounded text-center font-medium">
                  {nightlyRate.toLocaleString()} افغانی
                </div>
              </div>
            </div>

            {/* Extra Charges */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                هزینه‌های اضافی
              </h4>

              <div>
                <Label htmlFor="extraCharges" className="mb-2">
                  مبلغ خدمات اضافی (افغانی)
                </Label>
                <Input
                  id="extraCharges"
                  type="number"
                  placeholder="0"
                  value={extraCharges}
                  onChange={(e) =>
                    setExtraCharges(parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مینی‌بار، لاندری، روم سرویس، خسارت، سایر
                </p>
              </div>
            </div>

            {/* Final Calculation */}
            <div className="rounded-lg border p-4 space-y-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                محاسبه نهایی
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>هزینه اتاق ({actualNights} شب):</span>
                  <span>{roomCharges.toLocaleString()} افغانی</span>
                </div>

                {extraCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>هزینه‌های اضافی:</span>
                    <span className="text-amber-600">
                      + {extraCharges.toLocaleString()} افغانی
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between font-medium text-base">
                  <span>مبلغ کل:</span>
                  <span>{finalTotal.toLocaleString()} افغانی</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>پرداخت شده:</span>
                  <span className="text-green-600">
                    - {booking.paidAmount?.toLocaleString() || "0"} افغانی
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-lg font-bold">
                  <span>مانده قابل پرداخت:</span>
                  <span
                    className={
                      balanceDue > 0 ? "text-amber-600" : "text-green-600"
                    }
                  >
                    {balanceDue.toLocaleString()} افغانی
                  </span>
                </div>
              </div>
            </div>

            {/* Payment and Room Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod" className="mb-2">
                  روش پرداخت
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب روش" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدی</SelectItem>
                    <SelectItem value="credit_card">کارت اعتباری</SelectItem>
                    <SelectItem value="debit_card">کارت بدهی</SelectItem>
                    <SelectItem value="bank_transfer">حواله بانکی</SelectItem>
                    <SelectItem value="online">آنلاین</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roomStatus" className="mb-2">
                  وضعیت اتاق بعد از خروج
                </Label>
                <Select value={roomStatus} onValueChange={setRoomStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">نیاز به نظافت</SelectItem>
                    <SelectItem value="maintenance">نیاز به تعمیر</SelectItem>
                    <SelectItem value="available">آماده پذیرش</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="processedBy" className="mb-2">
                ثبت کننده
              </Label>
              <Input
                id="processedBy"
                placeholder="نام کارمند مسئول"
                value={processedBy}
                onChange={(e) => setProcessedBy(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">
                توضیحات و یادداشت‌ها
              </Label>
              <Textarea
                id="notes"
                placeholder="وضعیت اتاق، بازخورد مهمان، موارد خاص، لوازم مفقودی..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Important Checklist */}
          <div className="rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✅ چک‌لیست چک اوت
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <Building className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>بررسی کامل اتاق توسط مسئول خانه‌داری</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Receipt className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>صدور فیش و تسویه حساب کامل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>دریافت کلید/کارت اتاق</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <User className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>دریافت بازخورد از مهمان</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>به‌روزرسانی وضعیت اتاق در سیستم</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                {balanceDue > 0 ? "صدور فیش و خروج" : "تایید خروج"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
