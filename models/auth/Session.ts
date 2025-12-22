// models/auth/Session.ts
import mongoose, { Schema } from "mongoose";
import { ISession } from "../types";

const sessionSchema = new Schema<ISession>(
  {
    _id: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    token: { type: String, required: true, unique: true },
    userId: { type: String, ref: "User", required: true },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);

export { Session };
export default Session;
