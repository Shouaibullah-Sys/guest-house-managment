// models/Room.ts
import mongoose, { Schema } from "mongoose";
import { IRoom, RoomStatus } from "./types";

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    floor: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "maintenance",
        "cleaning",
        "reserved",
      ] as RoomStatus[],
      default: "available",
    },
    lastCleaned: Date,
    notes: String,
    currentBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imagePath: {
      type: String,
      trim: true,
    },
    housekeepingHistory: [
      {
        taskType: {
          type: String,
          enum: ["cleaning", "inspection", "turnover"],
        },
        status: { type: String, default: "pending" },
        scheduledTime: Date,
        startedAt: Date,
        completedAt: Date,
        duration: Number,
        checklist: Schema.Types.Mixed,
        notes: String,
        issuesFound: String,
        staffId: { type: Schema.Types.ObjectId, ref: "Staff" },
        supervisorApproved: { type: Boolean, default: false },
        approvedBy: { type: String, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ status: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ roomType: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", roomSchema);

export { Room };
export default Room;
