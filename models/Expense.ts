// models/Expense.ts
import mongoose, { Schema } from "mongoose";
import { IExpense, ExpenseCategory } from "./types";

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    description: String,
    amount: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, default: "USD" },
    category: {
      type: String,
      enum: [
        "لوازم اداری",
        "خدمات عمومی",
        "حمل و نقل",
        "بازاریابی",
        "نگهداری",
        "سفر",
        "غذا و سرگرمی",
        "بیمه",
        "کرایه",
        "تجهیزات",
        "نرم افزار",
        "خدمات حرفه‌ای",
        "سایر",
      ] as ExpenseCategory[],
      required: true,
    },
    expenseDate: { type: Date, required: true },
    receiptNumber: String,
    vendor: String,
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ createdBy: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ expenseDate: 1 });
expenseSchema.index({ currency: 1 });
expenseSchema.index({ vendor: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Expense =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);

export { Expense };
export default Expense;
