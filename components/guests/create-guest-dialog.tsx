// components/guests/create-guest-dialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuestForm } from "./guest-form";
import { GuestFormData } from "@/lib/validation/guest";
import { UserPlus } from "lucide-react";

interface CreateGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestCreated: () => void;
  navigateToBookingAfterCreate?: boolean;
}

export function CreateGuestDialog({
  open,
  onOpenChange,
  onGuestCreated,
  navigateToBookingAfterCreate = false,
}: CreateGuestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: GuestFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "خطا در ایجاد میهمان");
      }

      const newGuest = await response.json();
      
      toast.success("میهمان جدید با موفقیت ایجاد شد!");
      onGuestCreated();
      onOpenChange(false);

      // If navigateToBookingAfterCreate is true, navigate to bookings page with the new guest
      if (navigateToBookingAfterCreate) {
        // Add a small delay to ensure the dialog closes before navigation
        setTimeout(() => {
          router.push(`/admin/bookings?guestId=${newGuest.data.id}&autoOpen=true`);
        }, 100);
      }
    } catch (error) {
      console.error("Create guest error:", error);
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset any state if needed
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
<DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[95vh] overflow-y-auto p-0">
            <div className="p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-xl mb-2">
              <UserPlus className="h-6 w-6 text-primary" />
              ایجاد میهمان جدید
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              اطلاعات میهمان جدید را وارد کنید. فیلدهای ضروری با علامت * مشخص
              شده‌اند.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <GuestForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitButtonText="ایجاد میهمان"
              mode="create"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}