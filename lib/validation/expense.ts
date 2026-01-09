// lib/validation/expense.ts
import { z } from "zod";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/expense";

export const expenseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format (e.g., 10.99)"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  category: z.enum(EXPENSE_CATEGORIES),
  // Use z.date() directly - coercion will happen at runtime
  expenseDate: z.date(),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
});

// Infer the type from the schema
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
