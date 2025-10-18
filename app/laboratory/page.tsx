"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Microscope,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Shield,
  Activity,
  TestTube,
  Stethoscope,
  Download,
  Upload,
  Search,
  Settings,
  Bell,
  UserCog,
  DollarSign,
  TrendingUp,
  Heart,
  Droplets,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import { gsap } from "gsap";

interface DashboardStats {
  totalTests: number;
  pendingResults: number;
  completedToday: number;
  unpaidTests: number;
  totalRevenue: number;
  todayRevenue: number;
  recentTests: any[];
}

interface LaboratoryTest {
  id: number;
  testType: string;
  testName: string;
  status: string;
  amountPaid: number;
  paymentStatus: string;
  testDate: string;
  createdAt: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
}

export default function LaboratoryDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    pendingResults: 0,
    completedToday: 0,
    unpaidTests: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    recentTests: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Check authentication and role
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as string;
      if (userRole !== "admin" && userRole !== "laboratory") {
        router.push("/");
      }
    }
  }, [user, isLoaded, router]);

  // Fetch real data
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch laboratory tests data
        const testsResponse = await fetch("/api/laboratory/tests");
        if (!testsResponse.ok) {
          throw new Error("Failed to fetch laboratory tests");
        }
        const testsData = await testsResponse.json();

        // Calculate statistics from real data
        const currentDate = new Date();
        const today = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );

        const tests: LaboratoryTest[] = testsData.tests || [];

        // Calculate test statistics
        const totalTests = tests.length;
        const pendingResults = tests.filter(
          (test) => test.status === "pending"
        ).length;

        const completedToday = tests.filter((test) => {
          const testDate = new Date(test.testDate || test.createdAt);
          return (
            test.status === "completed" &&
            testDate >= today &&
            testDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
        }).length;

        const unpaidTests = tests.filter(
          (test) =>
            test.paymentStatus === "pending" || test.paymentStatus === "partial"
        ).length;

        // Calculate revenue statistics
        const totalRevenue = tests.reduce(
          (sum: number, test: LaboratoryTest) => sum + (test.amountPaid || 0),
          0
        );

        const todayRevenue = tests
          .filter((test: LaboratoryTest) => {
            const testDate = new Date(test.testDate || test.createdAt);
            return (
              testDate >= today &&
              testDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          })
          .reduce(
            (sum: number, test: LaboratoryTest) => sum + (test.amountPaid || 0),
            0
          );

        // Get recent tests (last 5)
        const recentTests = tests
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        console.log("Dashboard Data:", {
          totalTests,
          pendingResults,
          completedToday,
          unpaidTests,
          totalRevenue,
          todayRevenue,
          recentTestsCount: recentTests.length,
        });

        setStats({
          totalTests,
          pendingResults,
          completedToday,
          unpaidTests,
          totalRevenue,
          todayRevenue,
          recentTests,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, [isLoaded, user]);

  // Initialize animations
  useEffect(() => {
    if (!isLoaded || loading) return;

    const tl = gsap.timeline();

    // Hero section animation
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Stats animation
    tl.fromTo(
      statsRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.3"
    );

    // Cards animation
    tl.fromTo(
      ".dashboard-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.2"
    );

    // Quick actions animation
    tl.fromTo(
      quickActionsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    // Floating animation for icons
    gsap.to(".floating-icon", {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [isLoaded, loading]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AF", {
      style: "currency",
      currency: "AFN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get test type icon
  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "blood":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "urine":
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case "stool":
        return <FlaskConical className="h-4 w-4 text-amber-500" />;
      case "biochemistry":
        return <Activity className="h-4 w-4 text-green-500" />;
      case "hematology":
        return <TestTube className="h-4 w-4 text-purple-500" />;
      case "microbiology":
        return <Microscope className="h-4 w-4 text-indigo-500" />;
      case "immunology":
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Laboratory Dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.publicMetadata?.role as string;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 pt-20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 floating-icon">
          <TestTube className="h-8 w-8 text-blue-200 opacity-60" />
        </div>
        <div
          className="absolute top-40 right-20 floating-icon"
          style={{ animationDelay: "1s" }}
        >
          <Microscope className="h-6 w-6 text-teal-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-40 left-20 floating-icon"
          style={{ animationDelay: "2s" }}
        >
          <Activity className="h-10 w-10 text-sky-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-20 right-10 floating-icon"
          style={{ animationDelay: "1.5s" }}
        >
          <DollarSign className="h-8 w-8 text-green-200 opacity-60" />
        </div>
      </div>

      <main className="flex-grow container mx-auto p-4 md:p-6 pt-28 relative z-10">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-8" ref={heroRef}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Laboratory Management System
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Welcome back,{" "}
                <span className="font-semibold text-blue-600">
                  {user?.firstName}
                </span>
                . Manage laboratory operations, test results, and financial
                records.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Badge
                variant={userRole === "admin" ? "destructive" : "default"}
                className="text-sm px-3 py-1"
              >
                {userRole === "admin" ? "Administrator" : "Laboratory Staff"}
              </Badge>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Overview */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
          ref={statsRef}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Tests
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.totalTests}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">All time</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TestTube className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">
                    Pending Results
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.pendingResults}
                  </p>
                  <p className="text-amber-200 text-xs mt-1">Awaiting review</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Completed Today
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.completedToday}
                  </p>
                  <p className="text-green-200 text-xs mt-1">Tests processed</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Unpaid Tests
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.unpaidTests}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    Pending payment
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-emerald-200 text-xs mt-2">
                    All-time collected amount
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">
                    Today's Revenue
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {formatCurrency(stats.todayRevenue)}
                  </p>
                  <p className="text-cyan-200 text-xs mt-2">Collected today</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          ref={cardsRef}
        >
          {/* Daily Records Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                Daily Laboratory Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Access and manage today&apos;s laboratory tests, enter results,
                and update patient records in real-time.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                >
                  <Link href="/laboratory/daily-record">
                    <FileText className="h-4 w-4 mr-2" />
                    Open Daily Records
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/tests">
                      <Search className="h-4 w-4 mr-2" />
                      Search Tests
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/patients">
                      <Users className="h-4 w-4 mr-2" />
                      Patients
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Expenses Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                Financial Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Track laboratory expenses, manage payments to doctors, and
                monitor operational costs and revenue.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/laboratory/expenses">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Manage Expenses
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/reports">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Reports
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/payments">
                      <Download className="h-4 w-4 mr-2" />
                      Payments
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Management Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserCog className="h-5 w-5" />
                </div>
                Referring Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Manage referring physician accounts, track test orders, and
                maintain professional relationships.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <Link href="/laboratory/doctors">
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Doctors
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/referrals">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Referrals
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/laboratory/commissions">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Commissions
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          ref={quickActionsRef}
        >
          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-blue-100">
                Frequently used laboratory functions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-blue-50 border-blue-200 transition-colors"
                  asChild
                >
                  <Link href="/laboratory/daily-record?action=new">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">New Test Order</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-green-50 border-green-200 transition-colors"
                  asChild
                >
                  <Link href="/laboratory/tests">
                    <Search className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Search Results</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-purple-50 border-purple-200 transition-colors"
                  asChild
                >
                  <Link href="/laboratory/expenses?action=new">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Add Expense</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-orange-50 border-orange-200 transition-colors"
                  asChild
                >
                  <Link href="/laboratory/reports">
                    <Download className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Export Reports</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5" />
                Recent Tests
              </CardTitle>
              <CardDescription className="text-purple-100">
                Latest laboratory test activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.recentTests.length > 0 ? (
                  stats.recentTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {getTestTypeIcon(test.testType)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {test.testName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {test.patient
                              ? `${test.patient.firstName} ${test.patient.lastName}`
                              : "Unknown Patient"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={getStatusVariant(test.status)}
                          className="text-xs"
                        >
                          {test.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No recent tests found
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      asChild
                    >
                      <Link href="/laboratory/daily-record">
                        Create First Test
                      </Link>
                    </Button>
                  </div>
                )}

                {stats.recentTests.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/laboratory/daily-record">
                        View All Tests
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Information */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-5 w-5" />
              Staff Information
            </CardTitle>
            <CardDescription className="text-gray-100">
              Your account details and access information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <UserCog className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Role</p>
                  <Badge
                    variant={userRole === "admin" ? "destructive" : "default"}
                    className="w-full justify-center"
                  >
                    {userRole === "admin"
                      ? "Administrator"
                      : "Laboratory Staff"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Access Level</p>
                  <Badge
                    variant="outline"
                    className="w-full justify-center bg-green-50 text-green-700 border-green-200"
                  >
                    {userRole === "admin" ? "Full Access" : "Standard Access"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Last login: {new Date().toLocaleDateString()} • Session active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Only Section */}
        {userRole === "admin" && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-xl">
                <Shield className="h-5 w-5" />
                Administrator Controls
              </CardTitle>
              <CardDescription className="text-orange-600">
                Additional management features for system administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  asChild
                >
                  <Link href="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  asChild
                >
                  <Link href="/admin/set-user-roles">
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  asChild
                >
                  <Link href="/laboratory/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
