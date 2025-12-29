// app/admin/reports/daily-guests/page.tsx

"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  FileText,
  BarChart3,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Moon,
  Sun,
  Printer,
} from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import Loader from "@/components/loader";

interface GuestData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  totalStays: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

interface DailyGuestsReport {
  date: string;
  totalGuests: number;
  activeGuests: number;
  totalSpent: number;
  totalStays: number;
  averageSpent: number;
  nationalityStats: Record<string, number>;
  guests: GuestData[];
}

export default function DailyGuestsReportPage() {
  const { theme, setTheme } = useTheme();
  const { getToken } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated fetch function
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error("No session token available");
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      return response;
    } catch (error) {
      console.error("Authenticated fetch error:", error);
      throw error;
    }
  };

  // Function to fetch report data from a separate JSON endpoint
  const fetchReportData = async (date: string): Promise<DailyGuestsReport> => {
    try {
      // Use the existing API to get guest data for the date range
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Get guests from the last 30 days to ensure we have data
      const searchStartDate = new Date(
        startDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const response = await authenticatedFetch(
        `/api/guests?startDate=${searchStartDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        // If guest API doesn't exist, create mock data with sample structure
        return {
          date,
          totalGuests: 0,
          activeGuests: 0,
          totalSpent: 0,
          totalStays: 0,
          averageSpent: 0,
          nationalityStats: {},
          guests: [],
        };
      }

      const result = await response.json();
      const guests = result.data || [];

      // Filter guests for the selected date (with some tolerance)
      const filteredGuests = guests.filter((guest: any) => {
        const guestDate = new Date(guest.createdAt);
        return guestDate >= startDate && guestDate <= endDate;
      });

      // Calculate statistics
      const totalGuests = filteredGuests.length;
      const activeGuests = filteredGuests.filter(
        (guest: any) => guest.isActive
      ).length;
      const totalSpent = filteredGuests.reduce((sum: number, guest: any) => {
        const spent = guest.totalSpent;
        if (spent && typeof spent === "object" && "toString" in spent) {
          return sum + Number(spent.toString());
        }
        return sum + (Number(spent) || 0);
      }, 0);
      const totalStays = filteredGuests.reduce(
        (sum: number, guest: any) => sum + (guest.totalStays || 0),
        0
      );
      const averageSpent = totalGuests > 0 ? totalSpent / totalGuests : 0;

      // Group by nationality
      const nationalityStats: Record<string, number> = {};
      filteredGuests.forEach((guest: any) => {
        const nationality = guest.nationality || "نامشخص";
        nationalityStats[nationality] =
          (nationalityStats[nationality] || 0) + 1;
      });

      return {
        date,
        totalGuests,
        activeGuests,
        totalSpent,
        totalStays,
        averageSpent,
        nationalityStats,
        guests: filteredGuests,
      };
    } catch (error) {
      console.error("Error fetching report data:", error);
      // Return empty data on error
      return {
        date,
        totalGuests: 0,
        activeGuests: 0,
        totalSpent: 0,
        totalStays: 0,
        averageSpent: 0,
        nationalityStats: {},
        guests: [],
      };
    }
  };

  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["daily-guests-report", selectedDate],
    queryFn: () => fetchReportData(selectedDate),
    enabled: !!selectedDate,
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAuthError(null);

    try {
      const response = await authenticatedFetch(
        `/api/reports/daily-guests?date=${selectedDate}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Excel generation failed:", response.status, errorText);
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      // Download the Excel file
      const blob = await response.blob();

      // Check if we got a valid Excel file
      if (blob.size === 0) {
        throw new Error("Generated Excel file is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `گزارش-میهمانان-${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`Excel downloaded successfully: ${blob.size} bytes`);
    } catch (error) {
      console.error("Generate report error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      let userMessage = "خطا در تولید گزارش. لطفاً دوباره تلاش کنید.";

      if (errorMessage.includes("401")) {
        userMessage = "دسترسی غیرمجاز. لطفاً دوباره وارد شوید.";
      } else if (errorMessage.includes("404")) {
        userMessage = "سرور یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.";
      } else if (errorMessage.includes("empty")) {
        userMessage =
          "داده‌ای برای تاریخ انتخاب شده یافت نشد. تاریخ دیگری را امتحان کنید.";
      }

      setAuthError(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate statistics
  const stats = reportData || {
    totalGuests: 0,
    activeGuests: 0,
    totalSpent: 0,
    totalStays: 0,
    averageSpent: 0,
    nationalityStats: {},
  };

  const nationalityData = Object.entries(stats.nationalityStats || {}).map(
    ([nationality, count]) => ({
      nationality,
      count: count as number,
      percentage:
        stats.totalGuests > 0
          ? (((count as number) / stats.totalGuests) * 100).toFixed(1)
          : 0,
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader
          title="در حال بارگذاری گزارش"
          subtitle="لطفاً چند لحظه صبر کنید"
        />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as Error).message;

    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>خطا در بارگذاری گزارش</p>
              <p className="text-sm mt-2">{errorMessage}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/api/debug/auth", "_blank")}
                >
                  اطلاعات دیباگ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 space-y-6">
      {/* Error Display */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">خطا</p>
            <p className="text-red-700 text-sm">{authError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/api/debug/auth", "_blank")}
          >
            اطلاعات دیباگ
          </Button>
        </div>
      )}

      {/* Header with Theme Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            گزارش روزانه میهمانان
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            تولید و مشاهده گزارش میهمانان روزانه
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden sm:flex"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 ml-2" />
            ) : (
              <Moon className="h-4 w-4 ml-2" />
            )}
            تغییر تم
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
            />
            بروزرسانی
          </Button>
        </div>
      </div>

      {/* Date Selection and Report Generation */}
      <Card className="border-border dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            انتخاب تاریخ و تولید گزارش
          </CardTitle>
          <CardDescription>
            تاریخ مورد نظر را انتخاب کرده و گزارش Excel تولید کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-date">تاریخ گزارش</Label>
              <Input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 ml-2" />
                )}
                {isGenerating ? "در حال تولید..." : "دانلود گزارش Excel"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">کل میهمانان</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalGuests.toLocaleString("fa-IR")}
                </p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">میهمانان فعال</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.activeGuests.toLocaleString("fa-IR")}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">مجموع هزینه‌ها</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalSpent.toLocaleString("fa-IR")} افغانی
                </p>
              </div>
              <DollarSign className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">میانگین هزینه</p>
                <p className="text-2xl font-bold mt-2">
                  {Math.round(stats.averageSpent).toLocaleString("fa-IR")}{" "}
                  افغانی
                </p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nationality Statistics */}
      {nationalityData.length > 0 && (
        <Card className="border-border dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              توزیع بر اساس ملیت
            </CardTitle>
            <CardDescription>آمار میهمانان بر اساس ملیت آنها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nationalityData.map(({ nationality, count, percentage }) => (
                <div
                  key={nationality}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{nationality}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {percentage}%
                    </Badge>
                    <span className="text-sm font-mono">
                      {(count as number).toLocaleString("fa-IR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Info Card */}
      <Card className="border-border dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            اطلاعات گزارش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  تاریخ گزارش:
                </span>
                <span className="font-medium">
                  {format(new Date(selectedDate), "yyyy/MM/dd", {
                    locale: faIR,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  ساعت تولید:
                </span>
                <span className="font-medium">
                  {format(new Date(), "HH:mm", { locale: faIR })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  مجموع اقامت‌ها:
                </span>
                <span className="font-medium">
                  {stats.totalStays.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  نوع گزارش:
                </span>
                <Badge variant="outline">Excel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">زبان:</span>
                <Badge variant="outline">فارسی</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">وضعیت:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">آماده تولید</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border dark:border-gray-800">
        <CardHeader>
          <CardTitle>عملیات سریع</CardTitle>
          <CardDescription>اقدامات سریع برای مدیریت گزارش‌ها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 ml-2" />
              پرینت صفحه
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setSelectedDate(today);
              }}
            >
              <Calendar className="h-4 w-4 ml-2" />
              انتخاب امروز
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split("T")[0]);
              }}
            >
              <Clock className="h-4 w-4 ml-2" />
              انتخاب دیروز
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
