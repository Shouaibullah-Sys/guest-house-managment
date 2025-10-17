// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  TestTube,
  Stethoscope,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  Download,
  Eye,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  UserCog,
  BarChart3,
  ChevronDown,
  ChartBar,
  Calculator,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalPatients: number;
  totalTests: number;
  pendingTests: number;
  completedTests: number;
}

interface DepartmentProfit {
  department: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  margin: number;
}

interface RecentTransaction {
  id: number;
  type: "test" | "expense" | "commission";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
  patientName?: string;
  doctorName?: string;
}

interface Expense {
  id: number;
  amount: number;
  expenseDate?: string;
  createdAt: string;
  status: string;
  expenseType?: string;
  description: string;
  relatedDoctorId?: number;
}

interface Test {
  id: number;
  testName: string;
  amountPaid?: number;
  testDate?: string;
  createdAt: string;
  status: string;
  testType?: string;
  doctorId?: number;
  patient?: {
    firstName: string;
    lastName: string;
  };
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

interface Doctor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  createdAt: string;
}

interface Staff {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt: string;
}

interface Commission {
  id: number;
  amount: number;
  doctorId: number;
  testId?: number;
  createdAt: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface DateRange {
  from: string;
  to: string;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalPatients: 0,
    totalTests: 0,
    pendingTests: 0,
    completedTests: 0,
  });
  const [departmentProfits, setDepartmentProfits] = useState<
    DepartmentProfit[]
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>(getThisMonthRange());

  // Date range functions
  function getTodayRange(): DateRange {
    const today = new Date().toISOString().split("T")[0];
    return { from: today, to: today };
  }

  function getThisWeekRange(): DateRange {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );
    return {
      from: firstDay.toISOString().split("T")[0],
      to: lastDay.toISOString().split("T")[0],
    };
  }

  function getThisMonthRange(): DateRange {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split("T")[0],
      to: lastDay.toISOString().split("T")[0],
    };
  }

  function getLifetimeRange(): DateRange {
    return {
      from: "2020-01-01", // Start from a reasonable early date
      to: new Date().toISOString().split("T")[0],
    };
  }

  const handleDateRangeChange = (
    range: "today" | "week" | "month" | "lifetime"
  ) => {
    switch (range) {
      case "today":
        setDateRange(getTodayRange());
        break;
      case "week":
        setDateRange(getThisWeekRange());
        break;
      case "month":
        setDateRange(getThisMonthRange());
        break;
      case "lifetime":
        setDateRange(getLifetimeRange());
        break;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        testsResponse,
        patientsResponse,
        expensesResponse,
        doctorsResponse,
        staffResponse,
        commissionsResponse,
      ] = await Promise.all([
        fetch("/api/laboratory/tests"),
        fetch("/api/laboratory/patients"),
        fetch("/api/laboratory/expenses"),
        fetch("/api/laboratory/doctors"),
        fetch("/api/laboratory/staff"),
        fetch("/api/laboratory/doctor-commissions"),
      ]);

      if (!testsResponse.ok || !patientsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const testsData = await testsResponse.json();
      const patientsData = await patientsResponse.json();
      const expensesData = await expensesResponse.json();
      const doctorsData = await doctorsResponse.json();
      const staffData = await staffResponse.json();
      const commissionsData = await commissionsResponse.json();

      // Process the data with date range filtering
      await processDashboardData(
        testsData.tests || [],
        patientsData.patients || [],
        expensesData || [],
        doctorsData.doctors || [],
        staffData || [],
        commissionsData || []
      );

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = async (
    tests: Test[],
    patients: Patient[],
    expenses: Expense[],
    doctors: Doctor[],
    staff: Staff[],
    commissions: Commission[]
  ) => {
    // Filter data by date range
    const filteredTests = tests.filter((test) => {
      const testDate = new Date(test.testDate || test.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include entire end day
      return testDate >= fromDate && testDate <= toDate;
    });

    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate || expense.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return expenseDate >= fromDate && expenseDate <= toDate;
    });

    // Calculate basic stats
    const totalRevenue = filteredTests
      .filter((test) => test.status === "completed")
      .reduce((sum, test) => sum + (test.amountPaid || 0), 0);

    const totalExpenses = filteredExpenses
      .filter(
        (expense) => expense.status === "paid" || expense.status === "active"
      )
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const totalTests = filteredTests.length;
    const completedTests = filteredTests.filter(
      (test) => test.status === "completed"
    ).length;
    const pendingTests = filteredTests.filter(
      (test) => test.status === "pending"
    ).length;

    // Set stats
    setStats({
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalPatients: patients.length, // Total patients (not filtered by date)
      totalTests,
      pendingTests,
      completedTests,
    });

    // Calculate department profits
    const departmentData = calculateDepartmentProfits(
      filteredTests,
      filteredExpenses
    );
    setDepartmentProfits(departmentData);

    // Prepare recent transactions
    const transactions = prepareRecentTransactions(
      filteredTests,
      filteredExpenses,
      doctors
    );
    setRecentTransactions(transactions);

    // Prepare revenue data for charts
    const revenueChartData = prepareRevenueData(
      filteredTests,
      filteredExpenses
    );
    setRevenueData(revenueChartData);
  };

  const calculateDepartmentProfits = (
    tests: Test[],
    expenses: Expense[]
  ): DepartmentProfit[] => {
    const departmentMap = new Map<
      string,
      { revenue: number; expenses: number }
    >();

    // Calculate revenue by test type (department)
    tests.forEach((test) => {
      if (test.status === "completed") {
        const dept = test.testType || "Other";
        const current = departmentMap.get(dept) || { revenue: 0, expenses: 0 };
        current.revenue += test.amountPaid || 0;
        departmentMap.set(dept, current);
      }
    });

    // Calculate expenses by type (simplified allocation)
    expenses.forEach((expense) => {
      if (expense.status === "paid" || expense.status === "active") {
        const amount = expense.amount || 0;
        const perDepartment = amount / (departmentMap.size || 1);

        departmentMap.forEach((value, key) => {
          value.expenses += perDepartment;
        });
      }
    });

    // Convert to DepartmentProfit array
    return Array.from(departmentMap.entries()).map(([department, data]) => {
      const netProfit = data.revenue - data.expenses;
      const margin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

      return {
        department: department.charAt(0).toUpperCase() + department.slice(1),
        revenue: Math.round(data.revenue),
        expenses: Math.round(data.expenses),
        netProfit: Math.round(netProfit),
        margin: Math.round(margin * 100) / 100,
      };
    });
  };

  const prepareRecentTransactions = (
    tests: Test[],
    expenses: Expense[],
    doctors: Doctor[]
  ): RecentTransaction[] => {
    const transactions: RecentTransaction[] = [];

    // Add test transactions
    tests.slice(0, 10).forEach((test, index) => {
      const doctor = doctors.find((d) => d.id === test.doctorId);
      transactions.push({
        id: test.id || index, // Fallback to index if id is missing
        type: "test",
        description: test.testName || "Unnamed Test",
        amount: test.amountPaid || 0,
        date: test.testDate || test.createdAt || new Date().toISOString(),
        status: mapTestStatus(test.status),
        patientName: test.patient
          ? `${test.patient.firstName} ${test.patient.lastName}`
          : undefined,
        doctorName: doctor?.name,
      });
    });

    // Add expense transactions
    expenses.slice(0, 10).forEach((expense, index) => {
      const type =
        expense.expenseType === "doctor_percentage" ? "commission" : "expense";
      const doctor = doctors.find((d) => d.id === expense.relatedDoctorId);

      transactions.push({
        id: expense.id || Date.now() + index, // Fallback to timestamp + index if id is missing
        type,
        description: expense.description || "Unnamed Expense",
        amount: -(expense.amount || 0),
        date:
          expense.expenseDate || expense.createdAt || new Date().toISOString(),
        status: mapExpenseStatus(expense.status),
        doctorName: doctor?.name,
      });
    });

    // Sort by date and take top 5
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const prepareRevenueData = (
    tests: Test[],
    expenses: Expense[]
  ): RevenueData[] => {
    const last6Months = getLast6Months();
    const revenueData = last6Months.map((month) => {
      const monthTests = tests.filter((test) => {
        const testDate = new Date(test.testDate || test.createdAt);
        return (
          testDate.getMonth() === month.month &&
          testDate.getFullYear() === month.year &&
          test.status === "completed"
        );
      });

      const monthExpensesFiltered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.expenseDate || expense.createdAt);
        return (
          expenseDate.getMonth() === month.month &&
          expenseDate.getFullYear() === month.year
        );
      });

      const revenue = monthTests.reduce(
        (sum, test) => sum + (test.amountPaid || 0),
        0
      );
      const monthExpenses = monthExpensesFiltered.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );

      return {
        month: month.name,
        revenue: Math.round(revenue),
        expenses: Math.round(monthExpenses),
      };
    });

    return revenueData;
  };

  // Helper functions
  const getLast6Months = () => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: date.toLocaleString("default", { month: "short" }),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }

    return months;
  };

  const mapTestStatus = (
    status: string
  ): "completed" | "pending" | "cancelled" => {
    switch (status) {
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const mapExpenseStatus = (
    status: string
  ): "completed" | "pending" | "cancelled" => {
    switch (status) {
      case "paid":
        return "completed";
      case "inactive":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Mobile-friendly transaction card
  const MobileTransactionCard = ({
    transaction,
  }: {
    transaction: RecentTransaction;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {transaction.description}
          </h4>
          {transaction.patientName && (
            <p className="text-xs text-gray-600 mt-1">
              Patient: {transaction.patientName}
            </p>
          )}
          {transaction.doctorName && (
            <p className="text-xs text-gray-600">
              Doctor: {transaction.doctorName}
            </p>
          )}
        </div>
        <Badge
          variant={
            transaction.type === "test"
              ? "default"
              : transaction.type === "expense"
              ? "destructive"
              : "secondary"
          }
          className="text-xs"
        >
          {transaction.type}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Amount:</span>
          <span
            className={`font-semibold ml-1 ${
              transaction.amount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.amount >= 0 ? "+" : ""}$
            {Math.abs(transaction.amount).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Date:</span>
          <span className="font-semibold ml-1">
            {new Date(transaction.date).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>
          <Badge
            variant={
              transaction.status === "completed"
                ? "default"
                : transaction.status === "pending"
                ? "secondary"
                : "destructive"
            }
            className="ml-1 text-xs"
          >
            {transaction.status}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName}! Here's your laboratory overview.
              {lastUpdated && (
                <span className="text-sm text-gray-500 ml-2">
                  Last updated: {lastUpdated}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <a href="/admin/users">
                <UserCog className="h-4 w-4 mr-2" />
                User Management
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/conversation">
                <ChartBar className="h-4 w-4 mr-2" />
                Chat wit Patient
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={fetchDashboardData}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/commissions">
                <Calculator className="h-4 w-4 mr-2" />
                Commissions
              </a>
            </Button>
          </div>
        </div>

        {/* Date Range Picker */}
        <Card className="mb-6 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="from-date" className="text-sm font-medium">
                    From Date
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date" className="text-sm font-medium">
                    To Date
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    dateRange.from === getTodayRange().from
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("today")}
                >
                  Today
                </Button>
                <Button
                  variant={
                    dateRange.from === getThisWeekRange().from
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("week")}
                >
                  This Week
                </Button>
                <Button
                  variant={
                    dateRange.from === getThisMonthRange().from
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("month")}
                >
                  This Month
                </Button>
                <Button
                  variant={
                    dateRange.from === getLifetimeRange().from
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDateRangeChange("lifetime")}
                >
                  Life Time
                </Button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Showing data from {new Date(dateRange.from).toLocaleDateString()}{" "}
              to {new Date(dateRange.to).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            change={12.5}
            icon={<DollarSign className="h-6 w-6" />}
            color="text-green-600"
            bgColor="bg-green-500"
          />
          <StatCard
            title="Net Profit"
            value={stats.netProfit}
            change={8.3}
            icon={<TrendingUp className="h-6 w-6" />}
            color="text-blue-600"
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            change={5.2}
            icon={<Users className="h-6 w-6" />}
            color="text-purple-600"
            bgColor="bg-purple-500"
          />
          <StatCard
            title="Tests Completed"
            value={stats.completedTests}
            change={15.7}
            icon={<TestTube className="h-6 w-6" />}
            color="text-orange-600"
            bgColor="bg-orange-500"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/90 backdrop-blur-sm border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Departments</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue vs Expenses
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue and expenses comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0088FE"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#FF8042"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Profit Distribution */}
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Profit by Department
                  </CardTitle>
                  <CardDescription>
                    Net profit distribution across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentProfits}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ department, netProfit }) =>
                            `${department}: $${netProfit}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="netProfit"
                        >
                          {departmentProfits.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Department Performance
                </CardTitle>
                <CardDescription>
                  Detailed profit margin analysis by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {departmentProfits.map((dept, index) => (
                    <div
                      key={dept.department}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {dept.department}
                        </h3>
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: COLORS[index] + "20" }}
                        >
                          <DollarSign
                            className="h-4 w-4"
                            style={{ color: COLORS[index] }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-semibold">
                            ${dept.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expenses:</span>
                          <span className="font-semibold">
                            ${dept.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Net Profit:</span>
                          <span
                            className={`font-semibold ${
                              dept.netProfit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${dept.netProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Margin:</span>
                          <Badge
                            variant={
                              dept.margin > 50
                                ? "default"
                                : dept.margin > 30
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {dept.margin}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Detailed revenue breakdown and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                      <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Department Profit Margins
                </CardTitle>
                <CardDescription>
                  Comprehensive department-wise profit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentProfits}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                      <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                      <Bar
                        dataKey="netProfit"
                        fill="#00C49F"
                        name="Net Profit"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest financial transactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div>
                              {transaction.description}
                              {transaction.patientName && (
                                <div className="text-sm text-gray-500">
                                  Patient: {transaction.patientName}
                                </div>
                              )}
                              {transaction.doctorName && (
                                <div className="text-sm text-gray-500">
                                  Doctor: {transaction.doctorName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "test"
                                  ? "default"
                                  : transaction.type === "expense"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={
                              transaction.amount >= 0
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {transaction.amount >= 0 ? "+" : ""}$
                            {Math.abs(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : transaction.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {recentTransactions.map((transaction) => (
                    <MobileTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>

                {recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found for the selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon,
  color,
  bgColor,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${value.toLocaleString()}
            </p>
            <div
              className={`flex items-center mt-2 text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}% from last month
            </div>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
