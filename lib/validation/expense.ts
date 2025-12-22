// lib/validation/expense.ts
import { z } from "zod";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/types/expense";

// Expense Form Data Schema (for create/update operations)
export const expenseFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  category: z.enum(
    EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]]
  ),
  expenseDate: z
    .date()
    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: "Valid expense date is required",
    }),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
});

// Schema for expense updates (all fields optional)
export const expenseUpdateSchema = expenseFormSchema.partial();

// API Response schema
export const expenseResponseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  category: z.enum(
    EXPENSE_CATEGORIES as [ExpenseCategory, ...ExpenseCategory[]]
  ),
  expenseDate: z.string(),
  receiptNumber: z.string().optional(),
  vendor: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Extended schema for expense list items
export const expenseListItemSchema = expenseResponseSchema;

// Type exports
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type ExpenseUpdateData = z.infer<typeof expenseUpdateSchema>;
export type ExpenseResponse = z.infer<typeof expenseResponseSchema>;
export type ExpenseListItem = z.infer<typeof expenseListItemSchema>;
