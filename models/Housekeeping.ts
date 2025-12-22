// models/Housekeeping.ts
import mongoose, { Schema } from "mongoose";
import { IHousekeeping } from "./types";

const housekeepingSchema = new Schema<IHousekeeping>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
    taskType: {
      type: String,
      enum: ["cleaning", "inspection", "turnover"],
      required: true,
    },
    status: { type: String, default: "pending" },
    scheduledTime: Date,
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    checklist: Schema.Types.Mixed,
    notes: String,
    issuesFound: String,
    supervisorApproved: { type: Boolean, default: false },
    approvedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

housekeepingSchema.index({ room: 1 });
housekeepingSchema.index({ status: 1 });
housekeepingSchema.index({ scheduledTime: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Housekeeping =
  mongoose.models.Housekeeping ||
  mongoose.model<IHousekeeping>("Housekeeping", housekeepingSchema);

export { Housekeeping };
export default Housekeeping;
