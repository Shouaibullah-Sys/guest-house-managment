// models/RoomType.ts
import mongoose, { Schema } from "mongoose";
import { IRoomType } from "./types";

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["luxury", "executive", "standard", "family"],
      required: true,
    },
    description: String,
    maxOccupancy: { type: Number, required: true },
    basePrice: { type: Schema.Types.Decimal128, required: true },
    extraPersonPrice: Schema.Types.Decimal128,
    amenities: [String],
    premiumAmenities: [String],
    images: [String],
    size: String,
    bedType: String,
    viewType: {
      type: String,
      default: "city view",
    },
    smokingAllowed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    rates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        rate: { type: Schema.Types.Decimal128, required: true },
        minStay: Number,
        maxStay: Number,
        isActive: { type: Boolean, default: true },
        notes: String,
        createdBy: { type: String, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const RoomType =
  mongoose.models.RoomType ||
  mongoose.model<IRoomType>("RoomType", roomTypeSchema);

export { RoomType };
export default RoomType;
