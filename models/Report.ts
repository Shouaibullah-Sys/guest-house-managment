// models/Report.ts
import mongoose, { Schema } from "mongoose";
import { IReport } from "./types";

const reportSchema = new Schema<IReport>(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    parameters: Schema.Types.Mixed,
    format: { type: String, default: "pdf" },
    status: { type: String, default: "pending" },
    fileUrl: String,
    generatedBy: { type: String, ref: "User" },
    generatedAt: Date,
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);

export { Report };
export default Report;
