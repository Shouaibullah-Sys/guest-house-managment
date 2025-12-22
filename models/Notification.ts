// models/Notification.ts
import mongoose, { Schema } from "mongoose";
import { INotification } from "./types";

const notificationSchema = new Schema<INotification>(
  {
    user: { type: String, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    relatedId: Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export { Notification };
export default Notification;
