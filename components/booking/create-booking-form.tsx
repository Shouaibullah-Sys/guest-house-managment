// components/booking/create-booking-form.tsx

"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Users, DollarSign } from "lucide-react";
import { GuestSelector } from "./guest-selector";
import { RoomSelector } from "./room-selector";
import { Label } from "@/components/ui/label";

// Validation schema
const createBookingSchema = z.object({
  guestId: z.string().min(1, "انتخاب میهمان الزامی است"),
  roomId: z.string().min(1, "انتخاب اتاق الزامی است"),
  checkInDate: z.string().min(1, "تاریخ ورود الزامی است"),
  checkOutDate: z.string().min(1, "تاریخ خروج الزامی است"),
  adults: z.number().min(1, "حداقل ۱ بزرگسال").max(10, "حداکثر ۱۰ بزرگسال"),
  children: z.number().min(0, "نمی‌تواند منفی باشد").max(10, "حداکثر ۱۰ کودک"),
  infants: z.number().min(0, "نمی‌تواند منفی باشد").max(5, "حداکثر ۵ نوزاد"),
  roomRate: z.number().positive("قیمت باید مثبت باشد"),
  specialRequests: z.string().optional(),
  source: z.string().optional(),
  createdBy: z.string().optional(),
});

type CreateBookingFormData = z.infer<typeof createBookingSchema>;

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  view?: string;
  features?: string[];
  roomType: {
    id: string;
    name: string;
    code: string;
    basePrice: string;
    maxOccupancy: number;
    amenities?: string[];
  };
}

interface CreateBookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBookingForm({
  open,
  onOpenChange,
  onSuccess,
}: CreateBookingFormProps) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guestId: "",
      roomId: "",
      checkInDate: "",
      checkOutDate: "",
      adults: 1,
      children: 0,
      infants: 0,
      roomRate: 0,
      specialRequests: "",
      source: "admin",
      createdBy: "",
    },
  });

  // Auto-fill room rate when room is selected
  const handleRoomSelect = (room: Room | null) => {
    setSelectedRoom(room);
    if (room) {
      form.setValue("roomId", room.id);
      form.setValue("roomRate", parseFloat(room.roomType.basePrice));
    } else {
      form.setValue("roomId", "");
      form.setValue("roomRate", 0);
    }
  };

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

  const onSubmit = async (data: CreateBookingFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          guestId: selectedGuest?.id,
          roomId: selectedRoom?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ایجاد رزرو");
      }

      // Reset form and close dialog
      form.reset();
      setSelectedGuest(null);
      setSelectedRoom(null);
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
      form.reset();
      setSelectedGuest(null);
      setSelectedRoom(null);
      setServerError(null);
    }
    onOpenChange(newOpen);
  };

  const handleNewGuest = () => {
    // You can implement a guest creation dialog here
    console.log("Create new guest");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ایجاد رزرو جدید</DialogTitle>
          <DialogDescription>
            یک رزرو جدید برای میهمان ایجاد کنید. تمام فیلدهای علامت‌گذاری شده با
            * الزامی هستند.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Guest Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">اطلاعات میهمان *</Label>
              <GuestSelector
                onGuestSelect={(guest) => {
                  setSelectedGuest(guest);
                  form.setValue("guestId", guest?.id || "");
                }}
                onNewGuest={handleNewGuest}
                value={selectedGuest}
              />
              <FormMessage />
            </div>

            {/* Room Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">انتخاب اتاق *</Label>
              <RoomSelector
                onRoomSelect={handleRoomSelect}
                value={selectedRoom}
              />
              <FormMessage />
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

            {/* Booking Summary */}
            {totalNights > 0 && selectedRoom && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  خلاصه رزرو
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
                    <div className="text-muted-foreground">مبلغ کل</div>
                    <div className="font-medium text-lg text-primary">
                      {totalAmount.toLocaleString("fa-IR")} افغانی
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ظرفیت</div>
                    <div className="font-medium">
                      {adults + children} نفر (حداکثر{" "}
                      {selectedRoom.roomType.maxOccupancy})
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room Rate (Read-only) */}
            <FormField
              control={form.control}
              name="roomRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    قیمت هر شب (افغانی)
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
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={
                  isSubmitting ||
                  !selectedGuest ||
                  !selectedRoom ||
                  totalNights <= 0
                }
                className="min-w-[120px]"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "در حال ایجاد..." : "ایجاد رزرو"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
