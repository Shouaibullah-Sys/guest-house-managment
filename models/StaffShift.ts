// models/StaffShift.ts
import mongoose, { Schema } from "mongoose";
import { IStaffShift } from "./types";

const staffShiftSchema = new Schema<IStaffShift>(
  {
    staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    date: { type: Date, required: true },
    shiftStart: { type: Date, required: true },
    shiftEnd: { type: Date, required: true },
    shiftType: String,
    hoursWorked: Schema.Types.Decimal128,
    status: { type: String, default: "scheduled" },
    notes: String,
    checkedIn: Date,
    checkedOut: Date,
    assignedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

staffShiftSchema.index({ staff: 1 });
staffShiftSchema.index({ date: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const StaffShift =
  mongoose.models.StaffShift ||
  mongoose.model<IStaffShift>("StaffShift", staffShiftSchema);

export { StaffShift };
export default StaffShift;
