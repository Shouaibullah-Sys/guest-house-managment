// components/booking/edit-booking-dialog.tsx

"use client";

import { useState } from "react";
import { EditBookingForm } from "./edit-booking-form";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onBookingUpdated: () => void;
}

export function EditBookingDialog({
  open,
  onOpenChange,
  booking,
  onBookingUpdated,
}: EditBookingDialogProps) {
  const handleBookingUpdated = () => {
    onBookingUpdated();
    onOpenChange(false);
  };

  return (
    <EditBookingForm
      open={open}
      onOpenChange={onOpenChange}
      booking={booking}
      onSuccess={handleBookingUpdated}
    />
  );
}
