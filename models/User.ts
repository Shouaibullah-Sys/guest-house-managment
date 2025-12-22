// models/User.ts
import mongoose, { Schema } from "mongoose";
import { IUser, Role } from "./types";

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: String,
    role: {
      type: String,
      enum: ["guest", "staff", "admin"] as Role[],
      default: "guest",
    },
    approved: { type: Boolean, default: false },
    phone: String,
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    dateOfBirth: Date,
    nationality: String,
    idType: String,
    idNumber: String,
    passportNumber: String,
    address: String,
    city: String,
    country: String,
    postalCode: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    preferences: {
      roomType: String,
      floor: String,
      amenities: [String],
      dietary: [String],
      smoking: Boolean,
      specialNeeds: [String],
    },
    loyaltyPoints: { type: Number, default: 0 },
    totalStays: { type: Number, default: 0 },
    totalSpent: { type: Schema.Types.Decimal128, default: 0 },
    isActive: { type: Boolean, default: true },
    notes: String,
    staffProfile: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isActive: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export { User };
export default User;
