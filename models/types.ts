// models/types.ts
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type Role = "guest" | "staff" | "admin";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";
export type PaymentStatus = "pending" | "partial" | "paid" | "failed";
export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "cleaning"
  | "reserved";
export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "online"
  | "wallet";
export type VendorType =
  | "supplier"
  | "service_provider"
  | "contractor"
  | "other";
export type ExpenseCategory =
  | "وسایل اداری"
  | "معاش کارمندان"
  | "حمل و نقل"
  | "بازاریابی"
  | "نگهداری"
  | "سفر"
  | "غذا و سرگرمی"
  | "کرایه موتر"
  | "کرایه"
  | "تجهیزات"
  | "نرم افزار"
  | "خدمات حرفه‌ای"
  | "سایر";

// Base interfaces
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: Role;
  approved: boolean;
  phone?: string;
  smsNotifications: boolean;
  pushNotifications: boolean;
  dateOfBirth?: Date;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  passportNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    roomType?: string;
    floor?: string;
    amenities?: string[];
    dietary?: string[];
    smoking?: boolean;
    specialNeeds?: string[];
  };
  loyaltyPoints: number;
  totalStays: number;
  totalSpent: Types.Decimal128;
  isActive: boolean;
  notes?: string;
  staffProfile?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaff extends Document {
  userId: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: Date;
  salary?: Types.Decimal128;
  employmentType?: string;
  shift?: string;
  isActive: boolean;
  accessLevel: number;
  permissions: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomType extends Document {
  name: string;
  code: string;
  category: "luxury" | "VIP" | "standard" | "family";
  description?: string;
  maxOccupancy: number;
  basePrice: Types.Decimal128;
  extraPersonPrice?: Types.Decimal128;
  amenities: string[];
  premiumAmenities?: string[];
  images: string[];
  size?: string;
  bedType?: string;
  viewType?: "Market" | "city" | "garden" | "pool";
  smokingAllowed: boolean;
  isActive: boolean;
  rating?: number;
  rates: Array<{
    startDate: Date;
    endDate: Date;
    rate: Types.Decimal128;
    minStay?: number;
    maxStay?: number;
    isActive: boolean;
    notes?: string;
    createdBy?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoom extends Document {
  roomNumber: string;
  roomType: Types.ObjectId;
  floor: number;
  status: RoomStatus;
  lastCleaned?: Date;
  notes?: string;
  currentBooking?: Types.ObjectId;
  imageUrl?: string;
  imagePath?: string;
  housekeepingHistory: Array<{
    taskType: "cleaning" | "inspection" | "turnover";
    status: string;
    scheduledTime?: Date;
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    checklist?: Record<string, boolean>;
    notes?: string;
    issuesFound?: string;
    staffId?: Types.ObjectId;
    supervisorApproved: boolean;
    approvedBy?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking extends Document {
  bookingNumber: string;
  guest: string;
  room: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  actualCheckIn?: Date;
  actualCheckOut?: Date;
  adults: number;
  children: number;
  infants: number;
  totalNights: number;
  roomRate: Types.Decimal128;
  extraCharges: Types.Decimal128;
  discount: Types.Decimal128;
  taxAmount: Types.Decimal128;
  totalAmount: Types.Decimal128;
  paidAmount: Types.Decimal128;
  outstandingAmount: Types.Decimal128;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source?: string;
  specialRequests?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdBy?: string;
  assignedTo?: string;
  billSentAt?: Date;
  services: Array<{
    service: Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: Types.Decimal128;
    totalPrice: Types.Decimal128;
    date: Date;
    notes?: string;
    addedBy?: string;
    createdAt: Date;
  }>;
  payments: Array<{
    amount: Types.Decimal128;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    referenceNumber?: string;
    currency: string;
    status: PaymentStatus;
    paymentDate: Date;
    notes?: string;
    processedBy?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService extends Document {
  name: string;
  description?: string;
  category?: string;
  price: Types.Decimal128;
  unit?: string;
  taxRate?: Types.Decimal128;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendor extends Document {
  vendorCode: string;
  name: string;
  type: VendorType;
  description?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  status: string;
  isPreferred: boolean;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventory extends Document {
  itemName: string;
  category: string;
  unit: string;
  currentStock: Types.Decimal128;
  minStock?: Types.Decimal128;
  maxStock?: Types.Decimal128;
  unitCost?: Types.Decimal128;
  supplier?: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  lastRestocked?: Date;
  createdBy?: string;
  updatedBy?: string;
  transactions: Array<{
    type: "in" | "out" | "adjustment";
    quantity: Types.Decimal128;
    unitCost?: Types.Decimal128;
    totalCost?: Types.Decimal128;
    referenceType?: string;
    referenceId?: Types.ObjectId;
    notes?: string;
    performedBy?: string;
    transactionDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHousekeeping extends Document {
  room: Types.ObjectId;
  staff?: Types.ObjectId;
  taskType: "cleaning" | "inspection" | "turnover";
  status: string;
  scheduledTime?: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  checklist?: Record<string, boolean>;
  notes?: string;
  issuesFound?: string;
  supervisorApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffShift extends Document {
  staff: Types.ObjectId;
  date: Date;
  shiftStart: Date;
  shiftEnd: Date;
  shiftType?: string;
  hoursWorked?: Types.Decimal128;
  status: string;
  notes?: string;
  checkedIn?: Date;
  checkedOut?: Date;
  assignedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotion extends Document {
  code: string;
  name: string;
  description?: string;
  type: string;
  value: Types.Decimal128;
  minStay?: number;
  maxStay?: number;
  minAmount?: Types.Decimal128;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  roomTypes: string[];
  daysOfWeek: number[];
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  type: string;
  name: string;
  parameters?: Record<string, any>;
  format: string;
  status: string;
  fileUrl?: string;
  generatedBy?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAmenity extends Document {
  name: string;
  description?: string;
  category: string;
  icon?: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense extends Document {
  title: string;
  description?: string;
  amount: Types.Decimal128;
  currency: string;
  category: ExpenseCategory;
  expenseDate: Date;
  receiptNumber?: string;
  vendor?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion extends Document {
  quiz: string;
  approved: boolean;
  contributor: string;
  contributorId: string;
  answers: Array<{
    ans: string;
    approved: boolean;
    contributor: string;
    contributorId: string;
    createdAt: Date;
  }>;
  createdAt: Date;
}

export interface IAccount extends Document {
  _id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  _id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerification extends Document {
  _id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  user?: string;
  title: string;
  message: string;
  type: string;
  relatedId?: Types.ObjectId;
  isRead: boolean;
  isImportant: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  user?: string;
  action: string;
  entity: string;
  entityId?: Types.ObjectId;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHeroSection extends Document {
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  imagePath?: string; // Firebase storage path
  isActive: boolean;
  displayOrder: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
