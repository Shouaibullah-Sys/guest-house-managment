// models/Vendor.ts
import mongoose, { Schema } from "mongoose";
import { IVendor, VendorType } from "./types";

const vendorSchema = new Schema<IVendor>(
  {
    vendorCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "supplier",
        "service_provider",
        "contractor",
        "other",
      ] as VendorType[],
      default: "supplier",
    },
    description: String,
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    country: String,
    taxId: String,
    status: { type: String, default: "active" },
    isPreferred: { type: Boolean, default: false },
    notes: String,
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ name: 1 });
vendorSchema.index({ type: 1 });
vendorSchema.index({ status: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Vendor =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", vendorSchema);

export { Vendor };
export default Vendor;
