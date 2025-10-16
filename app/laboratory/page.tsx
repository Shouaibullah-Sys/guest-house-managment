// app/laboratory/page.tsx
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
} from "lucide-react";
import { gsap } from "gsap";

interface DashboardStats {
  totalTests: number;
  pendingResults: number;
  completedToday: number;
  criticalResults: number;
}

export default function LaboratoryDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 1247,
    pendingResults: 23,
    completedToday: 48,
    criticalResults: 3,
  });

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

  // Initialize animations
  useEffect(() => {
    if (!isLoaded) return;

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
  }, [isLoaded]);

  if (!isLoaded) {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
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
          <Stethoscope className="h-8 w-8 text-green-200 opacity-60" />
        </div>
      </div>
      <main className="flex-grow container mx-auto p-4 md:p-6 relative z-10">
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
                . Manage laboratory operations, test results, and patient
                records.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge
                variant={userRole === "admin" ? "destructive" : "default"}
                className="text-sm px-3 py-1"
              >
                {userRole === "admin" ? "Administrator" : "Laboratory Staff"}
              </Badge>
            </div>
          </div>
        </section>

        {/* Statistics Overview */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
          ref={statsRef}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Tests
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.totalTests}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TestTube className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">
                    Pending Results
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.pendingResults}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Completed Today
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.completedToday}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">
                    Critical Results
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {stats.criticalResults}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Activity className="h-6 w-6" />
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
                  <Button variant="outline" className="flex-1 text-xs" asChild>
                    <Link href="/laboratory/tests">
                      <Search className="h-3 w-3 mr-1" />
                      Search Tests
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs" asChild>
                    <Link href="/laboratory/upload">
                      <Upload className="h-3 w-3 mr-1" />
                      Bulk Upload
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Management Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                Patient Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Manage patient profiles, view test history, and access
                comprehensive medical records and reports.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Patients
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    New Patient
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs">
                    <Search className="h-3 w-3 mr-1" />
                    Find Record
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
                  <Button variant="outline" className="flex-1 text-xs">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Add Doctor
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports & Analytics Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Generate comprehensive reports, view laboratory analytics, and
                track performance metrics.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Monthly
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Control Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                Quality Control
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Monitor quality assurance, equipment calibration, and compliance
                with laboratory standards.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  QC Dashboard
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    Calibration
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Compliance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings Card */}
          <Card className="dashboard-card shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-t-lg pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Configure laboratory settings, user permissions, and system
                preferences.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs">
                    <UserCog className="h-3 w-3 mr-1" />
                    Users
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Alerts
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
                  className="h-20 flex-col gap-2 bg-white hover:bg-blue-50 border-blue-200"
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">New Test Order</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-green-50 border-green-200"
                >
                  <Search className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Search Results</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-purple-50 border-purple-200"
                >
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Patient Lookup</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-white hover:bg-orange-50 border-orange-200"
                >
                  <Download className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Export Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserCog className="h-5 w-5" />
                Staff Information
              </CardTitle>
              <CardDescription className="text-purple-100">
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
                    Last login: {new Date().toLocaleDateString()} • Session
                    active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-blue-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-white/10 p-2 rounded-full">
              <Microscope className="h-5 w-5" />
            </div>
            <div className="bg-white/10 p-2 rounded-full">
              <Shield className="h-5 w-5" />
            </div>
            <div className="bg-white/10 p-2 rounded-full">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            © 2024 Laboratory Management System • Professional Grade Diagnostics
          </p>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Certified ISO 15189:2012 • HIPAA Compliant • CLIA Certified
          </p>
        </div>
      </footer>
    </div>
  );
}
