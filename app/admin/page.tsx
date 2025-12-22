// // app/admin/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
// } from "recharts";
// import {
//   Users,
//   TestTube,
//   Stethoscope,
//   DollarSign,
//   TrendingUp,
//   Calendar,
//   Activity,
//   Download,
//   Eye,
//   MoreHorizontal,
//   ArrowUp,
//   ArrowDown,
//   RefreshCw,
//   UserCog,
//   BarChart3,
//   ChevronDown,
//   ChartBar,
//   Calculator,
//   User,
//   Phone,
//   Mail,
//   Clock,
// } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { PatientList } from "@/components/patient-list";

// interface DashboardStats {
//   totalRevenue: number;
//   totalExpenses: number;
//   netProfit: number;
//   profitMargin: number;
//   totalPatients: number;
//   totalTests: number;
//   pendingTests: number;
//   completedTests: number;
// }

// interface DepartmentProfit {
//   department: string;
//   revenue: number;
//   expenses: number;
//   netProfit: number;
//   margin: number;
// }

// interface RecentTransaction {
//   id: number;
//   type: "test" | "expense" | "commission";
//   description: string;
//   amount: number;
//   date: string;
//   status: "completed" | "pending" | "cancelled";
//   patientName?: string;
//   doctorName?: string;
// }

// interface Expense {
//   id: number;
//   amount: number;
//   expenseDate?: string;
//   createdAt: string;
//   status: string;
//   expenseType?: string;
//   description: string;
//   relatedDoctorId?: number;
// }

// interface Test {
//   id: number;
//   testName: string;
//   amountPaid?: number;
//   testDate?: string;
//   createdAt: string;
//   status: string;
//   testType?: string;
//   doctorId?: number;
//   patient?: {
//     firstName: string;
//     lastName: string;
//   };
// }

// interface Patient {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   patientPin?: string;
//   dateOfBirth?: string;
//   gender?: string;
//   address?: string;
//   emergencyContact?: string;
//   medicalHistory?: string;
//   createdAt: string;
//   updatedAt?: string;
//   lastVisit?: string;
//   totalTests?: number;
//   status?: "active" | "inactive";
//   email?: string;
//   phone?: string;
// }

// interface Doctor {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   department?: string;
//   createdAt: string;
// }

// interface Staff {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   role?: string;
//   createdAt: string;
// }

// interface Commission {
//   id: number;
//   amount: number;
//   doctorId: number;
//   testId?: number;
//   createdAt: string;
// }

// interface RevenueData {
//   month: string;
//   revenue: number;
//   expenses: number;
// }

// interface StatCardProps {
//   title: string;
//   value: number;
//   change: number;
//   icon: React.ReactNode;
//   color: string;
//   bgColor: string;
// }

// interface DateRange {
//   from: string;
//   to: string;
// }

// export default function AdminDashboard() {
//   const { user } = useUser();
//   const [stats, setStats] = useState<DashboardStats>({
//     totalRevenue: 0,
//     totalExpenses: 0,
//     netProfit: 0,
//     profitMargin: 0,
//     totalPatients: 0,
//     totalTests: 0,
//     pendingTests: 0,
//     completedTests: 0,
//   });
//   const [departmentProfits, setDepartmentProfits] = useState<
//     DepartmentProfit[]
//   >([]);
//   const [recentTransactions, setRecentTransactions] = useState<
//     RecentTransaction[]
//   >([]);
//   const [transactionsSummary, setTransactionsSummary] = useState<{
//     totalIncome: number;
//     totalExpenses: number;
//     netAmount: number;
//     transactionCount: number;
//   }>({
//     totalIncome: 0,
//     totalExpenses: 0,
//     netAmount: 0,
//     transactionCount: 0,
//   });
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState<string>("");
//   const [dateRange, setDateRange] = useState<DateRange>(getThisMonthRange());
//   const [activeTab, setActiveTab] = useState("overview");

//   // Date range functions
//   function getTodayRange(): DateRange {
//     const today = new Date().toISOString().split("T")[0];
//     return { from: today, to: today };
//   }

