// lib/validation/guest.ts
import { z } from "zod";

// Emergency Contact Schema
export const emergencyContactSchema = z.object({
  name: z.string().min(1, "نام مخاطب اورژانسی الزامی است"),
  phone: z.string().min(1, "شماره تلفن مخاطب اورژانسی الزامی است"),
  relationship: z.string().min(1, "نسبت مخاطب اورژانسی الزامی است"),
});

// Guest Preferences Schema
export const guestPreferencesSchema = z.object({
  roomType: z.string().optional(),
  floor: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  dietary: z.array(z.string()).default([]),
  smoking: z.boolean().default(false),
  specialNeeds: z.array(z.string()).default([]),
});

// Guest Form Data Schema (for create/update operations)
export const guestFormSchema = z.object({
  name: z.string().min(1, "نام کامل الزامی است"),
  email: z.email("ایمیل معتبر نیست"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  idType: z
    .enum(["national_id", "passport", "driving_license", "other"])
    .optional(),
  idNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
  preferences: guestPreferencesSchema.optional(),
  isActive: z.boolean().default(true),
});

// Schema for guest updates (all fields optional except email which should remain unique)
export const guestUpdateSchema = guestFormSchema.partial().extend({
  email: z.string().email("ایمیل معتبر نیست").optional(),
});

// API Response schemas
export const guestResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  idType: z
    .enum(["national_id", "passport", "driving_license", "other"])
    .optional(),
  idNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
  preferences: guestPreferencesSchema.optional(),
  loyaltyPoints: z.number(),
  totalStays: z.number(),
  totalSpent: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Extended schema for the guests list page (with computed fields)
export const guestListItemSchema = guestResponseSchema.extend({
  lastStay: z.string().optional(),
});

// Type exports
export type GuestFormData = z.infer<typeof guestFormSchema>;
export type GuestUpdateData = z.infer<typeof guestUpdateSchema>;
export type GuestResponse = z.infer<typeof guestResponseSchema>;
export type GuestListItem = z.infer<typeof guestListItemSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type GuestPreferences = z.infer<typeof guestPreferencesSchema>;
