// components/guests/edit-guest-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuestForm } from "./guest-form";
import { GuestFormData, GuestResponse } from "@/lib/validation/guest";
import { Edit, User } from "lucide-react";

interface EditGuestDialogProps {
  guest: GuestResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestUpdated: () => void;
}

export function EditGuestDialog({
  guest,
  open,
  onOpenChange,
  onGuestUpdated,
}: EditGuestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<GuestFormData>>({});

  // Fetch complete guest data when dialog opens
  useEffect(() => {
    const fetchCompleteGuestData = async () => {
      if (guest && open) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/guests/${guest.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch guest data");
          }
          const result = await response.json();
          const completeGuestData = result.data;

          // Transform guest data to match form data structure
          setInitialData({
            name: completeGuestData.name,
            email: completeGuestData.email,
            phone: completeGuestData.phone,
            nationality: completeGuestData.nationality,
            idType: completeGuestData.idType,
            idNumber: completeGuestData.idNumber,
            passportNumber: completeGuestData.passportNumber,
            dateOfBirth: completeGuestData.dateOfBirth,
            address: completeGuestData.address,
            city: completeGuestData.city,
            country: completeGuestData.country,
            postalCode: completeGuestData.postalCode,
            emergencyContact: completeGuestData.emergencyContact,
            preferences: completeGuestData.preferences,
            isActive: completeGuestData.isActive,
          });
        } catch (error) {
          console.error("Error fetching complete guest data:", error);
          toast.error("خطا در بارگذاری اطلاعات کامل میهمان");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCompleteGuestData();
  }, [guest, open]);

  const handleSubmit = async (data: GuestFormData) => {
    if (!guest) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/guests/${guest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "خطا در بروزرسانی میهمان");
      }

      toast.success("اطلاعات میهمان با موفقیت بروزرسانی شد!");
      onGuestUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Update guest error:", error);
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset any state when dialog closes
      setInitialData({});
      setIsLoading(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="h-6 w-6 text-primary" />
            ویرایش اطلاعات میهمان
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            اطلاعات میهمان را ویرایش کنید و تغییرات را ذخیره نمایید.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {isLoading && !Object.keys(initialData).length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  در حال بارگذاری اطلاعات میهمان...
                </p>
              </div>
            </div>
          ) : (
            <GuestForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitButtonText="ذخیره تغییرات"
              mode="edit"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
