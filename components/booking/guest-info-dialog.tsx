// components/booking/guest-info-dialog.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface GuestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields: string[];
  onComplete: (guestData: any) => void;
  isLoading?: boolean;
}

export function GuestInfoDialog({
  open,
  onOpenChange,
  missingFields,
  onComplete,
  isLoading = false,
}: GuestInfoDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    idType: "",
    idNumber: "",
    address: "",
    city: "",
    country: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields based on missingFields
    if (missingFields.includes("name") && !formData.name.trim()) {
      newErrors.name = "نام کامل الزامی است";
    }

    if (missingFields.includes("email") && !formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (missingFields.includes("email") && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "لطفاً یک ایمیل معتبر وارد کنید";
      }
    }

    if (missingFields.includes("phone") && !formData.phone.trim()) {
      newErrors.phone = "شماره تلفن الزامی است";
    }

    if (missingFields.includes("idNumber") && !formData.idNumber.trim()) {
      newErrors.idNumber = "شماره شناسایی الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean up the data
    const cleanedData = {
      ...formData,
      email: formData.email?.trim() || "",
      phone: formData.phone?.trim() || "",
      nationality: formData.nationality?.trim() || "",
      idType: formData.idType || undefined,
      idNumber: formData.idNumber?.trim() || "",
      address: formData.address?.trim() || "",
      city: formData.city?.trim() || "",
      country: formData.country?.trim() || "",
    };

    onComplete(cleanedData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const renderField = (
    field: string,
    label: string,
    type: string = "text",
    placeholder: string = ""
  ) => {
    const showField = missingFields.includes(field);
    if (!showField) return null;

    const hasError = errors[field];
    const IconComponent =
      field === "email" ? Mail : field === "phone" ? Phone : User;

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-amber-500" />
          {label} *
        </Label>
        <Input
          id={field}
          type={type}
          placeholder={placeholder}
          value={formData[field as keyof typeof formData] as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={hasError ? "border-red-500 focus:border-red-500" : ""}
          dir={
            field === "email" || field === "phone" || field === "idNumber"
              ? "ltr"
              : "rtl"
          }
        />
        {hasError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-amber-500" />
            Complete Your Information
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please provide the following information to complete your booking.
            Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Missing Fields Summary */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                We need to collect {missingFields.length} additional piece
                {missingFields.length !== 1 ? "s" : ""} of information to
                complete your booking.
              </AlertDescription>
            </Alert>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("name", "Full Name", "text", "مثال: احمد رحیمی")}
                {renderField(
                  "email",
                  "Email Address",
                  "email",
                  "example@email.com"
                )}
                {renderField("phone", "Phone Number", "tel", "09xxxxxxxxx")}
                {renderField(
                  "nationality",
                  "Nationality",
                  "text",
                  "مثال: افغانی"
                )}
              </div>
            </div>

            {/* ID Information */}
            {(missingFields.includes("idType") ||
              missingFields.includes("idNumber")) && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                  Identification Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missingFields.includes("idType") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="idType"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4 text-amber-500" />
                        ID Type *
                      </Label>
                      <Select
                        value={formData.idType}
                        onValueChange={(value) =>
                          handleInputChange("idType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_id">
                            National ID
                          </SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="driving_license">
                            Driving License
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {renderField(
                    "idNumber",
                    "ID Number",
                    "text",
                    "Enter ID number"
                  )}
                </div>
              </div>
            )}

            {/* Address Information */}
            {(missingFields.includes("address") ||
              missingFields.includes("city") ||
              missingFields.includes("country")) && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  Address Information
                </h3>

                <div className="space-y-4">
                  {renderField(
                    "address",
                    "Full Address",
                    "text",
                    "Complete address"
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("city", "City", "text", "City name")}
                    {renderField("country", "Country", "text", "Country name")}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
