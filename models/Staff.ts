// models/Staff.ts
import mongoose, { Schema } from "mongoose";
import { IStaff } from "./types";

const staffSchema = new Schema<IStaff>(
  {
    userId: { type: String, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    hireDate: { type: Date, required: true },
    salary: Schema.Types.Decimal128,
    employmentType: String,
    shift: String,
    isActive: { type: Boolean, default: true },
    accessLevel: { type: Number, default: 1 },
    permissions: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

staffSchema.index({ userId: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ isActive: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Staff =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", staffSchema);

export { Staff };
export default Staff;
