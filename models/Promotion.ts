// models/Promotion.ts
import mongoose, { Schema } from "mongoose";
import { IPromotion } from "./types";

const promotionSchema = new Schema<IPromotion>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    type: { type: String, required: true },
    value: { type: Schema.Types.Decimal128, required: true },
    minStay: Number,
    maxStay: Number,
    minAmount: Schema.Types.Decimal128,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    roomTypes: [String],
    daysOfWeek: [Number],
    notes: String,
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ startDate: 1, endDate: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Promotion =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);

export { Promotion };
export default Promotion;
