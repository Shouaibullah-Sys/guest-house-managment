// app/laboratory/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doctor, CreateExpenseForm } from "@/types/types";
export type Expense = {
  id: number;
  expenseType: "regular_payment" | "doctor_percentage" | "laboratory_salary";
  description: string;
  amount: number;
  expenseDate: string;
  relatedTestId?: number;
  relatedDoctorId?: number;
  percentage?: number;
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "weekly" | "daily";
  status: "active" | "inactive" | "paid";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  relatedDoctor?: Doctor;
};

// Fetch expenses from API
async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch("/api/laboratory/expenses");
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

// Fetch doctors from API
async function fetchDoctors(): Promise<Doctor[]> {
  const response = await fetch("/api/laboratory/doctors");
  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }
  const data = await response.json();
  return data.doctors || [];
}

// Calculate income from API
async function calculateIncome(
  startDate: string,
  endDate: string,
  doctorId?: string
): Promise<{ totalIncome: number; doctor?: Doctor }> {
  const params = new URLSearchParams({ startDate, endDate });
  if (doctorId) {
    params.append("doctorId", doctorId);
  }

  const response = await fetch(`/api/laboratory/income?${params}`);
  if (!response.ok) {
    throw new Error("Failed to calculate income");
  }
  return response.json();
}