//   function getThisWeekRange(): DateRange {
//     const today = new Date();
//     const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
//     const lastDay = new Date(
//       today.setDate(today.getDate() - today.getDay() + 6)
//     );
//     return {
//       from: firstDay.toISOString().split("T")[0],
//       to: lastDay.toISOString().split("T")[0],
//     };
//   }

//   function getThisMonthRange(): DateRange {
//     const today = new Date();
//     const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     return {
//       from: firstDay.toISOString().split("T")[0],
//       to: lastDay.toISOString().split("T")[0],
//     };
//   }

//   function getLifetimeRange(): DateRange {
//     return {
//       from: "2020-01-01", // Start from a reasonable early date
//       to: new Date().toISOString().split("T")[0],
//     };
//   }

//   const handleDateRangeChange = (
//     range: "today" | "week" | "month" | "lifetime"
//   ) => {
//     switch (range) {
//       case "today":
//         setDateRange(getTodayRange());
//         break;
//       case "week":
//         setDateRange(getThisWeekRange());
//         break;
//       case "month":
//         setDateRange(getThisMonthRange());
//         break;
//       case "lifetime":
//         setDateRange(getLifetimeRange());
//         break;
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, [dateRange]);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       // Fetch all data in parallel
//       const [
//         testsResponse,
//         patientsResponse,
//         expensesResponse,
//         doctorsResponse,
//         staffResponse,
//         commissionsResponse,
//         transactionsResponse,
//       ] = await Promise.all([
//         fetch("/api/laboratory/tests"),
//         fetch("/api/laboratory/patients"),
//         fetch("/api/expenses"),
//         fetch("/api/laboratory/doctors"),
//         fetch("/api/laboratory/staff"),
//         fetch("/api/laboratory/doctor-commissions"),
//         fetch(
//           `/api/admin/dashboard/transactions?startDate=${dateRange.from}&endDate=${dateRange.to}`
//         ),
//       ]);

//       if (!testsResponse.ok || !patientsResponse.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const testsData = await testsResponse.json();
//       const patientsData = await patientsResponse.json();
//       const expensesData = await expensesResponse.json();
//       const doctorsData = await doctorsResponse.json();
//       const staffData = await staffResponse.json();
//       const commissionsData = await commissionsResponse.json();
//       const transactionsData = await transactionsResponse.json();

//       // Set transactions data
//       setRecentTransactions(transactionsData.transactions || []);
//       setTransactionsSummary(
//         transactionsData.summary || {
//           totalIncome: 0,
//           totalExpenses: 0,
//           netAmount: 0,
//           transactionCount: 0,
//         }
//       );

//       // Process the data with date range filtering
//       await processDashboardData(
//         testsData.tests || [],
//         patientsData.patients || [],
//         expensesData || [],
//         doctorsData.doctors || [],
//         staffData || [],
//         commissionsData || []
//       );

