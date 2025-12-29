// components/booking/create-booking-dialog.tsx

"use client";

import { useState } from "react";
import { CreateBookingForm } from "./create-booking-form";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
  onNavigateToSales?: (guestName: string, bookingId: string) => void;
  preSelectedGuest?: any;
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  onBookingCreated,
  onNavigateToSales,
  preSelectedGuest,
}: CreateBookingDialogProps) {
  const handleBookingCreated = () => {
    onBookingCreated();
    onOpenChange(false);
  };

  return (
    <CreateBookingForm
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={handleBookingCreated}
      onNavigateToSales={onNavigateToSales}
      preSelectedGuest={preSelectedGuest}
    />
  );
}
