// app/admin/commissions/page.tsx
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
  Calculator,
  Plus,
  DollarSign,
  Users,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  User,
  Calendar,
  TrendingUp,
  Activity,
  Smartphone,
  Stethoscope,
  Microscope,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Doctor, CreateExpenseForm } from "@/types/types";

// Fetch doctors from API
async function fetchDoctors(): Promise<Doctor[]> {
  const response = await fetch("/api/laboratory/doctors");
  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }
  const data = await response.json();
  return data.doctors || [];
}

// Fetch commission records from API
async function fetchCommissionRecords(): Promise<any[]> {
  // Fetch both commission types separately and combine
  const [doctorCommissions, labSalaries] = await Promise.all([
    fetch("/api/laboratory/expenses?expenseType=doctor_percentage").then(
      (res) => res.json()
    ),
    fetch("/api/laboratory/expenses?expenseType=laboratory_salary").then(
      (res) => res.json()
    ),
  ]);
  return [...doctorCommissions, ...labSalaries];
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
async function createExpense(expense: CreateExpenseForm): Promise<any> {
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

// Mobile Commission Card Component
function MobileCommissionCard({
  record,
  onDelete,
}: {
  record: any;
  onDelete: (id: number) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {record.description}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {record.expenseType === "doctor_percentage"
                ? "Doctor Commission"
                : "Laboratory Salary"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {record.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">Amount</Label>
          <p className="text-gray-700 font-semibold">
            ${parseFloat(record.amount).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">
            Percentage
          </Label>
          <p className="text-gray-700">{record.percentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <Label className="text-xs font-semibold text-gray-500">Date</Label>
          <p className="text-gray-700">
            {new Date(record.expenseDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-500">Type</Label>
          <Badge variant="outline" className="text-xs">
            {record.expenseType === "doctor_percentage"
              ? "Commission"
              : "Salary"}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">ID: {record.id}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(record.id.toString())}
            className="flex-1 text-xs"
          >
            Copy ID
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(record.id)}
            className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CommissionsPage() {
  const [isPercentageDialogOpen, setIsPercentageDialogOpen] = useState(false);

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

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const { data: commissionRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["commission-records"],
    queryFn: fetchCommissionRecords,
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
      queryClient.invalidateQueries({ queryKey: ["commission-records"] });
      setIsPercentageDialogOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["commission-records"] });
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
  }, [percentageData.percentage, incomeData?.totalIncome]);

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
    doctors.length,
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

  // Commission records table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "expenseType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("expenseType") as string;
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {type === "doctor_percentage"
              ? "Doctor Commission"
              : "Laboratory Salary"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 hover:text-blue-600"
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
        return (
          <div className="text-right font-medium text-green-600">
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => {
        const percentage = row.getValue("percentage") as number;
        return <div className="text-center font-medium">{percentage}%</div>;
      },
    },
    {
      accessorKey: "expenseDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("expenseDate"));
        return <div className="text-gray-700">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          active: "default",
          inactive: "secondary",
          paid: "outline",
        };
        return (
          <Badge
            variant={statusColors[status as keyof typeof statusColors] as any}
            className="capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const record = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-2 border-gray-100 rounded-xl"
            >
              <DropdownMenuLabel className="text-gray-900">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(record.id.toString())
                }
                className="hover:bg-blue-50 cursor-pointer"
              >
                Copy record ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(record.id)}
                className="text-red-600 hover:bg-red-50 cursor-pointer"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? "Deleting..." : "Delete record"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: commissionRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Calculate statistics
  const totalCommissions = commissionRecords.length;
  const totalAmount = commissionRecords.reduce(
    (sum, record) => sum + (record.amount || 0),
    0
  );
  const monthlyAmount = commissionRecords
    .filter((record) => {
      const recordDate = new Date(record.expenseDate || record.createdAt);
      const now = new Date();
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-2xl">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Commissions & Percentages
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Manage doctor commissions and laboratory salary calculations with
              precision
            </p>
          </div>
          <Dialog
            open={isPercentageDialogOpen}
            onOpenChange={setIsPercentageDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-2xl p-6 -m-6 mb-6">
                <DialogTitle className="flex items-center gap-2 text-xl text-white">
                  <Calculator className="h-5 w-5" />
                  Calculate Commission or Salary
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Calculate expenses based on laboratory income for a specific
                  period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="percentageExpenseType"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Expense Type
                    </Label>
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
                      <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor_percentage">
                          Doctor Commission
                        </SelectItem>
                        <SelectItem value="laboratory_salary">
                          Laboratory Salary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {percentageData.expenseType === "doctor_percentage" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="doctor"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Doctor
                      </Label>
                      <Select
                        value={percentageData.doctorId}
                        onValueChange={(value) =>
                          setPercentageData({
                            ...percentageData,
                            doctorId: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startDate"
                      className="text-sm font-semibold text-gray-700"
                    >
                      From Date
                    </Label>
                    <Input
                      type="date"
                      value={percentageData.startDate}
                      onChange={(e) =>
                        setPercentageData({
                          ...percentageData,
                          startDate: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="endDate"
                      className="text-sm font-semibold text-gray-700"
                    >
                      To Date
                    </Label>
                    <Input
                      type="date"
                      value={percentageData.endDate}
                      onChange={(e) =>
                        setPercentageData({
                          ...percentageData,
                          endDate: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="percentage"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Percentage (%)
                    </Label>
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
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCalculateIncome}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl h-12"
                    >
                      Calculate Income
                    </Button>
                  </div>
                </div>

                {incomeData && (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">
                            Total Income:
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${incomeData.totalIncome?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">
                            Calculated Amount:
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${percentageData.calculatedAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {incomeData.doctor && (
                        <div className="mt-2 text-xs text-gray-500">
                          For doctor: {incomeData.doctor.name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description
                  </Label>
                  <Input
                    value={percentageData.description}
                    onChange={(e) =>
                      setPercentageData({
                        ...percentageData,
                        description: e.target.value,
                      })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Notes
                  </Label>
                  <Textarea
                    value={percentageData.notes}
                    onChange={(e) =>
                      setPercentageData({
                        ...percentageData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreatePercentageExpense}
                  disabled={
                    createMutation.isPending || !percentageData.calculatedAmount
                  }
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Commission"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border rounded-xl p-1">
            <TabsTrigger
              value="records"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              Commission Records
            </TabsTrigger>
            <TabsTrigger
              value="calculator"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Calculator className="h-4 w-4" />
              Commission Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Commissions
                  </CardTitle>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalCommissions}
                  </div>
                  <p className="text-xs text-gray-600">
                    Total commission records
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Amount
                  </CardTitle>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">
                    Sum of all commissions
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    This Month
                  </CardTitle>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ${monthlyAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">
                    Commissions this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Commission Records */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Commission Records
                </CardTitle>
                <CardDescription className="text-purple-100">
                  View and manage all commission and salary records
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="space-y-3">
                    {commissionRecords.length === 0 ? (
                      <div className="text-center py-8">
                        <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No commission records found
                        </p>
                      </div>
                    ) : (
                      commissionRecords.map((record) => (
                        <MobileCommissionCard
                          key={record.id}
                          record={record}
                          onDelete={deleteMutation.mutate}
                        />
                      ))
                    )}
                  </div>

                  {/* Mobile Notice */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-700">
                        Swipe to view all commission information
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-gray-100"
                        >
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead
                                key={header.id}
                                className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200"
                              >
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
                            className="hover:bg-blue-50 transition-colors duration-200"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className="py-4 border-b border-gray-100"
                              >
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
                            {recordsLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Loading commission records...
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                  No commission records found
                                </p>
                                <p className="text-gray-400">
                                  Create your first commission using the
                                  calculator above
                                </p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="flex-1 text-sm text-gray-600">
                    Showing {table.getFilteredRowModel().rows.length} commission
                    records
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="border-gray-200 hover:bg-blue-50"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="border-gray-200 hover:bg-blue-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Doctors
                  </CardTitle>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {doctors.length}
                  </div>
                  <p className="text-xs text-gray-600">
                    Active doctors in system
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Default Commission
                  </CardTitle>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">20%</div>
                  <p className="text-xs text-gray-600">
                    Standard commission rate
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-teal-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Salary Rate
                  </CardTitle>
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Calculator className="h-4 w-4 text-teal-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">15%</div>
                  <p className="text-xs text-gray-600">Laboratory staff rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Commission Settings
                </CardTitle>
                <CardDescription className="text-green-100">
                  Configure default commission percentages and salary
                  calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Doctor Commission Rate
                        </h4>
                        <p className="text-sm text-gray-600">
                          Default commission percentage for all doctors
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      30%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-200 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Microscope className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Laboratory Salary Rate
                        </h4>
                        <p className="text-sm text-gray-600">
                          Default salary percentage for laboratory staff
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      30%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-200 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Calculation Period
                        </h4>
                        <p className="text-sm text-gray-600">
                          Default period for commission calculations
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      Monthly
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