//       setLastUpdated(new Date().toLocaleTimeString());
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processDashboardData = async (
//     tests: Test[],
//     patients: Patient[],
//     expenses: Expense[],
//     doctors: Doctor[],
//     staff: Staff[],
//     commissions: Commission[]
//   ) => {
//     // Filter data by date range
//     const filteredTests = tests.filter((test) => {
//       const testDate = new Date(test.testDate || test.createdAt);
//       const fromDate = new Date(dateRange.from);
//       const toDate = new Date(dateRange.to);
//       toDate.setHours(23, 59, 59, 999); // Include entire end day
//       return testDate >= fromDate && testDate <= toDate;
//     });

//     const filteredExpenses = expenses.filter((expense) => {
//       const expenseDate = new Date(expense.expenseDate || expense.createdAt);
//       const fromDate = new Date(dateRange.from);
//       const toDate = new Date(dateRange.to);
//       toDate.setHours(23, 59, 59, 999);
//       return expenseDate >= fromDate && expenseDate <= toDate;
//     });

//     // Filter patients by date range
//     const filteredPatients = patients.filter((patient) => {
//       const patientDate = new Date(patient.createdAt);
//       const fromDate = new Date(dateRange.from);
//       const toDate = new Date(dateRange.to);
//       toDate.setHours(23, 59, 59, 999);
//       return patientDate >= fromDate && patientDate <= toDate;
//     });

//     // Calculate basic stats
//     const totalRevenue = filteredTests
//       .filter((test) => test.status === "completed")
//       .reduce((sum, test) => sum + (test.amountPaid || 0), 0);

//     const totalExpenses = filteredExpenses
//       .filter(
//         (expense) => expense.status === "paid" || expense.status === "active"
//       )
//       .reduce((sum, expense) => sum + (expense.amount || 0), 0);

//     const netProfit = totalRevenue - totalExpenses;
//     const profitMargin =
//       totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

//     const totalTests = filteredTests.length;
//     const completedTests = filteredTests.filter(
//       (test) => test.status === "completed"
//     ).length;
//     const pendingTests = filteredTests.filter(
//       (test) => test.status === "pending"
//     ).length;

//     // Set stats
//     setStats({
//       totalRevenue,
//       totalExpenses,
//       netProfit,
//       profitMargin,
//       totalPatients: filteredPatients.length, // Use filtered patients count
//       totalTests,
//       pendingTests,
//       completedTests,
//     });

//     // Process patients data with additional info
//     const processedPatients: Patient[] = filteredPatients.map((patient) => {
//       const patientTests = filteredTests.filter(
//         (test) =>
//           test.patient?.firstName === patient.firstName &&
//           test.patient?.lastName === patient.lastName
//       );

//       const lastTest = patientTests
//         .filter((test) => test.testDate)
//         .sort(
//           (a, b) =>
//             new Date(b.testDate!).getTime() - new Date(a.testDate!).getTime()
//         )[0];

//       const status: "active" | "inactive" =
//         patientTests.length > 0 ? "active" : "inactive";

//       return {
//         ...patient,
//         phone: patient.phoneNumber,
//         email: undefined,
//         totalTests: patientTests.length,
//         lastVisit: lastTest?.testDate || patient.createdAt,
//         status: status,
//       };
//     });

//     setPatients(processedPatients);
//     setFilteredPatients(processedPatients);

//     // Calculate department profits
//     const departmentData = calculateDepartmentProfits(
//       filteredTests,
//       filteredExpenses
//     );
//     setDepartmentProfits(departmentData);

//     // Prepare revenue data for charts
//     const revenueChartData = prepareRevenueData(
//       filteredTests,
//       filteredExpenses
//     );
//     setRevenueData(revenueChartData);
//   };

//   const calculateDepartmentProfits = (
//     tests: Test[],
//     expenses: Expense[]
//   ): DepartmentProfit[] => {
//     const departmentMap = new Map<
//       string,
//       { revenue: number; expenses: number }
//     >();

//     // Calculate revenue by test type (department)
//     tests.forEach((test) => {
//       if (test.status === "completed") {
//         const dept = test.testType || "Other";
//         const current = departmentMap.get(dept) || { revenue: 0, expenses: 0 };
//         current.revenue += test.amountPaid || 0;
//         departmentMap.set(dept, current);
//       }
//     });

//     // Calculate expenses by type (simplified allocation)
//     expenses.forEach((expense) => {
//       if (expense.status === "paid" || expense.status === "active") {
//         const amount = expense.amount || 0;
//         const perDepartment = amount / (departmentMap.size || 1);

//         departmentMap.forEach((value, key) => {
//           value.expenses += perDepartment;
//         });
//       }
//     });

//     // Convert to DepartmentProfit array
//     return Array.from(departmentMap.entries()).map(([department, data]) => {
//       const netProfit = data.revenue - data.expenses;
//       const margin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

//       return {
//         department: department.charAt(0).toUpperCase() + department.slice(1),
//         revenue: Math.round(data.revenue),
//         expenses: Math.round(data.expenses),
//         netProfit: Math.round(netProfit),
//         margin: Math.round(margin * 100) / 100,
//       };
//     });
//   };

//   const prepareRecentTransactions = (
//     tests: Test[],
//     expenses: Expense[],
//     doctors: Doctor[]
//   ): RecentTransaction[] => {
//     const transactions: RecentTransaction[] = [];

//     // Add ALL test transactions (removed the slice limit)
//     tests.forEach((test, index) => {
//       const doctor = doctors.find((d) => d.id === test.doctorId);
//       transactions.push({
//         id: test.id || index,
//         type: "test",
//         description: test.testName || "Unnamed Test",
//         amount: test.amountPaid || 0,
//         date: test.testDate || test.createdAt || new Date().toISOString(),
//         status: mapTestStatus(test.status),
//         patientName: test.patient
//           ? `${test.patient.firstName} ${test.patient.lastName}`
//           : undefined,
//         doctorName: doctor?.name,
//       });
//     });

//     // Add ALL expense transactions (removed the slice limit)
//     expenses.forEach((expense, index) => {
//       const type =
//         expense.expenseType === "doctor_percentage" ? "commission" : "expense";
//       const doctor = doctors.find((d) => d.id === expense.relatedDoctorId);

//       transactions.push({
//         id: expense.id || Date.now() + index,
//         type,
//         description: expense.description || "Unnamed Expense",
//         amount: -(expense.amount || 0),
//         date:
//           expense.expenseDate || expense.createdAt || new Date().toISOString(),
//         status: mapExpenseStatus(expense.status),
//         doctorName: doctor?.name,
//       });
//     });

//     // Sort by date and return ALL transactions (removed the slice limit)
//     return transactions.sort(
//       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//     );
//   };

//   const prepareRevenueData = (
//     tests: Test[],
//     expenses: Expense[]
//   ): RevenueData[] => {
//     const last6Months = getLast6Months();
//     const revenueData = last6Months.map((month) => {
//       const monthTests = tests.filter((test) => {
//         const testDate = new Date(test.testDate || test.createdAt);
//         return (
//           testDate.getMonth() === month.month &&
//           testDate.getFullYear() === month.year &&
//           test.status === "completed"
//         );
//       });

//       const monthExpensesFiltered = expenses.filter((expense) => {
//         const expenseDate = new Date(expense.expenseDate || expense.createdAt);
//         return (
//           expenseDate.getMonth() === month.month &&
//           expenseDate.getFullYear() === month.year
//         );
//       });

//       const revenue = monthTests.reduce(
//         (sum, test) => sum + (test.amountPaid || 0),
//         0
//       );
//       const monthExpenses = monthExpensesFiltered.reduce(
//         (sum, expense) => sum + (expense.amount || 0),
//         0
//       );

//       return {
//         month: month.name,
//         revenue: Math.round(revenue),
//         expenses: Math.round(monthExpenses),
//       };
//     });

//     return revenueData;
//   };

//   // Helper functions
//   const getLast6Months = () => {
//     const months = [];
//     const today = new Date();

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
//       months.push({
//         name: date.toLocaleString("default", { month: "short" }),
//         month: date.getMonth(),
//         year: date.getFullYear(),
//       });
//     }

//     return months;
//   };

//   const mapTestStatus = (
//     status: string
//   ): "completed" | "pending" | "cancelled" => {
//     switch (status) {
//       case "completed":
//         return "completed";
//       case "cancelled":
//         return "cancelled";
//       default:
//         return "pending";
//     }
//   };

//   const mapExpenseStatus = (
//     status: string
//   ): "completed" | "pending" | "cancelled" => {
//     switch (status) {
//       case "paid":
//         return "completed";
//       case "inactive":
//         return "cancelled";
//       default:
//         return "pending";
//     }
//   };

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

//   // Mobile-friendly transaction card
//   const MobileTransactionCard = ({
//     transaction,
//   }: {
//     transaction: RecentTransaction;
//   }) => (
//     <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
//       <div className="flex justify-between items-start mb-2">
//         <div className="flex-1">
//           <h4 className="font-semibold text-gray-900 text-sm">
//             {transaction.description}
//           </h4>
//           {transaction.patientName && (
//             <p className="text-xs text-gray-600 mt-1">
//               Patient: {transaction.patientName}
//             </p>
//           )}
//           {transaction.doctorName && (
//             <p className="text-xs text-gray-600">
//               Doctor: {transaction.doctorName}
//             </p>
//           )}
//         </div>
//         <Badge
//           variant={
//             transaction.type === "test"
//               ? "default"
//               : transaction.type === "expense"
//               ? "destructive"
//               : "secondary"
//           }
//           className="text-xs"
//         >
//           {transaction.type}
//         </Badge>
//       </div>
//       <div className="grid grid-cols-2 gap-2 text-sm">
//         <div>
//           <span className="text-gray-600">Amount:</span>
//           <span
//             className={`font-semibold ml-1 ${
//               transaction.amount >= 0 ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {transaction.amount >= 0 ? "+" : ""}AFN
//             {Math.abs(transaction.amount).toLocaleString()}
//           </span>
//         </div>
//         <div>
//           <span className="text-gray-600">Date:</span>
//           <span className="font-semibold ml-1">
//             {new Date(transaction.date).toLocaleDateString()}
//           </span>
//         </div>
//         <div>
//           <span className="text-gray-600">Status:</span>
//           <Badge
//             variant={
//               transaction.status === "completed"
//                 ? "default"
//                 : transaction.status === "pending"
//                 ? "secondary"
//                 : "destructive"
//             }
//             className="ml-1 text-xs"
//           >
//             {transaction.status}
//           </Badge>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
//       <div className="container mx-auto px-3 py-6 pt-20">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <div>
//             <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
//               Admin Dashboard
//             </h1>
//             <p className="text-gray-600 text-sm md:text-base">
//               Welcome back, {user?.firstName}! Here's your laboratory overview.
//               {lastUpdated && (
//                 <span className="text-xs md:text-sm text-gray-500 ml-2">
//                   Last updated: {lastUpdated}
//                 </span>
//               )}
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
//             <Button variant="outline" size="sm" asChild>
//               <a href="/admin/users">
//                 <UserCog className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
//                 <span className="text-xs md:text-sm">Users</span>
//               </a>
//             </Button>
//             <Button variant="outline" size="sm" asChild>
//               <a href="/admin/conversation">
//                 <ChartBar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
//                 <span className="text-xs md:text-sm">Chat</span>
//               </a>
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="flex items-center gap-1 md:gap-2"
//               onClick={fetchDashboardData}
//             >
//               <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
//               <span className="text-xs md:text-sm">Refresh</span>
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="flex items-center gap-1 md:gap-2"
//             >
//               <Download className="h-3 w-3 md:h-4 md:w-4" />
//               <span className="text-xs md:text-sm">Export</span>
//             </Button>
//             <Button variant="outline" size="sm" asChild>
//               <a href="/admin/commissions">
//                 <Calculator className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
//                 <span className="text-xs md:text-sm">Commissions</span>
//               </a>
//             </Button>
//           </div>
//         </div>

//         {/* Date Range Picker */}
//         <Card className="mb-6 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//           <CardContent className="p-4 md:p-6">
//             <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
//                 <div className="space-y-2">
//                   <Label htmlFor="from-date" className="text-sm font-medium">
//                     From Date
//                   </Label>
//                   <Input
//                     id="from-date"
//                     type="date"
//                     value={dateRange.from}
//                     onChange={(e) =>
//                       setDateRange((prev) => ({
//                         ...prev,
//                         from: e.target.value,
//                       }))
//                     }
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="to-date" className="text-sm font-medium">
//                     To Date
//                   </Label>
//                   <Input
//                     id="to-date"
//                     type="date"
//                     value={dateRange.to}
//                     onChange={(e) =>
//                       setDateRange((prev) => ({ ...prev, to: e.target.value }))
//                     }
//                     className="w-full"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 w-full lg:w-auto">
//                 <Button
//                   variant={
//                     dateRange.from === getTodayRange().from
//                       ? "default"
//                       : "outline"
//                   }
//                   size="sm"
//                   onClick={() => handleDateRangeChange("today")}
//                   className="flex-1 lg:flex-none"
//                 >
//                   Today
//                 </Button>
//                 <Button
//                   variant={
//                     dateRange.from === getThisWeekRange().from
//                       ? "default"
//                       : "outline"
//                   }
//                   size="sm"
//                   onClick={() => handleDateRangeChange("week")}
//                   className="flex-1 lg:flex-none"
//                 >
//                   Week
//                 </Button>
//                 <Button
//                   variant={
//                     dateRange.from === getThisMonthRange().from
//                       ? "default"
//                       : "outline"
//                   }
//                   size="sm"
//                   onClick={() => handleDateRangeChange("month")}
//                   className="flex-1 lg:flex-none"
//                 >
//                   Month
//                 </Button>
//                 <Button
//                   variant={
//                     dateRange.from === getLifetimeRange().from
//                       ? "default"
//                       : "outline"
//                   }
//                   size="sm"
//                   onClick={() => handleDateRangeChange("lifetime")}
//                   className="flex-1 lg:flex-none"
//                 >
//                   Lifetime
//                 </Button>
//               </div>
//             </div>
//             <div className="mt-3 text-sm text-gray-500">
//               Showing data from {new Date(dateRange.from).toLocaleDateString()}{" "}
//               to {new Date(dateRange.to).toLocaleDateString()}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
//           <StatCard
//             title="Total Revenue"
//             value={stats.totalRevenue}
//             change={12.5}
//             icon={<DollarSign className="h-4 w-4 md:h-6 md:w-6" />}
//             color="text-green-600"
//             bgColor="bg-green-500"
//           />
//           <StatCard
//             title="Net Profit"
//             value={stats.netProfit}
//             change={8.3}
//             icon={<TrendingUp className="h-4 w-4 md:h-6 md:w-6" />}
//             color="text-blue-600"
//             bgColor="bg-blue-500"
//           />
//           <StatCard
//             title="Total Patients"
//             value={stats.totalPatients}
//             change={5.2}
//             icon={<Users className="h-4 w-4 md:h-6 md:w-6" />}
//             color="text-purple-600"
//             bgColor="bg-purple-500"
//           />
//           <StatCard
//             title="Tests Completed"
//             value={stats.completedTests}
//             change={15.7}
//             icon={<TestTube className="h-4 w-4 md:h-6 md:w-6" />}
//             color="text-orange-600"
//             bgColor="bg-orange-500"
//           />
//         </div>

//         {/* Main Content */}
//         <Tabs
//           defaultValue="overview"
//           className="space-y-4 md:space-y-6"
//           onValueChange={setActiveTab}
//         >
//           {/* Mobile-optimized Tabs */}
//           <TabsList className="flex w-full overflow-x-auto bg-white/90 backdrop-blur-sm border p-1">
//             <TabsTrigger
//               value="overview"
//               className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 px-2 md:px-4"
//             >
//               <Activity className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//               <span className="truncate text-xs md:text-sm">Overview</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="revenue"
//               className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 px-2 md:px-4"
//             >
//               <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//               <span className="truncate text-xs md:text-sm">Revenue</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="departments"
//               className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 px-2 md:px-4"
//             >
//               <Stethoscope className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//               <span className="truncate text-xs md:text-sm">Departments</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="transactions"
//               className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 px-2 md:px-4"
//             >
//               <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//               <span className="truncate text-xs md:text-sm">Transactions</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="patients"
//               className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 px-2 md:px-4"
//             >
//               <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//               <span className="truncate text-xs md:text-sm">Patients</span>
//             </TabsTrigger>
//           </TabsList>

//           {/* Overview Tab */}
//           <TabsContent value="overview" className="space-y-4 md:space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//               {/* Revenue vs Expenses Chart */}
//               <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="p-4 md:p-6">
//                   <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                     <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
//                     Revenue vs Expenses
//                   </CardTitle>
//                   <CardDescription className="text-sm md:text-base">
//                     Monthly revenue and expenses comparison
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-4 md:p-6 pt-0">
//                   <div className="h-[250px] md:h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={revenueData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="month" fontSize={12} />
//                         <YAxis fontSize={12} />
//                         <Tooltip />
//                         <Legend />
//                         <Line
//                           type="monotone"
//                           dataKey="revenue"
//                           stroke="#0088FE"
//                           strokeWidth={2}
//                         />
//                         <Line
//                           type="monotone"
//                           dataKey="expenses"
//                           stroke="#FF8042"
//                           strokeWidth={2}
//                         />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Department Profit Distribution */}
//               <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="p-4 md:p-6">
//                   <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                     <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
//                     Profit by Department
//                   </CardTitle>
//                   <CardDescription className="text-sm md:text-base">
//                     Net profit distribution across departments
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-4 md:p-6 pt-0">
//                   <div className="h-[250px] md:h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={departmentProfits}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           label={({ department, netProfit }) =>
//                             `${department}: AFN ${netProfit}`
//                           }
//                           outerRadius={80}
//                           fill="#8884d8"
//                           dataKey="netProfit"
//                         >
//                           {departmentProfits.map((entry, index) => (
//                             <Cell
//                               key={`cell-${index}`}
//                               fill={COLORS[index % COLORS.length]}
//                             />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Department Performance */}
//             <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="p-4 md:p-6">
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                   <Stethoscope className="h-4 w-4 md:h-5 md:w-5" />
//                   Department Performance
//                 </CardTitle>
//                 <CardDescription className="text-sm md:text-base">
//                   Detailed profit margin analysis by department
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 md:p-6">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {departmentProfits.map((dept, index) => (
//                     <div
//                       key={dept.department}
//                       className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200"
//                     >
//                       <div className="flex items-center justify-between mb-3">
//                         <h3 className="font-semibold text-gray-900 text-sm">
//                           {dept.department}
//                         </h3>
//                         <div
//                           className="p-2 rounded-lg"
//                           style={{ backgroundColor: COLORS[index] + "20" }}
//                         >
//                           <DollarSign
//                             className="h-3 w-3 md:h-4 md:w-4"
//                             style={{ color: COLORS[index] }}
//                           />
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <div className="flex justify-between text-xs md:text-sm">
//                           <span className="text-gray-600">Revenue:</span>
//                           <span className="font-semibold">
//                             AFN {dept.revenue.toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between text-xs md:text-sm">
//                           <span className="text-gray-600">Expenses:</span>
//                           <span className="font-semibold">
//                             AFN {dept.expenses.toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between text-xs md:text-sm">
//                           <span className="text-gray-600">Net Profit:</span>
//                           <span
//                             className={`font-semibold ${
//                               dept.netProfit >= 0
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             AFN {dept.netProfit.toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between text-xs md:text-sm">
//                           <span className="text-gray-600">Margin:</span>
//                           <Badge
//                             variant={
//                               dept.margin > 50
//                                 ? "default"
//                                 : dept.margin > 30
//                                 ? "secondary"
//                                 : "outline"
//                             }
//                             className="text-xs"
//                           >
//                             {dept.margin}%
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Revenue Tab */}
//           <TabsContent value="revenue">
//             <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="p-4 md:p-6">
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                   <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
//                   Revenue Analytics
//                 </CardTitle>
//                 <CardDescription className="text-sm md:text-base">
//                   Detailed revenue breakdown and trends
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 md:p-6 pt-0">
//                 <div className="h-[300px] md:h-[400px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={revenueData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" fontSize={12} />
//                       <YAxis fontSize={12} />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
//                       <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Departments Tab */}
//           <TabsContent value="departments">
//             <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="p-4 md:p-6">
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                   <Stethoscope className="h-4 w-4 md:h-5 md:w-5" />
//                   Department Profit Margins
//                 </CardTitle>
//                 <CardDescription className="text-sm md:text-base">
//                   Comprehensive department-wise profit analysis
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 md:p-6 pt-0">
//                 <div className="h-[300px] md:h-[400px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={departmentProfits}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="department" fontSize={12} />
//                       <YAxis fontSize={12} />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
//                       <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
//                       <Bar
//                         dataKey="netProfit"
//                         fill="#00C49F"
//                         name="Net Profit"
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Transactions Tab - FIXED: Now shows ALL transactions */}
//           <TabsContent value="transactions">
//             <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="p-4 md:p-6">
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                   <Calendar className="h-4 w-4 md:h-5 md:w-5" />
//                   Recent Transactions
//                 </CardTitle>
//                 <CardDescription className="text-sm md:text-base">
//                   {transactionsSummary.transactionCount} transactions found for
//                   the selected date range (Income: AFN{" "}
//                   {transactionsSummary.totalIncome.toLocaleString()}, Expenses:
//                   AFN {transactionsSummary.totalExpenses.toLocaleString()})
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 md:p-6">
//                 {/* Desktop Table */}
//                 <div className="hidden md:block rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Description</TableHead>
//                         <TableHead>Type</TableHead>
//                         <TableHead>Amount</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {recentTransactions.map((transaction) => (
//                         <TableRow key={transaction.id}>
//                           <TableCell className="font-medium">
//                             <div>
//                               {transaction.description}
//                               {transaction.patientName && (
//                                 <div className="text-sm text-gray-500">
//                                   Patient: {transaction.patientName}
//                                 </div>
//                               )}
//                               {transaction.doctorName && (
//                                 <div className="text-sm text-gray-500">
//                                   Doctor: {transaction.doctorName}
//                                 </div>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               variant={
//                                 transaction.type === "test"
//                                   ? "default"
//                                   : transaction.type === "expense"
//                                   ? "destructive"
//                                   : "secondary"
//                               }
//                             >
//                               {transaction.type}
//                             </Badge>
//                           </TableCell>
//                           <TableCell
//                             className={
//                               transaction.amount >= 0
//                                 ? "text-green-600 font-semibold"
//                                 : "text-red-600 font-semibold"
//                             }
//                           >
//                             {transaction.amount >= 0 ? "+" : ""}AFN
//                             {Math.abs(transaction.amount).toLocaleString()}
//                           </TableCell>
//                           <TableCell>
//                             {new Date(transaction.date).toLocaleDateString()}
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               variant={
//                                 transaction.status === "completed"
//                                   ? "default"
//                                   : transaction.status === "pending"
//                                   ? "secondary"
//                                   : "destructive"
//                               }
//                             >
//                               {transaction.status}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" className="h-8 w-8 p-0">
//                                   <MoreHorizontal className="h-4 w-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem>
//                                   <Eye className="h-4 w-4 mr-2" />
//                                   View Details
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem>
//                                   <Download className="h-4 w-4 mr-2" />
//                                   Export
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="md:hidden space-y-3">
//                   {recentTransactions.map((transaction) => (
//                     <MobileTransactionCard
//                       key={transaction.id}
//                       transaction={transaction}
//                     />
//                   ))}
//                 </div>

//                 {recentTransactions.length === 0 && (
//                   <div className="text-center py-8 text-gray-500">
//                     No transactions found for the selected date range
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Patients Tab */}
//           <TabsContent value="patients">
//             <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="p-4 md:p-6">
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                   <Users className="h-4 w-4 md:h-5 md:w-5" />
//                   Patient List
//                 </CardTitle>
//                 <CardDescription className="text-sm md:text-base">
//                   Patients registered within the selected date range
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-4 md:p-6">
//                 <PatientList patients={filteredPatients} />
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// // Stat Card Component
// function StatCard({
//   title,
//   value,
//   change,
//   icon,
//   color,
//   bgColor,
// }: StatCardProps) {
//   const isPositive = change >= 0;

//   return (
//     <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
//       <CardContent className="p-4 md:p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-xs md:text-sm font-medium text-gray-600">
//               {title}
//             </p>
//             <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
//               {title.includes("Revenue") || title.includes("Profit")
//                 ? "AFN "
//                 : ""}
//               {value.toLocaleString()}
//             </p>
//             <div
//               className={`flex items-center mt-1 md:mt-2 text-xs md:text-sm ${
//                 isPositive ? "text-green-600" : "text-red-600"
//               }`}
//             >
//               {isPositive ? (
//                 <ArrowUp className="h-3 w-3 mr-1" />
//               ) : (
//                 <ArrowDown className="h-3 w-3 mr-1" />
//               )}
//               {Math.abs(change)}% from last month
//             </div>
//           </div>
//           <div className={`p-2 md:p-3 rounded-xl ${bgColor} bg-opacity-10`}>
//             <div className={color}>{icon}</div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
