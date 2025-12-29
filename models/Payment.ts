// models/Payment.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IPayment {
  id?: string;
  saleId: string;
  customerName: string;
  normalizedName: string;
  amount: number;
  note?: string;
  receivedBy?: string;
  paymentMethod: "cash" | "bank_transfer" | "check" | "card";
  status: "completed" | "pending" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    saleId: {
      type: String,
      required: true,
      ref: "Sale",
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
    },
    receivedBy: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "check", "card"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PaymentSchema.index({ saleId: 1 });
PaymentSchema.index({ normalizedName: 1, createdAt: -1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment =
  models.Payment || model<IPayment>("Payment", PaymentSchema);
