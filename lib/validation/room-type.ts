// lib/validation/room-type.ts
import { z } from "zod";

// Enums and constants
export const ROOM_CATEGORIES = [
  "luxury",
  "executive", 
  "standard",
  "family",
] as const;

export const VIEW_TYPES = [
  "mountain",
  "city", 
  "garden",
  "pool",
] as const;

// Base schemas
export const roomTypeNameSchema = z
  .string()
  .min(1, "Room type name is required")
  .max(100, "Room type name cannot exceed 100 characters");

export const roomTypeCodeSchema = z
  .string()
  .min(1, "Room type code is required")
  .max(20, "Room type code cannot exceed 20 characters")
  .regex(/^[A-Z0-9_]+$/, "Room type code can only contain uppercase letters, numbers, and underscores");

export const categorySchema = z.enum(ROOM_CATEGORIES);

export const maxOccupancySchema = z
  .number()
  .int("Maximum occupancy must be an integer")
  .min(1, "Maximum occupancy must be at least 1")
  .max(20, "Maximum occupancy cannot exceed 20");

export const basePriceSchema = z
  .number()
  .min(0, "Base price cannot be negative");

export const extraPersonPriceSchema = z
  .number()
  .min(0, "Extra person price cannot be negative")
  .optional();

export const amenitiesSchema = z
  .array(z.string().min(1).max(50))
  .max(50, "Cannot have more than 50 amenities")
  .default([]);

export const premiumAmenitiesSchema = z
  .array(z.string().min(1).max(50))
  .max(30, "Cannot have more than 30 premium amenities")
  .default([]);

export const imagesSchema = z
  .array(z.string().url("Invalid image URL"))
  .max(20, "Cannot have more than 20 images")
  .default([]);

export const viewTypeSchema = z.enum(VIEW_TYPES).default("city");

export const bedTypeSchema = z
  .string()
  .max(50, "Bed type cannot exceed 50 characters")
  .optional();

export const roomSizeSchema = z
  .string()
  .max(50, "Room size cannot exceed 50 characters")
  .optional();

export const ratingSchema = z
  .number()
  .min(0, "Rating cannot be negative")
  .max(5, "Rating cannot exceed 5")
  .default(0);

