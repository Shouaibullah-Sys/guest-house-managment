// lib/validation/room.ts
import { z } from "zod";
import { RoomStatus } from "../../models/types";

// Enums and constants
export const ROOM_STATUSES = [
  "available",
  "occupied", 
  "maintenance",
  "cleaning",
  "reserved",
] as const satisfies readonly RoomStatus[];

export const HOUSEKEEPING_TASK_TYPES = [
  "cleaning",
  "inspection", 
  "turnover",
] as const;

// Base schemas
export const roomNumberSchema = z
  .string()
  .min(1, "Room number is required")
  .max(10, "Room number cannot exceed 10 characters")
  .regex(/^[A-Za-z0-9\-]+$/, "Room number can only contain letters, numbers, and hyphens");

export const floorSchema = z
  .number()
  .int("Floor must be an integer")
  .min(-2, "Floor cannot be below -2 (basement)")
  .max(100, "Floor cannot exceed 100");

export const roomStatusSchema = z
  .enum(ROOM_STATUSES)
  .default("available");

export const housekeepingHistoryItemSchema = z.object({
  taskType: z.enum(HOUSEKEEPING_TASK_TYPES),
  status: z.string().default("pending"),
  scheduledTime: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().min(0).optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  notes: z.string().max(500).optional(),
  issuesFound: z.string().max(500).optional(),
  staffId: z.string().optional(),
  supervisorApproved: z.boolean().default(false),
  approvedBy: z.string().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});

// Room schemas
export const createRoomSchema = z.object({
  roomNumber: roomNumberSchema,
  roomTypeId: z.string().min(1, "Room type ID is required"),
  floor: floorSchema,
  status: roomStatusSchema.default("available"),
  notes: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePath: z.string().optional(),
  metadata: z
    .object({
      theme: z.string().optional(),
      addedBy: z.string().optional(),
      timestamp: z.string().datetime().optional(),
    })
    .optional(),
});

export const updateRoomSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  roomNumber: roomNumberSchema.optional(),
  roomTypeId: z.string().min(1, "Room type ID is required").optional(),
  floor: floorSchema.optional(),
  status: roomStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePath: z.string().optional(),
});

export const roomResponseSchema = z.object({
  id: z.string(),
  roomNumber: roomNumberSchema,
  roomTypeId: z.string().nullable(),
  roomType: z
    .object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      category: z.string(),
      description: z.string().nullable(),
      maxOccupancy: z.number(),
      basePrice: z.number(),
      extraPersonPrice: z.number().nullable(),
      amenities: z.array(z.string()),
      premiumAmenities: z.array(z.string()),
      images: z.array(z.string()),
      size: z.string().nullable(),
      bedType: z.string().nullable(),
      viewType: z.string(),
      smokingAllowed: z.boolean(),
      isActive: z.boolean(),
      rating: z.number(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    })
    .nullable(),
  floor: floorSchema,
  status: roomStatusSchema,
  lastCleaned: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  imageUrl: z.string().nullable(),
  imagePath: z.string().nullable(),
  housekeepingHistory: z.array(housekeepingHistoryItemSchema).optional().default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const searchRoomQuerySchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(["all", ...ROOM_STATUSES]).optional(),
  floor: z.string().optional(),
  roomType: z.string().optional(),
  category: z.string().optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform((val) => parseInt(val))
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default(50),
});

export const deleteRoomQuerySchema = z.object({
  id: z.string().min(1, "Room ID is required"),
});

// Room availability schemas
export const checkRoomAvailabilitySchema = z.object({
  checkInDate: z.string().datetime("Invalid check-in date format"),
  checkOutDate: z.string().datetime("Invalid check-out date format"),
  adults: z.number().int().min(1).max(10).default(1),
  children: z.number().int().min(0).max(10).default(0),
  roomTypeId: z.string().optional(),
}).refine(
  (data) => {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    return checkOut > checkIn;
  },
  { message: "Check-out date must be after check-in date", path: ["checkOutDate"] }
);

export const roomAvailabilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(roomResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
});

// Bulk operations schemas
export const bulkUpdateRoomStatusSchema = z.object({
  roomIds: z.array(z.string().min(1)).min(1, "At least one room ID is required"),
  status: roomStatusSchema,
  reason: z.string().max(500).optional(),
});

export const bulkDeleteRoomsSchema = z.object({
  roomIds: z.array(z.string().min(1)).min(1, "At least one room ID is required"),
  force: z.boolean().default(false),
});

// Room statistics schemas
export const roomStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  roomType: z.string().optional(),
  status: z.string().optional(),
});

export const roomStatsResponseSchema = z.object({
  totalRooms: z.number(),
  availableRooms: z.number(),
  occupiedRooms: z.number(),
  maintenanceRooms: z.number(),
  cleaningRooms: z.number(),
  reservedRooms: z.number(),
  occupancyRate: z.number(),
  averageRoomRate: z.number(),
  revenueByStatus: z.record(z.string(), z.number()),
  roomTypeBreakdown: z.array(z.object({
    roomTypeId: z.string(),
    roomTypeName: z.string(),
    totalRooms: z.number(),
    availableRooms: z.number(),
    occupancyRate: z.number(),
  })),
});

// Frontend form schemas
export const roomFormSchema = createRoomSchema;

export const roomSearchFormSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(["all", ...ROOM_STATUSES]).default("all"),
  floor: z.string().optional(),
  roomType: z.string().optional(),
  category: z.string().optional(),
});

export const roomFiltersSchema = roomSearchFormSchema;

// Housekeeping schemas
export const updateHousekeepingStatusSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  taskType: z.enum(HOUSEKEEPING_TASK_TYPES),
  status: z.string().min(1, "Status is required"),
  notes: z.string().max(500).optional(),
  issuesFound: z.string().max(500).optional(),
  duration: z.number().min(0).optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
});

export const housekeepingTaskSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  taskType: z.enum(HOUSEKEEPING_TASK_TYPES),
  scheduledTime: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().max(500).optional(),
});

// Export all types
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomResponse = z.infer<typeof roomResponseSchema>;
export type SearchRoomQuery = z.infer<typeof searchRoomQuerySchema>;
export type CheckRoomAvailabilityInput = z.infer<typeof checkRoomAvailabilitySchema>;
export type RoomAvailabilityResponse = z.infer<typeof roomAvailabilityResponseSchema>;
export type BulkUpdateRoomStatusInput = z.infer<typeof bulkUpdateRoomStatusSchema>;
export type BulkDeleteRoomsInput = z.infer<typeof bulkDeleteRoomsSchema>;
export type RoomStatsQuery = z.infer<typeof roomStatsQuerySchema>;
export type RoomStatsResponse = z.infer<typeof roomStatsResponseSchema>;
export type RoomFormData = z.infer<typeof roomFormSchema>;
export type RoomSearchFormData = z.infer<typeof roomSearchFormSchema>;
export type RoomFilters = z.infer<typeof roomFiltersSchema>;
export type UpdateHousekeepingStatusInput = z.infer<typeof updateHousekeepingStatusSchema>;
export type HousekeepingTaskInput = z.infer<typeof housekeepingTaskSchema>;