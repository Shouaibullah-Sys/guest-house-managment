// components/guests/guest-form.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  guestFormSchema,
  GuestFormData,
  guestUpdateSchema,
  emergencyContactSchema,
  guestPreferencesSchema,
} from "@/lib/validation/guest";

interface GuestFormProps {
  initialData?: Partial<GuestFormData>;
  onSubmit: (data: GuestFormData) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  mode: "create" | "edit";
}

export function GuestForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText,
  mode = "create",
}: GuestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showEmergencyContact, setShowEmergencyContact] = useState(
    !!initialData?.emergencyContact
  );
  const [showPreferences, setShowPreferences] = useState(
    !!initialData?.preferences
  );

  const form = useForm<GuestFormData>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      nationality: initialData?.nationality || "",
      idType: initialData?.idType || undefined,
      idNumber: initialData?.idNumber || "",
      passportNumber: initialData?.passportNumber || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      country: initialData?.country || "",
      postalCode: initialData?.postalCode || "",
      emergencyContact: initialData?.emergencyContact,
      preferences: initialData?.preferences,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: GuestFormData) => {
    setServerError(null);

    try {
      // Clean up empty optional fields and ensure email is valid
      const cleanedData = {
        ...data,
        email: data.email?.trim() || "", // Ensure email is trimmed
        emergencyContact: showEmergencyContact
          ? data.emergencyContact
          : undefined,
        preferences: showPreferences ? data.preferences : undefined,
      };

      // Validate email before submission
      if (!cleanedData.email) {
        setServerError("ایمیل الزامی است");
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedData.email)) {
        setServerError("لطفاً یک ایمیل معتبر وارد کنید");
        return;
      }

      await onSubmit(cleanedData);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "خطایی رخ داده است"
      );
    }
  };

  const addEmergencyContact = () => {
    form.setValue("emergencyContact", {
      name: "",
      phone: "",
      relationship: "",
    });
    setShowEmergencyContact(true);
  };

  const removeEmergencyContact = () => {
    form.setValue("emergencyContact", undefined);
    setShowEmergencyContact(false);
  };

  const addPreferences = () => {
    form.setValue("preferences", {
      roomType: "",
      floor: "",
      amenities: [],
      dietary: [],
      smoking: false,
      specialNeeds: [],
    });
    setShowPreferences(true);
  };

  const removePreferences = () => {
    form.setValue("preferences", undefined);
    setShowPreferences(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              اطلاعات پایه
            </CardTitle>
            <CardDescription>اطلاعات اصلی میهمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کامل *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: احمد رحیمی"
                        {...field}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تلفن</FormLabel>
                    <FormControl>
                      <Input placeholder="09xxxxxxxxx" {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملیت</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: افغانی" {...field} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ تولد</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ID Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              اطلاعات شناسایی
            </CardTitle>
            <CardDescription>مدارک شناسایی میهمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع شناسنامه</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="national_id">کارت ملی</SelectItem>
                        <SelectItem value="passport">پاسپورت</SelectItem>
                        <SelectItem value="driving_license">
                          گواهینامه
                        </SelectItem>
                        <SelectItem value="other">سایر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره شناسایی</FormLabel>
                    <FormControl>
                      <Input placeholder="شماره شناسایی" {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره پاسپورت</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="شماره پاسپورت (اختیاری)"
                      {...field}
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              آدرس
            </CardTitle>
            <CardDescription>آدرس محل سکونت میهمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس کامل</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="آدرس کامل محل سکونت"
                        {...field}
                        dir="rtl"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شهر</FormLabel>
                      <FormControl>
                        <Input placeholder="نام شهر" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کشور</FormLabel>
                      <FormControl>
                        <Input placeholder="نام کشور" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد پستی</FormLabel>
                      <FormControl>
                        <Input placeholder="کد پستی" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                مخاطب اورژانسی
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                  showEmergencyContact
                    ? removeEmergencyContact
                    : addEmergencyContact
                }
              >
                {showEmergencyContact ? (
                  <>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>اطلاعات مخاطب اورژانسی میهمان</CardDescription>
          </CardHeader>
          {showEmergencyContact && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام مخاطب *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="نام کامل مخاطب اورژانسی"
                        {...field}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره تلفن *</FormLabel>
                      <FormControl>
                        <Input placeholder="09xxxxxxxxx" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact.relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نسبت *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: پدر، مادر، برادر"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ترجیحات
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={showPreferences ? removePreferences : addPreferences}
              >
                {showPreferences ? (
                  <>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>ترجیحات و نیازهای خاص میهمان</CardDescription>
          </CardHeader>
          {showPreferences && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferences.roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع اتاق ترجیحی</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: دابل، توئین"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>طبقه ترجیحی</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: طبقه اول، بالا"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferences.smoking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">سیگار کشیدن</FormLabel>
                      <FormDescription>
                        آیا میهمان سیگار می‌کشد؟
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Active Status */}
        {mode === "edit" && (
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">حساب فعال</FormLabel>
                      <FormDescription>
                        میهمانان غیرفعال نمی‌توانند رزرو جدید داشته باشند
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              submitButtonText ||
              (mode === "create" ? "ایجاد میهمان" : "ذخیره تغییرات")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
