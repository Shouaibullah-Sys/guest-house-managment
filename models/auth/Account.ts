// models/auth/Account.ts
import mongoose, { Schema } from "mongoose";
import { IAccount } from "../types";

const accountSchema = new Schema<IAccount>(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true },
    providerId: { type: String, required: true },
    userId: { type: String, ref: "User", required: true },
    accessToken: String,
    refreshToken: String,
    idToken: String,
    accessTokenExpiresAt: Date,
    refreshTokenExpiresAt: Date,
    scope: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent overwriting during hot reloads
const Account =
  mongoose.models.Account || mongoose.model<IAccount>("Account", accountSchema);

export { Account };
export default Account;
