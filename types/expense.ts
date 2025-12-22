// types/expense.ts
export type ExpenseCategory =
  | "لوازم اداری"
  | "خدمات عمومی"
  | "حمل و نقل"
  | "بازاریابی"
  | "نگهداری"
  | "سفر"
  | "غذا و سرگرمی"
  | "بیمه"
  | "کرایه"
  | "تجهیزات"
  | "نرم افزار"
  | "خدمات حرفه‌ای"
  | "سایر";

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  expenseDate: Date;
  receiptNumber?: string;
  vendor?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSummary {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalAmount: number;
    averageAmount: number;
    count: number;
    minAmount: number;
    maxAmount: number;
  };
  byCategory: Array<{
    category: ExpenseCategory;
    total: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    total: number;
  }>;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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
];