// Create new expense
async function createExpense(expense: CreateExpenseForm): Promise<Expense> {
  const response = await fetch("/api/laboratory/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

// Delete expense
async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`/api/laboratory/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}

const expenseTypeLabels = {
  regular_payment: "Regular Payment",
  doctor_percentage: "Doctor Percentage",
  laboratory_salary: "Laboratory Salary",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  paid: "Paid",
};

const statusColors = {
  active: "default",
  inactive: "secondary",
  paid: "outline",
};

export default function ExpensesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPercentageDialogOpen, setIsPercentageDialogOpen] = useState(false);

  // Form states
  const [newExpense, setNewExpense] = useState({
    expenseType: "regular_payment" as Expense["expenseType"],
    description: "",
    amount: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    relatedTestId: undefined as number | undefined,
    relatedDoctorId: undefined as number | undefined,
    percentage: undefined as number | undefined,
    isRecurring: false,
    recurringFrequency: undefined as Expense["recurringFrequency"],
    status: "active" as Expense["status"],
    notes: "",
  });

  // Percentage calculation states
  const [percentageData, setPercentageData] = useState({
    expenseType: "doctor_percentage" as
      | "doctor_percentage"
      | "laboratory_salary",
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
    doctorId: "",
    percentage: 0,
    calculatedAmount: 0,
    description: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch data
  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  // Calculate income when criteria change
  const { data: incomeData, refetch: calculateIncomeData } = useQuery({
    queryKey: [
      "income",
      percentageData.startDate,
      percentageData.endDate,
      percentageData.doctorId,
    ],
    queryFn: () =>
      calculateIncome(
        percentageData.startDate,
        percentageData.endDate,
        percentageData.doctorId || undefined
      ),
    enabled: false, // We'll trigger this manually
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsCreateDialogOpen(false);
      setIsPercentageDialogOpen(false);
      setNewExpense({
        expenseType: "regular_payment",
        description: "",
        amount: 0,
        expenseDate: new Date().toISOString().split("T")[0],
        relatedTestId: undefined,
        relatedDoctorId: undefined,
        percentage: undefined,
        isRecurring: false,
        recurringFrequency: undefined,
        status: "active",
        notes: "",
      });
      setPercentageData({
        expenseType: "doctor_percentage",
        startDate: new Date(new Date().setDate(new Date().getDate() - 30))
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        doctorId: "",
        percentage: 0,
        calculatedAmount: 0,
        description: "",
        notes: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Calculate amount when percentage or income changes
  useEffect(() => {
    if (incomeData?.totalIncome && percentageData.percentage > 0) {
      const amount = (incomeData.totalIncome * percentageData.percentage) / 100;
      setPercentageData((prev) => ({
        ...prev,
        calculatedAmount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      }));
    } else {
      setPercentageData((prev) => ({ ...prev, calculatedAmount: 0 }));
    }
  }, [percentageData.percentage, incomeData?.totalIncome]); // More specific dependency

  // Auto-generate description
  useEffect(() => {
    const doctor = doctors.find(
      (d) => d.id.toString() === percentageData.doctorId
    );
    const periodDescription = `${new Date(
      percentageData.startDate
    ).toLocaleDateString()} - ${new Date(
      percentageData.endDate
    ).toLocaleDateString()}`;

    let description = "";
    if (percentageData.expenseType === "doctor_percentage" && doctor) {
      description = `${doctor.name} Commission - ${periodDescription}`;
    } else if (percentageData.expenseType === "laboratory_salary") {
      description = `Laboratory Salary - ${periodDescription}`;
    }

    setPercentageData((prev) => ({ ...prev, description }));
  }, [
    percentageData.expenseType,
    percentageData.doctorId,
    percentageData.startDate,
    percentageData.endDate,
    doctors.length, // Use length instead of full array reference
  ]);

  const handleCalculateIncome = () => {
    calculateIncomeData();
  };

  const handleCreatePercentageExpense = () => {
    const expenseData: CreateExpenseForm = {
      expenseType: percentageData.expenseType,
      description: percentageData.description,
      amount: percentageData.calculatedAmount,
      expenseDate: new Date().toISOString().split("T")[0],
      relatedDoctorId: percentageData.doctorId
        ? parseInt(percentageData.doctorId)
        : undefined,
      percentage: percentageData.percentage,
      isRecurring: false,
      status: "active",
      notes: percentageData.notes,
    };

    createMutation.mutate(expenseData);
  };

  const handleCreateExpense = () => {
    createMutation.mutate(newExpense);
  };

  const columns: ColumnDef<Expense>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "expenseType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {
            expenseTypeLabels[
              row.getValue("expenseType") as Expense["expenseType"]
            ]
          }
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "expenseDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("expenseDate"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            statusColors[row.getValue("status") as Expense["status"]] as any
          }
        >
          {statusLabels[row.getValue("status") as Expense["status"]]}
        </Badge>
      ),
    },
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => {
        const percentage = row.getValue("percentage") as number;
        return percentage ? `${percentage}%` : "-";
      },
    },
    {
      accessorKey: "relatedDoctor.name",
      header: "Doctor",
      cell: ({ row }) => {
        const doctor = row.original.relatedDoctor;
        return doctor ? <div>{doctor.name}</div> : "-";
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const expense = row.original;

        return (
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
                onClick={() =>
                  navigator.clipboard.writeText(expense.id.toString())
                }
              >
                Copy expense ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(expense.id)}
                className="text-red-600"
              >
                Delete expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-600 mb-4">Error loading expenses</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory Expenses</h1>
          <p className="text-muted-foreground">
            Manage regular payments, doctor percentages, and laboratory salaries
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isPercentageDialogOpen}
            onOpenChange={setIsPercentageDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Add Percentage Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Percentage-Based Expense</DialogTitle>
                <DialogDescription>
                  Calculate expenses based on laboratory income for a specific
                  period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentageExpenseType">Expense Type</Label>
                    <Select
                      value={percentageData.expenseType}
                      onValueChange={(
                        value: "doctor_percentage" | "laboratory_salary"
                      ) =>
                        setPercentageData({
                          ...percentageData,
                          expenseType: value,
                          doctorId:
                            value === "laboratory_salary"
                              ? ""
                              : percentageData.doctorId,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor_percentage">
                          Doctor Percentage
                        </SelectItem>
                        <SelectItem value="laboratory_salary">
                          Laboratory Salary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {percentageData.expenseType === "doctor_percentage" && (
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Doctor</Label>
                      <Select
                        value={percentageData.doctorId}
                        onValueChange={(value) =>
                          setPercentageData({
                            ...percentageData,
                            doctorId: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id.toString()}
                            >
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">From Date</Label>
                    <Input
                      type="date"
                      value={percentageData.startDate}
                      onChange={(e) =>
                        setPercentageData({
                          ...percentageData,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">To Date</Label>
                    <Input
                      type="date"
                      value={percentageData.endDate}
                      onChange={(e) =>
                        setPercentageData({
                          ...percentageData,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={percentageData.percentage}
                      onChange={(e) =>
                        setPercentageData({
                          ...percentageData,
                          percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCalculateIncome} className="w-full">
                      Calculate Income
                    </Button>
                  </div>
                </div>

                {incomeData && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Total Income:</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${incomeData.totalIncome?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Calculated Amount:</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${percentageData.calculatedAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {incomeData.doctor && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          For doctor: {incomeData.doctor.name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    value={percentageData.description}
                    onChange={(e) =>
                      setPercentageData({
                        ...percentageData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    value={percentageData.notes}
                    onChange={(e) =>
                      setPercentageData({
                        ...percentageData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreatePercentageExpense}
                  disabled={
                    createMutation.isPending || !percentageData.calculatedAmount
                  }
                >
                  {createMutation.isPending ? "Creating..." : "Create Expense"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Regular Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Create a new regular expense record.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expenseType" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newExpense.expenseType}
                    onValueChange={(value: Expense["expenseType"]) =>
                      setNewExpense({ ...newExpense, expenseType: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular_payment">
                        Regular Payment
                      </SelectItem>
                      <SelectItem value="doctor_percentage">
                        Doctor Percentage
                      </SelectItem>
                      <SelectItem value="laboratory_salary">
                        Laboratory Salary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expenseDate" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expenseDate: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                {(newExpense.expenseType === "doctor_percentage" ||
                  newExpense.expenseType === "laboratory_salary") && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="percentage" className="text-right">
                      Percentage
                    </Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newExpense.percentage || ""}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          percentage: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newExpense.status}
                    onValueChange={(value: Expense["status"]) =>
                      setNewExpense({ ...newExpense, status: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newExpense.notes}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, notes: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateExpense}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Expense"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>
            View and manage all laboratory expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {isLoading ? "Loading..." : "No expenses found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
