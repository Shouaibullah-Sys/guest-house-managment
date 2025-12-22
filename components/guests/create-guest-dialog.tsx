// components/guests/create-guest-dialog.tsx

"use client";

import { useState } from "react";
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
}

export function CreateGuestDialog({
  open,
  onOpenChange,
  onGuestCreated,
}: CreateGuestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

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

      toast.success("میهمان جدید با موفقیت ایجاد شد!");
      onGuestCreated();
      onOpenChange(false);
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-6 w-6 text-primary" />
            ایجاد میهمان جدید
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
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
      </DialogContent>
    </Dialog>
  );
}
