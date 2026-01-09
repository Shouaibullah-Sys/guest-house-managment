// components/expenses/ExpenseTable.tsx - Fixed with React.memo to prevent focus loss
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import type { Expense } from "@/types/expense";

interface ExpenseTableProps {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    category: string;
    vendor: string;
    startDate: string;
    endDate: string;
  };
  onPageChange: (page: number) => void;
  onFilterChange: (filters: any) => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (expense: Expense) => void;
}

const categoryColors: Record<string, string> = {
  "لوازم اداری": "bg-blue-100 text-blue-800",
  "خدمات عمومی": "bg-green-100 text-green-800",
  "حمل و نقل": "bg-yellow-100 text-yellow-800",
  بازاریابی: "bg-purple-100 text-purple-800",
  نگهداری: "bg-orange-100 text-orange-800",
  سفر: "bg-red-100 text-red-800",
  "غذا و سرگرمی": "bg-pink-100 text-pink-800",
  بیمه: "bg-indigo-100 text-indigo-800",
  کرایه: "bg-teal-100 text-teal-800",
  تجهیزات: "bg-cyan-100 text-cyan-800",
  "نرم افزار": "bg-violet-100 text-violet-800",
  "خدمات حرفه‌ای": "bg-amber-100 text-amber-800",
  سایر: "bg-gray-100 text-gray-800",
};

// Custom comparison function for React.memo
// Only re-render when meaningful props change, not just object references
function arePropsEqual(
  prevProps: ExpenseTableProps,
  nextProps: ExpenseTableProps
): boolean {
  // Check pagination
  if (prevProps.pagination.page !== nextProps.pagination.page) {
    return false;
  }
  if (prevProps.pagination.total !== nextProps.pagination.total) {
    return false;
  }

  // Check filters - compare actual values, not object reference
  if (prevProps.filters.search !== nextProps.filters.search) {
    return false;
  }
  if (prevProps.filters.category !== nextProps.filters.category) {
    return false;
  }
  if (prevProps.filters.vendor !== nextProps.filters.vendor) {
    return false;
  }
  if (prevProps.filters.startDate !== nextProps.filters.startDate) {
    return false;
  }
  if (prevProps.filters.endDate !== nextProps.filters.endDate) {
    return false;
  }

  // Check expenses - only compare length and essential data
  // We don't deep compare the array to avoid performance issues
  if (prevProps.expenses.length !== nextProps.expenses.length) {
    return false;
  }

  // Check if the first expense ID changed (indicates data refresh)
  // This is a simple heuristic - if data refreshed, we need to re-render
  if (prevProps.expenses.length > 0 && nextProps.expenses.length > 0) {
    if (prevProps.expenses[0]?._id !== nextProps.expenses[0]?._id) {
      return false;
    }
  }

  return true;
}

export function ExpenseTable({
  expenses,
  pagination,
  filters,
  onPageChange,
  onFilterChange,
  onDelete,
  onEdit,
}: ExpenseTableProps) {
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Only track search input for responsive typing - sync with parent filters.search
  const [searchInput, setSearchInput] = useState(filters.search);

  // Use ref to track if we're currently typing
  const isTypingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync searchInput from parent when filters.search changes (and not typing)
  useEffect(() => {
    if (!isTypingRef.current && filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  // Handle search input changes with debounce
  const handleSearchInputChange = useCallback(
    (value: string) => {
      // Set typing flag
      isTypingRef.current = true;

      // Update the input value immediately for responsive typing
      setSearchInput(value);

      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        // Update parent filters with new search value
        onFilterChange({ ...filters, search: value });

        // Reset typing flag after a short delay to allow parent sync
        setTimeout(() => {
          isTypingRef.current = false;
        }, 50);
      }, 300); // 300ms debounce
    },
    [filters, onFilterChange]
  );

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleDelete = async () => {
    if (selectedExpense) {
      await onDelete(selectedExpense._id);
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    // Handle NaN, undefined, null, or invalid values
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (
      isNaN(numAmount) ||
      numAmount === null ||
      numAmount === undefined ||
      !isFinite(numAmount)
    ) {
      return `- ${currency}`;
    }

    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD", // Default to USD if empty
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(numAmount);
    } catch (error) {
      // Fallback if currency code is invalid
      return `${numAmount.toFixed(2)} ${currency || "USD"}`;
    }
  };

  const formatDate = (dateValue: Date | string | null | undefined): string => {
    // Handle null, undefined, or empty values
    if (!dateValue) {
      return "-";
    }

    let date: Date;

    // Parse the date - handle both Date objects and string formats
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      // Try parsing the string - handle various formats
      // First try ISO format (most common from API)
      date = new Date(dateValue);

      // If invalid, try alternative parsing
      if (isNaN(date.getTime())) {
        // Try parsing as MM/DD/YYYY or DD/MM/YYYY
        const parts = dateValue.split(/[-\/]/);
        if (parts.length === 3) {
          // Assume YYYY-MM-DD or MM/DD/YYYY
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          date = new Date(year, month, day);
        }
      }
    } else {
      return "Invalid Date";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    try {
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {expense.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={categoryColors[expense.category]}
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell>{expense.vendor || "-"}</TableCell>
                  <TableCell>{expense.receiptNumber || "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEdit(expense)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedExpense(expense);
                            setDeleteDialogOpen(true);
                          }}
                          className="gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No expenses found. Try adjusting your filters or add a new expense.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} expenses
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the expense "
              {selectedExpense?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Memoize the component with custom comparison to prevent unnecessary re-renders
export const MemoizedExpenseTable = React.memo(ExpenseTable, arePropsEqual);
