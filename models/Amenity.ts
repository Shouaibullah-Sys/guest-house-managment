// models/Amenity.ts
import mongoose, { Schema } from "mongoose";
import { IAmenity } from "./types";

const amenitySchema = new Schema<IAmenity>(
  {
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    icon: String,
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const Amenity =
  mongoose.models.Amenity || mongoose.model<IAmenity>("Amenity", amenitySchema);

export { Amenity };
export default Amenity;
