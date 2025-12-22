// components/booking/edit-booking-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Users, DollarSign, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";

// Validation schema for editing
const editBookingSchema = z.object({
  checkInDate: z.string().min(1, "تاریخ ورود الزامی است"),
  checkOutDate: z.string().min(1, "تاریخ خروج الزامی است"),
  adults: z.number().min(1, "حداقل ۱ بزرگسال").max(10, "حداکثر ۱۰ بزرگسال"),
  children: z.number().min(0, "نمی‌تواند منفی باشد").max(10, "حداکثر ۱۰ کودک"),
  infants: z.number().min(0, "نمی‌تواند منفی باشد").max(5, "حداکثر ۵ نوزاد"),
  roomRate: z.number().positive("قیمت باید مثبت باشد"),
  status: z.string().min(1, "وضعیت الزامی است"),
  paymentStatus: z.string().min(1, "وضعیت پرداخت الزامی است"),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type EditBookingFormData = z.infer<typeof editBookingSchema>;

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

interface EditBookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export function EditBookingForm({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: EditBookingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditBookingFormData>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      checkInDate: "",
      checkOutDate: "",
      adults: 1,
      children: 0,
      infants: 0,
      roomRate: 0,
      status: "pending",
      paymentStatus: "pending",
      specialRequests: "",
      notes: "",
      source: "admin",
    },
  });

  // Pre-fill form when booking data changes
  useEffect(() => {
    if (booking && open) {
      const calculatedRoomRate =
        booking.totalAmount > 0 && booking.totalNights > 0
          ? booking.totalAmount / booking.totalNights
          : 0;

      form.reset({
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
        roomRate: calculatedRoomRate,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        specialRequests: booking.specialRequests || "",
        notes: booking.notes || "",
        source: booking.source || "admin",
      });
    }
  }, [booking, open, form]);

  // Calculate total nights and amount
  const checkInDate = form.watch("checkInDate");
  const checkOutDate = form.watch("checkOutDate");
  const roomRate = form.watch("roomRate");
  const adults = form.watch("adults");
  const children = form.watch("children");
  const infants = form.watch("infants");

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 0;
  };

  const totalNights = calculateNights();
  const totalAmount = totalNights * roomRate;

  const onSubmit = async (data: EditBookingFormData) => {
    if (!booking) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در بروزرسانی رزرو");
      }

      // Reset form and close dialog
      form.reset();
      onSuccess();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "خطای غیرمنتظره رخ داد"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setServerError(null);
    }
    onOpenChange(newOpen);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split("T")[0];
  };

  const statusOptions = [
    { value: "pending", label: "در انتظار" },
    { value: "confirmed", label: "تایید شده" },
    { value: "checked_in", label: "چک این شده" },
    { value: "checked_out", label: "چک اوت شده" },
    { value: "cancelled", label: "لغو شده" },
    { value: "no_show", label: "عدم حضور" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "در انتظار" },
    { value: "partial", label: "جزئی" },
    { value: "paid", label: "پرداخت شده" },
    { value: "failed", label: "ناموفق" },
  ];

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            ویرایش رزرو #{booking.bookingNumber}
          </DialogTitle>
          <DialogDescription>
            اطلاعات رزرو میهمان را بروزرسانی کنید. تمام فیلدهای علامت‌گذاری شده
            با * الزامی هستند.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Guest and Room Information (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-sm text-muted-foreground">میهمان</Label>
                <div className="font-medium">{booking.guestName}</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">اتاق</Label>
                <div className="font-medium">
                  {booking.roomNumber} - {booking.roomType}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkInDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاریخ ورود *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={getMinDate()}
                        max={getMaxDate()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOutDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاریخ خروج *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={checkInDate || getMinDate()}
                        max={getMaxDate()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Guests Count */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                تعداد نفرات *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>بزرگسال</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کودک (۲-۱۲ سال)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="infants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوزاد (۰-۲ سال)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت رزرو *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب وضعیت" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت پرداخت *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب وضعیت پرداخت" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Booking Summary */}
            {totalNights > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  خلاصه رزرو (بروزرسانی شده)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">تعداد شب</div>
                    <div className="font-medium">{totalNights} شب</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">قیمت هر شب</div>
                    <div className="font-medium">
                      {roomRate.toLocaleString("fa-IR")} افغانی
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">مبلغ کل جدید</div>
                    <div className="font-medium text-lg text-primary">
                      {totalAmount.toLocaleString("fa-IR")} افغانی
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">مبلغ قبلی</div>
                    <div className="font-medium line-through text-muted-foreground">
                      {booking.totalAmount.toLocaleString("fa-IR")} افغانی
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>پرداخت شده:</strong>{" "}
                    {booking.paidAmount.toLocaleString("fa-IR")} افغانی
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>باقیمانده جدید:</strong>{" "}
                    {(totalAmount - booking.paidAmount).toLocaleString("fa-IR")}{" "}
                    افغانی
                  </div>
                </div>
              </div>
            )}

            {/* Room Rate */}
            <FormField
              control={form.control}
              name="roomRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    قیمت هر شب (افغانی) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Requests */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>درخواست‌های ویژه</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="درخواست‌های خاص میهمان (اختیاری)..."
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>یادداشت‌های داخلی</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="یادداشت‌های مدیریتی (اختیاری)..."
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>منبع رزرو</FormLabel>
                  <FormControl>
                    <Input placeholder="وب‌سایت، تلفن، حضوری..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                لغو
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || totalNights <= 0}
                className="min-w-[120px]"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "در حال بروزرسانی..." : "بروزرسانی رزرو"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
