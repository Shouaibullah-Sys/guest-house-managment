// lib/validation/room-frontend.ts
import { z } from "zod";
import { RoomStatus } from "../../models/types";

// Import base schemas from room validation
import {
  createRoomSchema,
  updateRoomSchema,
  roomFormSchema,
  roomSearchFormSchema,
  ROOM_STATUSES,
  HOUSEKEEPING_TASK_TYPES,
} from "./room";

// Import room type schemas
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  roomTypeFormSchema,
  roomTypeSearchFormSchema,
  ROOM_CATEGORIES,
  VIEW_TYPES,
} from "./room-type";

// ====================
// ROOM FRONTEND SCHEMAS
// ====================

// Room creation form with enhanced frontend validation
export const roomCreateFormSchema = roomFormSchema.extend({
  roomNumber: z.string()
    .min(1, "شماره اتاق الزامی است")
    .max(10, "شماره اتاق نمی‌تواند بیش از ۱۰ کاراکتر باشد")
    .regex(/^[A-Za-z0-9\-]+$/, "شماره اتاق فقط می‌تواند شامل حروف، اعداد و خط تیره باشد"),
  
  roomTypeId: z.string().min(1, "انتخاب نوع اتاق الزامی است"),
  
  floor: z.number()
    .int("طبقه باید عدد صحیح باشد")
    .min(-2, "طبقه نمی‌تواند کمتر از -۲ باشد")
    .max(100, "طبقه نمی‌تواند بیش از ۱۰۰ باشد"),
  
  status: z.enum(ROOM_STATUSES).default("available"),
  
  notes: z.string()
    .max(1000, "یادداشت نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد")
    .optional(),
  
  imageUrl: z.string()
    .url("آدرس تصویر نامعتبر است")
    .optional()
    .or(z.literal("")),
});

// Room edit form schema
export const roomEditFormSchema = updateRoomSchema.extend({
  roomNumber: z.string()
    .min(1, "شماره اتاق الزامی است")
    .max(10, "شماره اتاق نمی‌تواند بیش از ۱۰ کاراکتر باشد")
    .regex(/^[A-Za-z0-9\-]+$/, "شماره اتاق فقط می‌تواند شامل حروف، اعداد و خط تیره باشد")
    .optional(),
  
  roomTypeId: z.string().min(1, "انتخاب نوع اتاق الزامی است").optional(),
  
  floor: z.number()
    .int("طبقه باید عدد صحیح باشد")
    .min(-2, "طبقه نمی‌تواند کمتر از -۲ باشد")
    .max(100, "طبقه نمی‌تواند بیش از ۱۰۰ باشد")
    .optional(),
});

// Room search form with Persian labels
export const roomSearchFormPersianSchema = z.object({
  search: z.string()
    .max(100, "جستجو نمی‌تواند بیش از ۱۰۰ کاراکتر باشد")
    .optional(),
  
  status: z.enum(["all", ...ROOM_STATUSES])
    .default("all"),
  
  floor: z.string().optional(),
  
  roomType: z.string().optional(),
  
  category: z.string().optional(),
});

// Housekeeping task form schema
export const housekeepingTaskFormSchema = z.object({
  roomId: z.string().min(1, "شناسه اتاق الزامی است"),
  
  taskType: z.enum(HOUSEKEEPING_TASK_TYPES),
  
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  
  scheduledTime: z.string()
    .datetime("فرمت تاریخ نامعتبر است")
    .optional(),
  
  notes: z.string()
    .max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional(),
});

