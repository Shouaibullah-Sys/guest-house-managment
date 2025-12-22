// components/booking/checkin-dialog.tsx
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
  Clock,
  User,
  Key,
  AlertTriangle,
  CheckCircle,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onCheckInSuccess: () => void;
}

export function CheckInDialog({
  open,
  onOpenChange,
  booking,
  onCheckInSuccess,
}: CheckInDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>(
    new Date().toISOString().split("T")[1].slice(0, 5)
  );
  const [notes, setNotes] = useState("");
  const [roomKeyNumber, setRoomKeyNumber] = useState("");
  const [processedBy, setProcessedBy] = useState("");
  const [collectPayment, setCollectPayment] = useState(false);
  const [advancePayment, setAdvancePayment] = useState<number>(0);

  if (!booking) return null;

  const handleCheckIn = async () => {
    if (!booking || !booking.id) return;

    setIsLoading(true);
    try {
      // Get check-in date and time
      const checkInDate = new Date(booking.checkInDate);
      const [hours, minutes] = checkInTime.split(":");
      checkInDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      const checkInData = {
        actualCheckIn: checkInDate.toISOString(),
        notes: notes.trim(),
        roomKeyNumber: roomKeyNumber.trim(),
        processedBy: processedBy.trim() || "Administrator",
        collectPayment,
        advancePayment: collectPayment ? advancePayment : 0,
      };

      const response = await fetch(`/api/bookings/${booking.id}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkInData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check in");
      }

      // Success
      toast("✅ چک این موفق", {
        description: `مهمان با موفقیت چک این شد. شماره کلید: ${roomKeyNumber || "ندارد"}`,
      });

      onCheckInSuccess();
      onOpenChange(false);

      // Reset form
      setNotes("");
      setRoomKeyNumber("");
      setProcessedBy("");
      setCollectPayment(false);
      setAdvancePayment(0);
    } catch (error) {
      console.error("Check-in error:", error);
      toast("❌ خطا در چک این", {
        description:
          error instanceof Error ? error.message : "عملیات با شکست مواجه شد",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            چک این مهمان
          </DialogTitle>
          <DialogDescription>
            تایید ورود مهمان و تحویل اتاق {booking.roomNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Summary */}
          <div className="rounded-lg border p-4 space-y-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{booking.guestName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.guestPhone || "بدون شماره تماس"}
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                #{booking.bookingNumber}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  اتاق
                </Label>
                <div className="font-medium">{booking.roomNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {booking.roomType}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  مدت اقامت
                </Label>
                <div className="font-medium">{calculateNights()} شب</div>
                <div className="text-sm text-muted-foreground">
                  {booking.adults} بزرگسال، {booking.children || 0} کودک
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  ورود برنامه‌ای
                </Label>
                <div className="text-sm">
                  {format(new Date(booking.checkInDate), "yyyy/MM/dd")}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  خروج برنامه‌ای
                </Label>
                <div className="text-sm">
                  {format(new Date(booking.checkOutDate), "yyyy/MM/dd")}
                </div>
              </div>
            </div>
          </div>

          {/* Check-in Details Form */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="checkInTime"
                className="flex items-center gap-2 mb-2"
              >
                <Clock className="h-4 w-4" />
                زمان واقعی ورود
              </Label>
              <Input
                id="checkInTime"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                زمان دقیق ورود مهمان را ثبت کنید
              </p>
            </div>

            <div>
              <Label htmlFor="roomKeyNumber" className="mb-2">
                شماره کلید/کارت اتاق
              </Label>
              <Input
                id="roomKeyNumber"
                placeholder="مثال: 101-A یا 205-B"
                value={roomKeyNumber}
                onChange={(e) => setRoomKeyNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                شماره کلید یا کارت دسترسی اختصاص داده شده
              </p>
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

            {/* Payment Collection */}
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    دریافت پیش پرداخت
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    دریافت بخشی از مبلغ در هنگام چک این
                  </p>
                </div>
                <Switch
                  checked={collectPayment}
                  onCheckedChange={setCollectPayment}
                />
              </div>

              {collectPayment && (
                <div className="space-y-2">
                  <Label htmlFor="advancePayment" className="mb-2">
                    مبلغ پیش پرداخت (افغانی)
                  </Label>
                  <Input
                    id="advancePayment"
                    type="number"
                    placeholder="مبلغ به افغانی"
                    value={advancePayment}
                    onChange={(e) =>
                      setAdvancePayment(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max={booking.outstandingAmount || 0}
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      مانده قابل پرداخت:{" "}
                      {booking.outstandingAmount?.toLocaleString() || "0"}{" "}
                      افغانی
                    </p>
                    <p>
                      پیشنهاد:{" "}
                      {Math.round(
                        (booking.outstandingAmount || 0) * 0.3
                      ).toLocaleString()}{" "}
                      افغانی (30%)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">
                توضیحات و یادداشت‌ها
              </Label>
              <Textarea
                id="notes"
                placeholder="یادداشت‌های اضافی، درخواست‌های ویژه، ملاحظات..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Important Checklist */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  ✅ چک‌لیست چک این
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>کارت شناسایی مهمان را بررسی کنید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>فرم ثبت ورود را تکمیل کنید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>شرایط اقامت و قوانین را توضیح دهید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>ساعات صبحانه و خدمات را اطلاع دهید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>کلید/کارت اتاق را تحویل دهید</span>
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
            onClick={handleCheckIn}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                تایید چک این
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
