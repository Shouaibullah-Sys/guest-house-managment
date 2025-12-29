// models/Sale.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ISale {
  id?: string;
  customerName: string;
  normalizedName: string;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  isFullyPaid: boolean;
  issueDate: Date;
  quantity: number;
  issuedBy: string;
  partNumber?: string;
  partName: string;
  itemCount: number;
  status: "completed" | "pending" | "approved";
  createdAt?: Date;
  updatedAt?: Date;
}

const SaleSchema = new Schema<ISale>(
  {
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
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    outstanding: {
      type: Number,
      required: true,
      min: 0,
    },
    isFullyPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true,
    },
    partNumber: {
      type: String,
      trim: true,
    },
    partName: {
      type: String,
      required: true,
      trim: true,
    },
    itemCount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "approved"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
SaleSchema.index({ normalizedName: 1, issueDate: -1 });
SaleSchema.index({ issueDate: -1 });
SaleSchema.index({
  customerName: "text",
  partName: "text",
  partNumber: "text",
});

export const Sale = models.Sale || model<ISale>("Sale", SaleSchema);