// Housekeeping status update form
export const housekeepingStatusFormSchema = z.object({
  roomId: z.string().min(1, "شناسه اتاق الزامی است"),
  
  taskType: z.enum(HOUSEKEEPING_TASK_TYPES),
  
  status: z.string()
    .min(1, "وضعیت الزامی است"),
  
  notes: z.string()
    .max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional(),
  
  issuesFound: z.string()
    .max(500, "مشکلات یافت شده نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional(),
  
  duration: z.number()
    .min(0, "مدت زمان نمی‌تواند منفی باشد")
    .optional(),
  
  checklist: z.record(z.string(), z.boolean())
    .optional(),
});

// Room availability check form
export const roomAvailabilityFormSchema = z.object({
  checkInDate: z.string()
    .min(1, "تاریخ ورود الزامی است")
    .datetime("فرمت تاریخ نامعتبر است"),
  
  checkOutDate: z.string()
    .min(1, "تاریخ خروج الزامی است")
    .datetime("فرمت تاریخ نامعتبر است"),
  
  adults: z.number()
    .int("تعداد بزرگسالان باید عدد صحیح باشد")
    .min(1, "حداقل یک بزرگسال الزامی است")
    .max(10, "حداکثر ۱۰ بزرگسال")
    .default(1),
  
  children: z.number()
    .int("تعداد کودکان باید عدد صحیح باشد")
    .min(0, "تعداد کودکان نمی‌تواند منفی باشد")
    .max(10, "حداکثر ۱۰ کودک")
    .default(0),
  
  roomTypeId: z.string().optional(),
}).refine(
  (data) => {
    if (data.checkInDate && data.checkOutDate) {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    }
    return true;
  },
  { 
    message: "تاریخ خروج باید بعد از تاریخ ورود باشد", 
    path: ["checkOutDate"] 
  }
);

// ======================
// ROOM TYPE FRONTEND SCHEMAS
// ======================

// Room type creation form with enhanced validation
export const roomTypeCreateFormSchema = roomTypeFormSchema.extend({
  name: z.string()
    .min(1, "نام نوع اتاق الزامی است")
    .max(100, "نام نوع اتاق نمی‌تواند بیش از ۱۰۰ کاراکتر باشد"),
  
  code: z.string()
    .min(1, "کد نوع اتاق الزامی است")
    .max(20, "کد نوع اتاق نمی‌تواند بیش از ۲۰ کاراکتر باشد")
    .regex(/^[A-Z0-9_]+$/, "کد نوع اتاق فقط می‌تواند شامل حروف بزرگ، اعداد و زیرخط باشد"),
  
  category: z.enum(ROOM_CATEGORIES),
  
  description: z.string()
    .max(1000, "توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد")
    .optional(),
  
  maxOccupancy: z.number()
    .int("حداکثر ظرفیت باید عدد صحیح باشد")
    .min(1, "حداکثر ظرفیت باید حداقل ۱ باشد")
    .max(20, "حداکثر ظرفیت نمی‌تواند بیش از ۲۰ باشد"),
  
  basePrice: z.number()
    .min(0, "قیمت پایه نمی‌تواند منفی باشد"),
  
  extraPersonPrice: z.number()
    .min(0, "قیمت نفر اضافی نمی‌تواند منفی باشد")
    .optional(),
  
  amenities: z.array(z.string().min(1).max(50))
    .max(50, "نمی‌تواند بیش از ۵۰ امکانات داشته باشد")
    .default([]),
  
  premiumAmenities: z.array(z.string().min(1).max(50))
    .max(30, "نمی‌تواند بیش از ۳۰ امکانات ویژه داشته باشد")
    .default([]),
  
  images: z.array(z.string().url("آدرس تصویر نامعتبر است"))
    .max(20, "نمی‌تواند بیش از ۲۰ تصویر داشته باشد")
    .default([]),
  
  size: z.string()
    .max(50, "اندازه اتاق نمی‌تواند بیش از ۵۰ کاراکتر باشد")
    .optional(),
  
  bedType: z.string()
    .max(50, "نوع تخت نمی‌تواند بیش از ۵۰ کاراکتر باشد")
    .optional(),
  
  viewType: z.enum(VIEW_TYPES),
  
  smokingAllowed: z.boolean().default(false),
  
  isActive: z.boolean().default(true),
  
  rating: z.number()
    .min(0, "امتیاز نمی‌تواند منفی باشد")
    .max(5, "امتیاز نمی‌تواند بیش از ۵ باشد")
    .default(0),
});

// Room type edit form schema
export const roomTypeEditFormSchema = roomTypeCreateFormSchema.partial().extend({
  id: z.string().min(1, "شناسه نوع اتاق الزامی است"),
});

// Room type search form with Persian labels
export const roomTypeSearchFormPersianSchema = z.object({
  search: z.string()
    .max(100, "جستجو نمی‌تواند بیش از ۱۰۰ کاراکتر باشد")
    .optional()
    .describe("جستجو بر اساس نام یا کد"),
  
  category: z.enum(["all", ...ROOM_CATEGORIES])
    .default("all")
    .describe("دسته‌بندی"),
  
  isActive: z.enum(["all", "true", "false"])
    .default("all")
    .describe("وضعیت"),
  
  minPrice: z.number()
    .min(0)
    .optional()
    .describe("حداقل قیمت"),
  
  maxPrice: z.number()
    .min(0)
    .optional()
    .describe("حداکثر قیمت"),
  
  minOccupancy: z.number()
    .int()
    .min(1)
    .optional()
    .describe("حداقل ظرفیت"),
  
  maxOccupancy: z.number()
    .int()
    .min(1)
    .optional()
    .describe("حداکثر ظرفیت"),
  
  smokingAllowed: z.enum(["all", "true", "false"])
    .default("all")
    .describe("مصرف سیگار"),
  
  sortBy: z.enum(["name", "code", "category", "basePrice", "maxOccupancy", "rating"])
    .default("name")
    .describe("مرتب‌سازی بر اساس"),
  
  sortOrder: z.enum(["asc", "desc"])
    .default("asc")
    .describe("ترتیب"),
});

// Rate management forms
export const addRateFormSchema = z.object({
  roomTypeId: z.string().min(1, "شناسه نوع اتاق الزامی است"),
  
  startDate: z.string()
    .min(1, "تاریخ شروع الزامی است")
    .describe("تاریخ شروع"),
  
  endDate: z.string()
    .min(1, "تاریخ پایان الزامی است")
    .describe("تاریخ پایان"),
  
  rate: z.number()
    .min(0, "نرخ نمی‌تواند منفی باشد")
    .describe("نرخ به افغانی"),
  
  minStay: z.number()
    .int()
    .min(1)
    .optional()
    .describe("حداقل اقامت (شب)"),
  
  maxStay: z.number()
    .int()
    .min(1)
    .optional()
    .describe("حداکثر اقامت (شب)"),
  
  isActive: z.boolean()
    .default(true)
    .describe("فعال است"),
  
  notes: z.string()
    .max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional()
    .describe("یادداشت‌ها"),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  { 
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد", 
    path: ["endDate"] 
  }
);

export const updateRateFormSchema = addRateFormSchema.partial().extend({
  rateId: z.string().min(1, "شناسه نرخ الزامی است"),
});

// ====================
// UTILITY SCHEMAS
// ====================

// Bulk operations
export const bulkUpdateRoomStatusFormSchema = z.object({
  roomIds: z.array(z.string().min(1))
    .min(1, "حداقل یک شناسه اتاق الزامی است")
    .describe("شناسه‌های اتاق‌ها"),
  
  status: z.enum(ROOM_STATUSES)
    .describe("وضعیت جدید"),
  
  reason: z.string()
    .max(500, "دلیل نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional()
    .describe("دلیل تغییر وضعیت"),
});

export const bulkDeleteRoomsFormSchema = z.object({
  roomIds: z.array(z.string().min(1))
    .min(1, "حداقل یک شناسه اتاق الزامی است")
    .describe("شناسه‌های اتاق‌ها"),
  
  force: z.boolean()
    .default(false)
    .describe("حذف اجباری"),
});

export const bulkUpdateRoomTypeStatusFormSchema = z.object({
  roomTypeIds: z.array(z.string().min(1))
    .min(1, "حداقل یک شناسه نوع اتاق الزامی است")
    .describe("شناسه‌های انواع اتاق‌ها"),
  
  isActive: z.boolean()
    .describe("وضعیت فعال"),
  
  reason: z.string()
    .max(500, "دلیل نمی‌تواند بیش از ۵۰۰ کاراکتر باشد")
    .optional()
    .describe("دلیل تغییر وضعیت"),
});

// Statistics query schemas
export const roomStatsQueryFormSchema = z.object({
  startDate: z.string()
    .optional()
    .describe("تاریخ شروع"),
  
  endDate: z.string()
    .optional()
    .describe("تاریخ پایان"),
  
  roomType: z.string()
    .optional()
    .describe("نوع اتاق"),
  
  status: z.string()
    .optional()
    .describe("وضعیت"),
});

export const roomTypeStatsQueryFormSchema = z.object({
  startDate: z.string()
    .optional()
    .describe("تاریخ شروع"),
  
  endDate: z.string()
    .optional()
    .describe("تاریخ پایان"),
  
  category: z.string()
    .optional()
    .describe("دسته‌بندی"),
});

// ====================
// EXPORT ALL TYPES
// ====================

export type RoomCreateFormData = z.infer<typeof roomCreateFormSchema>;
export type RoomEditFormData = z.infer<typeof roomEditFormSchema>;
export type RoomSearchFormData = z.infer<typeof roomSearchFormPersianSchema>;
export type HousekeepingTaskFormData = z.infer<typeof housekeepingTaskFormSchema>;
export type HousekeepingStatusFormData = z.infer<typeof housekeepingStatusFormSchema>;
export type RoomAvailabilityFormData = z.infer<typeof roomAvailabilityFormSchema>;

export type RoomTypeCreateFormData = z.infer<typeof roomTypeCreateFormSchema>;
export type RoomTypeEditFormData = z.infer<typeof roomTypeEditFormSchema>;
export type RoomTypeSearchFormData = z.infer<typeof roomTypeSearchFormPersianSchema>;
export type AddRateFormData = z.infer<typeof addRateFormSchema>;
export type UpdateRateFormData = z.infer<typeof updateRateFormSchema>;

export type BulkUpdateRoomStatusFormData = z.infer<typeof bulkUpdateRoomStatusFormSchema>;
export type BulkDeleteRoomsFormData = z.infer<typeof bulkDeleteRoomsFormSchema>;
export type BulkUpdateRoomTypeStatusFormData = z.infer<typeof bulkUpdateRoomTypeStatusFormSchema>;

export type RoomStatsQueryFormData = z.infer<typeof roomStatsQueryFormSchema>;
export type RoomTypeStatsQueryFormData = z.infer<typeof roomTypeStatsQueryFormSchema>;