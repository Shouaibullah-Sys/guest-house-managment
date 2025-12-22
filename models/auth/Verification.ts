// models/auth/Verification.ts
import mongoose, { Schema } from "mongoose";
import { IVerification } from "../types";

const verificationSchema = new Schema<IVerification>(
  {
    _id: { type: String, required: true },
    identifier: { type: String, required: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const Verification =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", verificationSchema);

export { Verification };
export default Verification;
