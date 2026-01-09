// models/Expense.ts
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      get: (v: mongoose.Types.Decimal128) => (v ? parseFloat(v.toString()) : 0),
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      validate: {
        validator: (v: string) => v.length === 3,
        message: "Currency must be 3 characters",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "لوازم اداری",
          "خدمات عمومی",
          "حمل و نقل",
          "بازاریابی",
          "نگهداری",
          "سفر",
          "غذا و سرگرمی",
          "بیمه",
          "کرایه",
          "تجهيزات",
          "نرم افزار",
          "خدمات حرفه‌ای",
          "سایر",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    vendor: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Add indexes for better performance
expenseSchema.index({ createdBy: 1, expenseDate: -1 });
expenseSchema.index({ createdBy: 1, category: 1 });
expenseSchema.index({ createdBy: 1, vendor: 1 });

export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

// TypeScript interface
export interface IExpense extends mongoose.Document {
  title: string;
  description?: string;
  amount: mongoose.Types.Decimal128;
  currency: string;
  category: string;
  expenseDate: Date;
  receiptNumber?: string;
  vendor?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
