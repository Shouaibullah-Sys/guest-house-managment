// components/booking/create-booking-dialog.tsx

"use client";

import { useState } from "react";
import { CreateBookingForm } from "./create-booking-form";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  onBookingCreated,
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
    />
  );
}
