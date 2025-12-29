// components/booking/create-booking-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Users, DollarSign, Building, Phone } from "lucide-react";
import { GuestSelector } from "./guest-selector";
import { RoomSelector } from "./room-selector";
import { Label } from "@/components/ui/label";
import { roomAvailabilityFormSchema } from "@/lib/validation/room-frontend";
import { type RoomResponse } from "@/lib/validation/room";

// Enhanced validation schema using our comprehensive validation
const createBookingSchema = z.object({
  guest: z.string().min(1, "انتخاب میهمان الزامی است"),
  room: z.string().min(1, "انتخاب اتاق الزامی است"),
  checkInDate: z.string().min(1, "تاریخ ورود الزامی است"),
  checkOutDate: z.string().min(1, "تاریخ خروج الزامی است"),
  adults: z.number().min(1, "حداقل ۱ بزرگسال").max(10, "حداکثر ۱۰ بزرگسال"),
  children: z.number().min(0, "نمی‌تواند منفی باشد").max(10, "حداکثر ۱۰ کودک"),
  infants: z.number().min(0, "نمی‌تواند منفی باشد").max(5, "حداکثر ۵ نوزاد"),
  roomRate: z.number().positive("قیمت باید مثبت باشد"),
  specialRequests: z.string().optional(),
  source: z.string().optional(),
  createdBy: z.string().optional(),
}).refine(
  (data) => {
    if (data.checkInDate && data.checkOutDate) {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    }
    return true;
  },
  { 
    message: "تاریخ خروج باید بعد از تاریخ ورود باشد", 
    path: ["checkOutDate"] 
  }
);

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
  roomType: {
    id: string;
    name: string;
    code: string;
    basePrice: number;
    maxOccupancy: number;
    amenities?: string[];
    viewType?: string;
  };
}

// Use the validated RoomResponse type from validation schemas
type ValidatedRoom = RoomResponse;

interface CreateBookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onNavigateToSales?: (guestName: string, bookingId: string) => void;
  preSelectedGuest?: Guest | null;
}

export function CreateBookingForm({
  open,
  onOpenChange,
  onSuccess,
  onNavigateToSales,
  preSelectedGuest,
}: CreateBookingFormProps) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(preSelectedGuest || null);
  const [selectedRoom, setSelectedRoom] = useState<ValidatedRoom | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guest: preSelectedGuest?.id || "",
      room: "",
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

  // Set pre-selected guest when component mounts or preSelectedGuest changes
  useEffect(() => {
    if (preSelectedGuest) {
      setSelectedGuest(preSelectedGuest);
      form.setValue("guest", preSelectedGuest.id);
    }
  }, [preSelectedGuest, form]);

  // Auto-fill room rate when room is selected with validation
  const handleRoomSelect = (room: ValidatedRoom | null) => {
    setSelectedRoom(room);
    if (room && room.roomType) {
      form.setValue("room", room.id);
      // Validate room rate is positive
      if (room.roomType.basePrice > 0) {
        form.setValue("roomRate", room.roomType.basePrice);
      } else {
        form.setValue("roomRate", 0);
      }
    } else {
      form.setValue("room", "");
      form.setValue("roomRate", 0);
    }
  };

  // Calculate total nights and amount with enhanced validation
  const checkInDate = form.watch("checkInDate");
  const checkOutDate = form.watch("checkOutDate");
  const roomRate = form.watch("roomRate");
  const adults = form.watch("adults");
  const children = form.watch("children");
  const infants = form.watch("infants");

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    
    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      // Validate dates are valid
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return 0;
      }
      
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return nights > 0 ? nights : 0;
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  const totalNights = calculateNights();
  const totalAmount = totalNights * roomRate;

  // Validate room capacity
  const totalGuests = adults + children;
  const isOverCapacity = Boolean(selectedRoom && selectedRoom.roomType && totalGuests > selectedRoom.roomType.maxOccupancy);

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
          guest: selectedGuest?.id,
          room: selectedRoom?.id,
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
      
      // Call success callback
      onSuccess();
      
      // Navigate to sales page with guest info if callback provided
      if (onNavigateToSales && selectedGuest) {
        onNavigateToSales(selectedGuest.name, result.data.id);
      }
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
<DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[95vh] overflow-y-auto px-4">    
        <DialogHeader>
          <DialogTitle className="text-xl">ایجاد رزرو جدید</DialogTitle>
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

            {/* Main Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Guest & Booking Details */}
              <div className="space-y-6">
                {/* Guest Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">اطلاعات میهمان *</Label>
                  </div>
                  <GuestSelector
                    onGuestSelect={(guest) => {
                      setSelectedGuest(guest);
                      form.setValue("guest", guest?.id || "");
                    }}
                    onNewGuest={handleNewGuest}
                    value={selectedGuest}
                  />
                  <FormMessage />
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">تاریخ‌های رزرو</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ ورود *</FormLabel>
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
                          <FormLabel>تاریخ خروج *</FormLabel>
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
                </div>

                {/* Guests Count */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">تعداد نفرات *</Label>
                  </div>
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
              </div>

              {/* Right Column - Room & Additional Info */}
              <div className="space-y-6">
                {/* Room Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">انتخاب اتاق *</Label>
                  </div>
                  <RoomSelector
                    onRoomSelect={handleRoomSelect}
                    value={selectedRoom}
                  />
                  <FormMessage />
                </div>

                {/* Room Rate */}
                <FormField
                  control={form.control}
                  name="roomRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
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

                {/* Booking Summary */}
                {totalNights > 0 && selectedRoom && selectedRoom.roomType && (
                  <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">خلاصه رزرو</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
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
                      <div className="col-span-2">
                        <div className="text-muted-foreground">مبلغ کل</div>
                        <div className="font-medium text-lg text-primary">
                          {totalAmount.toLocaleString("fa-IR")} افغانی
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground">ظرفیت</div>
                        <div className="font-medium">
                          {adults + children} نفر (حداکثر{" "}
                          {selectedRoom.roomType.maxOccupancy})
                        </div>
                        {isOverCapacity && (
                          <div className="text-red-600 text-sm">
                            ⚠️ ظرفیت اتاق کافی نیست!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Source */}
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        منبع رزرو
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="وب‌سایت، تلفن، حضوری..." {...field} />
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
                        <Textarea
                          placeholder="درخواست‌های خاص میهمان (اختیاری)..."
                          className="min-h-[100px]"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  لغو
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !selectedGuest ||
                    !selectedRoom ||
                    !selectedRoom.roomType ||
                    totalNights <= 0 ||
                    isOverCapacity
                  }
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "در حال ایجاد..." : "ایجاد رزرو"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}