// Rate schema for seasonal pricing
export const rateSchema = z.object({
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  rate: z.number().min(0, "Rate cannot be negative"),
  minStay: z.number().int().min(1).optional(),
  maxStay: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
  createdBy: z.string().optional(),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  { message: "End date must be after start date", path: ["endDate"] }
);

// Room type schemas
export const createRoomTypeSchema = z.object({
  name: roomTypeNameSchema,
  code: roomTypeCodeSchema,
  category: categorySchema,
  description: z.string().max(1000).optional(),
  maxOccupancy: maxOccupancySchema,
  basePrice: basePriceSchema,
  extraPersonPrice: extraPersonPriceSchema,
  amenities: amenitiesSchema,
  premiumAmenities: premiumAmenitiesSchema,
  images: imagesSchema,
  size: roomSizeSchema,
  bedType: bedTypeSchema,
  viewType: viewTypeSchema,
  smokingAllowed: z.boolean().default(false),
  isActive: z.boolean().default(true),
  rating: ratingSchema,
  rates: z.array(rateSchema).default([]),
});

export const updateRoomTypeSchema = z.object({
  id: z.string().min(1, "Room type ID is required"),
  name: roomTypeNameSchema.optional(),
  code: roomTypeCodeSchema.optional(),
  category: categorySchema.optional(),
  description: z.string().max(1000).optional(),
  maxOccupancy: maxOccupancySchema.optional(),
  basePrice: basePriceSchema.optional(),
  extraPersonPrice: extraPersonPriceSchema.optional(),
  amenities: amenitiesSchema.optional(),
  premiumAmenities: premiumAmenitiesSchema.optional(),
  images: imagesSchema.optional(),
  size: roomSizeSchema.optional(),
  bedType: bedTypeSchema.optional(),
  viewType: viewTypeSchema.optional(),
  smokingAllowed: z.boolean().optional(),
  isActive: z.boolean().optional(),
  rating: ratingSchema.optional(),
  rates: z.array(rateSchema).optional(),
});

export const roomTypeResponseSchema = z.object({
  id: z.string(),
  name: roomTypeNameSchema,
  code: roomTypeCodeSchema,
  category: categorySchema,
  description: z.string().nullable(),
  maxOccupancy: maxOccupancySchema,
  basePrice: basePriceSchema,
  extraPersonPrice: extraPersonPriceSchema,
  amenities: amenitiesSchema,
  premiumAmenities: premiumAmenitiesSchema,
  images: imagesSchema,
  size: roomSizeSchema,
  bedType: bedTypeSchema,
  viewType: viewTypeSchema,
  smokingAllowed: z.boolean(),
  isActive: z.boolean(),
  rating: ratingSchema,
  rates: z.array(rateSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Search and filter schemas
export const searchRoomTypeQuerySchema = z.object({
  category: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().max(100).optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Min price must be a valid number")
    .transform((val) => parseFloat(val))
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Max price must be a valid number")
    .transform((val) => parseFloat(val))
    .optional(),
  minOccupancy: z
    .string()
    .regex(/^\d+$/, "Min occupancy must be an integer")
    .transform((val) => parseInt(val))
    .optional(),
  maxOccupancy: z
    .string()
    .regex(/^\d+$/, "Max occupancy must be an integer")
    .transform((val) => parseInt(val))
    .optional(),
  smokingAllowed: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z.enum(["name", "code", "category", "basePrice", "maxOccupancy", "rating"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const deleteRoomTypeQuerySchema = z.object({
  id: z.string().min(1, "Room type ID is required"),
  force: z.boolean().default(false),
});

// Bulk operations schemas
export const bulkUpdateRoomTypeStatusSchema = z.object({
  roomTypeIds: z.array(z.string().min(1)).min(1, "At least one room type ID is required"),
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const bulkDeleteRoomTypesSchema = z.object({
  roomTypeIds: z.array(z.string().min(1)).min(1, "At least one room type ID is required"),
  force: z.boolean().default(false),
});

// Frontend form schemas
export const roomTypeFormSchema = createRoomTypeSchema;

export const roomTypeSearchFormSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(["all", ...ROOM_CATEGORIES]).default("all"),
  isActive: z.enum(["all", "true", "false"]).default("all"),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minOccupancy: z.number().int().min(1).optional(),
  maxOccupancy: z.number().int().min(1).optional(),
  smokingAllowed: z.enum(["all", "true", "false"]).default("all"),
  sortBy: z.enum(["name", "code", "category", "basePrice", "maxOccupancy", "rating"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const roomTypeFiltersSchema = roomTypeSearchFormSchema;

// Rate management schemas
export const addRateSchema = z.object({
  roomTypeId: z.string().min(1, "Room type ID is required"),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  rate: z.number().min(0, "Rate cannot be negative"),
  minStay: z.number().int().min(1).optional(),
  maxStay: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

export const updateRateSchema = z.object({
  rateId: z.string().min(1, "Rate ID is required"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  rate: z.number().min(0).optional(),
  minStay: z.number().int().min(1).optional(),
  maxStay: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    }
    return true;
  },
  { message: "End date must be after start date", path: ["endDate"] }
);

export const deleteRateSchema = z.object({
  rateId: z.string().min(1, "Rate ID is required"),
});

// Statistics schemas
export const roomTypeStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
});

export const roomTypeStatsResponseSchema = z.object({
  totalRoomTypes: z.number(),
  activeRoomTypes: z.number(),
  inactiveRoomTypes: z.number(),
  averagePrice: z.number(),
  categoryBreakdown: z.array(z.object({
    category: z.string(),
    count: z.number(),
    averagePrice: z.number(),
    totalRooms: z.number(),
  })),
  occupancyStats: z.array(z.object({
    roomTypeId: z.string(),
    roomTypeName: z.string(),
    totalRooms: z.number(),
    occupiedRooms: z.number(),
    occupancyRate: z.number(),
    averageRate: z.number(),
    revenue: z.number(),
  })),
});

// Export all types
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type RoomTypeResponse = z.infer<typeof roomTypeResponseSchema>;
export type SearchRoomTypeQuery = z.infer<typeof searchRoomTypeQuerySchema>;
export type BulkUpdateRoomTypeStatusInput = z.infer<typeof bulkUpdateRoomTypeStatusSchema>;
export type BulkDeleteRoomTypesInput = z.infer<typeof bulkDeleteRoomTypesSchema>;
export type RoomTypeFormData = z.infer<typeof roomTypeFormSchema>;
export type RoomTypeSearchFormData = z.infer<typeof roomTypeSearchFormSchema>;
export type RoomTypeFilters = z.infer<typeof roomTypeFiltersSchema>;
export type AddRateInput = z.infer<typeof addRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;
export type DeleteRateInput = z.infer<typeof deleteRateSchema>;
export type RoomTypeStatsQuery = z.infer<typeof roomTypeStatsQuerySchema>;
export type RoomTypeStatsResponse = z.infer<typeof roomTypeStatsResponseSchema>;