// app/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Download, AlertTriangle } from "lucide-react";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthenticatedFetch, useAuthDebug } from "@/lib/auth-client";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

export default function ExpensesPage() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const authDebug = useAuthDebug();
  const [activeTab, setActiveTab] = useState("list");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [summaryData, setSummaryData] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{
    title: string;
    description?: string;
    amount: string;
    currency: string;
    category: ExpenseCategory;
    expenseDate: Date;
    receiptNumber?: string;
    vendor?: string;
    _id?: string;
  } | null>(null);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== "")
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      });

      const response = await authenticatedFetch(`/api/expenses?${queryParams}`);

      if (response.status === 401) {
        setAuthError("Authentication required. Please sign in again.");
        return;
      }

      if (response.status === 403) {
        setAuthError("Access denied. Please check your permissions.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.data);
        setPagination(data.pagination);
      } else {
        console.error(
          "Failed to fetch expenses:",
          response.status,
          response.statusText
        );
        setAuthError(`Failed to load expenses: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setAuthError(`Network error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await authenticatedFetch("/api/expenses/summary");
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      } else {
        console.error(
          "Failed to fetch summary:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchExpenses();
      if (activeTab === "analytics") {
        fetchSummary();
      }
    }
  }, [isSignedIn, pagination.page, filters, activeTab]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await authenticatedFetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExpenses();
        if (activeTab === "analytics") {
          fetchSummary();
        }
      } else {
        console.error(
          "Failed to delete expense:",
          response.status,
          response.statusText
        );
        alert("Failed to delete expense. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Network error while deleting expense.");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense({
      ...expense,
      _id: expense._id,
      amount: expense.amount.toString(),
      expenseDate: new Date(expense.expenseDate),
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    title: string;
    description?: string;
    amount: string;
    currency: string;
    category: ExpenseCategory;
    expenseDate: Date;
    receiptNumber?: string;
    vendor?: string;
  }) => {
    try {
      const url = editingExpense
        ? `/api/expenses/${editingExpense._id}`
        : "/api/expenses";

      const method = editingExpense ? "PUT" : "POST";

      // Transform form data for API
      const transformedData = {
        ...data,
        amount: parseFloat(data.amount),
        expenseDate: data.expenseDate.toISOString().split("T")[0],
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        setFormOpen(false);
        setEditingExpense(null);
        fetchExpenses();
        if (activeTab === "analytics") {
          fetchSummary();
        }
      } else {
        console.error(
          "Failed to save expense:",
          response.status,
          response.statusText
        );
        alert("Failed to save expense. Please try again.");
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Network error while saving expense.");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Category",
      "Amount",
      "Currency",
      "Date",
      "Vendor",
      "Receipt #",
      "Description",
    ];
    const rows = expenses.map((expense) => [
      expense.title,
      expense.category,
      expense.amount,
      expense.currency,
      new Date(expense.expenseDate).toLocaleDateString(),
      expense.vendor || "",
      expense.receiptNumber || "",
      expense.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Expense Management
          </h1>
          <p className="text-gray-500">Track and manage your hotel expenses</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </DialogTitle>
              </DialogHeader>
              <ExpenseForm
                initialData={editingExpense || undefined}
                onSubmit={handleFormSubmit}
                isSubmitting={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Auth Error Display */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Authentication Issue</p>
            <p className="text-red-700 text-sm">{authError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/api/debug/auth", "_blank")}
          >
            Debug Info
          </Button>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="list">All Expenses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : (
            <ExpenseTable
              expenses={expenses}
              pagination={pagination}
              onPageChange={handlePageChange}
              onFilterChange={handleFilterChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {summaryData ? (
            <ExpenseSummary data={summaryData} />
          ) : (
            <div className="text-center py-8">Loading analytics...</div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXPENSE_CATEGORIES.map((category) => (
              <div
                key={category}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Expenses:</span>
                    <span className="font-medium">
                      {summaryData?.byCategory.find(
                        (c: any) => c.category === category
                      )?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-medium">
                      {summaryData?.byCategory.find(
                        (c: any) => c.category === category
                      )?.total
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(
                            summaryData.byCategory.find(
                              (c: any) => c.category === category
                            ).total
                          )
                        : "$0"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
