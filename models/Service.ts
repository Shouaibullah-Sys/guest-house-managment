// models/Service.ts
import mongoose, { Schema } from "mongoose";
import { IService } from "./types";

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Schema.Types.Decimal128, required: true },
    unit: String,
    taxRate: Schema.Types.Decimal128,
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ category: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Service =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);

export { Service };
export default Service;
