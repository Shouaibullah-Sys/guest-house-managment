// models/AuditLog.ts
import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "./types";

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: String, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: Schema.Types.ObjectId,
    oldValues: Schema.Types.Mixed,
    newValues: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export { AuditLog };
export default AuditLog;
