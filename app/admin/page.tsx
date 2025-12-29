// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Loader from "@/components/loader";
import {
  DollarSign,
  Users,
  Bed,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  Calendar as CalendarIcon,
  BarChart3,
  BedDouble,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingDown,
  Calculator,
  Plus,
  Home,
  Clock,
  UserCheck,
  UserX,
  Download,
  Bell,
  Settings,
  HelpCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  subDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
  differenceInDays,
} from "date-fns";

// Types for Hotel Management System
interface HotelStats {
  totalRevenue: number;
  totalBookings: number;
  totalGuests: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRooms: number;
  occupancyRate: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageRoomRate: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingBookings: number;
}

interface RoomStatus {
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
  reserved: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
  checkIns: number;
  checkOuts: number;
}

interface GuestAnalytics {
  totalGuests: number;
  newGuests: number;
  returningGuests: number;
  averageStay: number;
  guestSatisfaction: number;
}

interface RevenueAnalytics {
  totalRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  avgDailyRate: number;
  revPAR: number; // Revenue Per Available Room
  monthlyComparison: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  revenueBySource: {
    source: string;
    amount: number;
    percentage: number;
  }[];
}

interface DateRange {
  from: Date;
  to: Date;
}

// API functions for Hotel Management
const fetchHotelStats = async (dateRange?: DateRange): Promise<HotelStats> => {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append("from", dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append("to", dateRange.to.toISOString());
  }

  try {
    const response = await fetch(
      `/api/dashboard/hotel-stats?${params.toString()}`
    );
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return {
      totalRevenue: data.totalRevenue || 0,
      totalBookings: data.totalBookings || 0,
      totalGuests: data.totalGuests || 0,
      occupiedRooms: data.occupiedRooms || 0,
      availableRooms: data.availableRooms || 0,
      totalRooms: data.totalRooms || 0,
      occupancyRate: data.occupancyRate || 0,
      todayRevenue: data.todayRevenue || 0,
      monthlyRevenue: data.monthlyRevenue || 0,
      averageRoomRate: data.averageRoomRate || 0,
      checkInsToday: data.checkInsToday || 0,
      checkOutsToday: data.checkOutsToday || 0,
      pendingBookings: data.pendingBookings || 0,
    };
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    toast.error("آمار هتل بارگیری نشد", {
      description:
        error instanceof Error ? error.message : "خطای ناشناخته رخ داده است",
    });
    // Return default stats to prevent UI breaking
    return {
      totalRevenue: 0,
      totalBookings: 0,
      totalGuests: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      totalRooms: 0,
      occupancyRate: 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
      averageRoomRate: 0,
      checkInsToday: 0,
      checkOutsToday: 0,
      pendingBookings: 0,
    };
  }
};

const fetchRoomStatus = async (): Promise<RoomStatus> => {
  try {
    const response = await fetch("/api/rooms");
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch rooms data");
    }

    const rooms = result.data || [];

    const roomStatus = {
      available: rooms.filter((room: any) => room.status === "available")
        .length,
      occupied: rooms.filter((room: any) => room.status === "occupied").length,
      maintenance: rooms.filter((room: any) => room.status === "maintenance")
        .length,
      cleaning: rooms.filter((room: any) => room.status === "cleaning").length,
      reserved: rooms.filter((room: any) => room.status === "reserved").length,
    };

    return roomStatus;
  } catch (error) {
    console.error("Error fetching room status:", error);
    toast.error("وضعیت اتاق‌ها بارگیری نشد", {
      description:
        error instanceof Error ? error.message : "خطای ناشناخته رخ داده است",
    });
    return {
      available: 0,
      occupied: 0,
      maintenance: 0,
      cleaning: 0,
      reserved: 0,
    };
  }
};

const fetchBookingTrends = async (
  dateRange?: DateRange
): Promise<BookingTrend[]> => {
  const params = new URLSearchParams();

  // If no date range provided, default to last 7 days
  if (!dateRange?.from) {
    dateRange = {
      from: subDays(new Date(), 7),
      to: new Date(),
    };
  }

  if (dateRange.from) {
    params.append("from", dateRange.from.toISOString());
  }
  if (dateRange.to) {
    params.append("to", dateRange.to.toISOString());
  }

  try {
    const response = await fetch(
      `/api/dashboard/booking-trends?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch booking trends");
    return await response.json();
  } catch (error) {
    console.error("Error fetching booking trends:", error);
    return [];
  }
};

const fetchGuestAnalytics = async (
  dateRange?: DateRange
): Promise<GuestAnalytics> => {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append("from", dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append("to", dateRange.to.toISOString());
  }

  try {
    const response = await fetch(
      `/api/dashboard/guest-analytics?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch guest analytics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching guest analytics:", error);
    return {
      totalGuests: 0,
      newGuests: 0,
      returningGuests: 0,
      averageStay: 0,
      guestSatisfaction: 0,
    };
  }
};

const fetchRevenueAnalytics = async (
  dateRange?: DateRange
): Promise<RevenueAnalytics> => {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append("from", dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append("to", dateRange.to.toISOString());
  }

  try {
    const response = await fetch(
      `/api/dashboard/revenue-analytics?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch revenue analytics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return {
      totalRevenue: 0,
      roomRevenue: 0,
      serviceRevenue: 0,
      avgDailyRate: 0,
      revPAR: 0,
      monthlyComparison: {
        current: 0,
        previous: 0,
        percentageChange: 0,
      },
      revenueBySource: [],
    };
  }
};

// Date Range Picker Component
const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickFilters = [
    {
      label: "امروز",
      value: "today",
      getRange: () => ({
        from: startOfToday(),
        to: startOfToday(),
      }),
    },
    {
      label: "این هفته",
      value: "thisWeek",
      getRange: () => ({
        from: startOfWeek(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "این ماه",
      value: "thisMonth",
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: new Date(),
      }),
    },
    {
      label: "همه زمان",
      value: "lifetime",
      getRange: () => ({
        from: new Date(2020, 0, 1),
        to: new Date(),
      }),
    },
  ];

  const handleQuickFilter = (filter: (typeof quickFilters)[0]) => {
    onDateRangeChange(filter.getRange());
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[280px] lg:w-[320px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>انتخاب محدوده تاریخ</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
        <div className="flex flex-col p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(filter)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="overflow-auto">
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to });
                  setIsOpen(false);
                }
              }}
              numberOfMonths={1}
              className="rounded-md border"
            />
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs"
            >
              لغو
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs"
            >
              تایید
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Helper function to get dynamic revenue title and date range text
const getRevenueCardInfo = (dateRange: DateRange) => {
  const today = startOfToday();
  const weekStart = startOfWeek(new Date());
  const monthStart = startOfMonth(new Date());
  const lifetimeStart = new Date(2020, 0, 1);

  // Check if it's today
  if (isSameDay(dateRange.from, today) && isSameDay(dateRange.to, today)) {
    return {
      title: "درآمد امروز",
      dateText: format(today, "MMM dd, yyyy"),
    };
  }

  // Check if it's this week
  if (
    isSameDay(dateRange.from, weekStart) &&
    isSameDay(dateRange.to, today) &&
    isSameWeek(dateRange.from, dateRange.to)
  ) {
    return {
      title: "درآمد این هفته",
      dateText: "این هفته",
    };
  }

  // Check if it's this month
  if (
    isSameDay(dateRange.from, monthStart) &&
    isSameDay(dateRange.to, today) &&
    isSameMonth(dateRange.from, dateRange.to)
  ) {
    return {
      title: "درآمد این ماه",
      dateText: "این ماه",
    };
  }

  // Check if it's lifetime
  if (
    isSameDay(dateRange.from, lifetimeStart) &&
    isSameDay(dateRange.to, today)
  ) {
    return {
      title: "مجموع درآمد",
      dateText: "همه زمان",
    };
  }

  // Check if it's a custom single day
  if (isSameDay(dateRange.from, dateRange.to)) {
    return {
      title: "درآمد روزانه",
      dateText: format(dateRange.from, "MMM dd, yyyy"),
    };
  }

  // Check if it's a custom range (less than 7 days)
  const dayDifference = differenceInDays(dateRange.to, dateRange.from);
  if (dayDifference <= 7) {
    return {
      title: `درآمد ${dayDifference} روز`,
      dateText: `${format(dateRange.from, "MMM dd")} - ${format(
        dateRange.to,
        "MMM dd"
      )}`,
    };
  }

  // Default custom range
  return {
    title: "درآمد برای دوره انتخاب شده",
    dateText: `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
      dateRange.to,
      "MMM dd, yyyy"
    )}`,
  };
};

// Enhanced Chart components for Hotel Management
const BookingTrendChart = ({ data }: { data: BookingTrend[] }) => {
  const validData =
    data?.filter((item) => item && item.date && item.bookings !== undefined) ||
    [];

  if (validData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
        <p>داده‌ای برای رزروها موجود نیست</p>
        <p className="text-xs mt-1">روند رزروها در اینجا نمایش داده می‌شود</p>
      </div>
    );
  }

  const maxBookings = Math.max(...validData.map((item) => item.bookings), 1);
  const maxRevenue = Math.max(...validData.map((item) => item.revenue), 1);
  const maxValue = Math.max(maxBookings, maxRevenue);

  // Calculate dynamic bar width based on number of data points
  const barWidth = Math.max(16, Math.min(40, 400 / validData.length));

  return (
    <div className="w-full h-48 sm:h-64 flex flex-col">
      {/* Chart Container */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2 pb-8">
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0.2, 0.4, 0.6, 0.8, 1].map((line, index) => (
              <div
                key={index}
                className="border-t border-gray-200 dark:border-gray-700 w-full"
              />
            ))}
          </div>

          {validData.map((item, index) => (
            <div
              key={`${item.date}-${index}`}
              className="flex flex-col items-center flex-1 z-10"
              style={{ maxWidth: `${barWidth * 2}px` }}
            >
              {/* Bars Container */}
              <div className="flex items-end gap-0.5 sm:gap-1 w-full h-full justify-center">
                {/* Bookings Bar */}
                <div
                  className="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 min-h-0.5 relative group"
                  style={{
                    height: `${Math.max((item.bookings / maxValue) * 80, 2)}%`,
                    width: `${barWidth}px`,
                  }}
                  title={`رزروها: ${item.bookings}`}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.bookings}
                  </div>
                </div>

                {/* Revenue Bar */}
                <div
                  className="bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 min-h-0.5 relative group"
                  style={{
                    height: `${Math.max((item.revenue / maxValue) * 80, 2)}%`,
                    width: `${barWidth}px`,
                  }}
                  title={`درآمد: $${item.revenue.toLocaleString()}`}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Y-axis Labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground pl-1">
            <span>{maxValue.toLocaleString()}</span>
            <span>{(maxValue * 0.75).toLocaleString()}</span>
            <span>{(maxValue * 0.5).toLocaleString()}</span>
            <span>{(maxValue * 0.25).toLocaleString()}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Date Labels */}
      <div className="h-8 mt-2 overflow-x-auto">
        <div className="flex justify-between min-w-full px-1 sm:px-2">
          {validData.map((item, index) => (
            <div
              key={`${item.date}-label-${index}`}
              className="text-xs text-muted-foreground text-center"
              style={{ minWidth: `${barWidth * 2}px` }}
            >
              <div className="whitespace-nowrap">
                {format(new Date(item.date), "dd/MM")}
              </div>
              <div className="text-xs text-center mt-1">
                <div className="text-blue-600 font-medium">
                  {item.bookings > 0 ? item.bookings : "0"}
                </div>
                <div className="text-green-600 font-medium">
                  ${item.revenue > 0 ? item.revenue.toLocaleString() : "0"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RoomStatusChart = ({ data }: { data: RoomStatus }) => {
  const total =
    data.available +
    data.occupied +
    data.maintenance +
    data.cleaning +
    data.reserved;

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground">
        داده‌ای برای اتاق‌ها موجود نیست
      </div>
    );
  }

  const statusData = [
    { label: "موجود", value: data.available, color: "#22c55e" },
    { label: "اشغال شده", value: data.occupied, color: "#3b82f6" },
    { label: "تعمیر", value: data.maintenance, color: "#ef4444" },
    { label: "نظافت", value: data.cleaning, color: "#f59e0b" },
    { label: "رزرو شده", value: data.reserved, color: "#8b5cf6" },
  ];

  return (
    <div className="w-full h-48 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">کل اتاق‌ها</div>
          </div>
        </div>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {statusData.map((item, index) => {
            const percentage = (item.value / total) * 251.2;
            const offset = statusData
              .slice(0, index)
              .reduce((sum, prev) => sum + (prev.value / total) * 251.2, 0);

            return (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r="40"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${percentage} 251.2`}
                strokeDashoffset={-offset}
                fill="none"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-4 space-y-2 w-full px-2">
        {statusData.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs sm:text-sm"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.label}</span>
            </div>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mobile-friendly room status table
const MobileRoomStatusTable = ({ roomStatus }: { roomStatus: RoomStatus }) => {
  const statusItems = [
    {
      label: "موجود",
      value: roomStatus.available,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "اشغال شده",
      value: roomStatus.occupied,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "تعمیر",
      value: roomStatus.maintenance,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "نظافت",
      value: roomStatus.cleaning,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "رزرو شده",
      value: roomStatus.reserved,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-3 sm:hidden">
      {statusItems.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${item.bgColor.replace(
                  "bg-",
                  "bg-"
                )}`}
              ></div>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <span className={`font-bold text-lg ${item.color}`}>
              {item.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Quick Actions Component
interface QuickActionsProps {
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  reportDate: string;
  setReportDate: (date: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onGenerateReport,
  isGeneratingReport,
  reportDate,
  setReportDate,
}) => {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        اقدامات سریع
      </h3>
      <div className="space-y-4">
        {/* Report Generation Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            گزارش روزانه میهمانان (Excel)
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              max={new Date().toISOString().split("T")[0]}
            />
            <Button
              onClick={onGenerateReport}
              disabled={isGeneratingReport}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingReport ? "در حال تولید..." : "دانلود Excel"}
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-auto p-3 flex-col"
          >
            <Link href="/admin/rooms">
              <BedDouble className="h-4 w-4 mb-1" />
              <span className="text-xs">اتاق‌ها</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-auto p-3 flex-col"
          >
            <Link href="/admin/bookings">
              <CalendarIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">رزروها</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-auto p-3 flex-col"
          >
            <Link href="/admin/guests">
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">مهمانان</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-auto p-3 flex-col"
          >
            <Link href="/admin/test">
              <HelpCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">تست API</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Alert System Component
const AlertSystem = ({
  hotelStats,
}: {
  hotelStats: HotelStats | undefined;
}) => {
  if (!hotelStats) return null;

  const alerts = [];

  if (hotelStats.occupancyRate < 50) {
    alerts.push({
      type: "warning" as const,
      message: "نرخ اشغال پایین",
      description: `فقط ${hotelStats.occupancyRate}% از اتاق‌ها اشغال شده‌اند`,
      icon: AlertTriangle,
    });
  }

  if (hotelStats.occupiedRooms > hotelStats.totalRooms * 0.9) {
    alerts.push({
      type: "info" as const,
      message: "اشغال بالا",
      description: `${hotelStats.occupancyRate}% اشغال - نزدیک به ظرفیت`,
      icon: Bell,
    });
  }

  if (hotelStats.checkInsToday > 5) {
    alerts.push({
      type: "info" as const,
      message: "روز شلوغ ورود",
      description: `${hotelStats.checkInsToday} ورود مهمان برنامه‌ریزی شده`,
      icon: UserCheck,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4" />
        هشدارهای سیستم
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded bg-blue-50 dark:bg-blue-950/30"
            >
              <Icon className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default function HotelAdminDashboard() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Get dynamic revenue card info based on date range
  const revenueCardInfo = getRevenueCardInfo(dateRange);

  // Queries with date range
  const {
    data: hotelStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["hotel-stats", dateRange],
    queryFn: () => fetchHotelStats(dateRange),
    refetchInterval: 30000,
  });

  const {
    data: roomStatus,
    isLoading: roomStatusLoading,
    refetch: refetchRoomStatus,
  } = useQuery({
    queryKey: ["room-status"],
    queryFn: fetchRoomStatus,
  });

  const {
    data: bookingTrends,
    isLoading: trendLoading,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ["booking-trends", dateRange],
    queryFn: () => fetchBookingTrends(dateRange),
  });

  const {
    data: guestAnalytics,
    isLoading: guestLoading,
    refetch: refetchGuests,
  } = useQuery({
    queryKey: ["guest-analytics", dateRange],
    queryFn: () => fetchGuestAnalytics(dateRange),
  });

  const {
    data: revenueAnalytics,
    isLoading: revenueLoading,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["revenue-analytics", dateRange],
    queryFn: () => fetchRevenueAnalytics(dateRange),
  });

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchRoomStatus(),
        refetchTrends(),
        refetchGuests(),
        refetchRevenue(),
      ]);
      setLastUpdated(new Date());
      toast.success("داده‌های داشبورد با موفقیت تازه شد", {
        description: `به‌روز شده در ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("تازه‌سازی داده‌های داشبورد ناموفق بود", {
        description: "لطفاً اتصال خود را بررسی کرده و دوباره امتحان کنید",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchRoomStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStats, refetchRoomStatus]);

  // Real-time notifications
  useEffect(() => {
    if (!hotelStats) return;

    // Check for low occupancy rate
    if (hotelStats.occupancyRate < 50) {
      toast.warning("هشدار اشغال پایین", {
        description: `نرخ اشغال ${hotelStats.occupancyRate}% است - زیر آستانه هدف`,
        duration: 5000,
      });
    }

    // Check for high occupancy rate
    if (hotelStats.occupancyRate > 90) {
      toast.success("هشدار اشغال بالا", {
        description: `نرخ اشغال ${hotelStats.occupancyRate}% است - عملکرد عالی!`,
        duration: 5000,
      });
    }

    // Check for many check-ins today
    if (hotelStats.checkInsToday > 10) {
      toast.info("روز شلوغ ورود", {
        description: `${hotelStats.checkInsToday} ورود مهمان برای امروز برنامه‌ریزی شده`,
        duration: 4000,
      });
    }
  }, [hotelStats]);

  // Export functionality
  const exportDashboardData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      hotelStats,
      roomStatus,
      bookingTrends,
      guestAnalytics,
      revenueAnalytics,
      dateRange,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-export-${format(
      new Date(),
      "yyyy-MM-dd-HH-mm"
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("داده‌های داشبورد با موفقیت صادر شد", {
      description: "فایل JSON در دستگاه شما دانلود شد",
    });
  };

  // Generate Daily Guest Report PDF
  const generateGuestReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch(
        `/api/reports/daily-guests?date=${reportDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `گزارش-میهمانان-${reportDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("گزارش میهمانان با موفقیت تولید شد", {
        description: "فایل Excel در دستگاه شما دانلود شد",
      });
    } catch (error) {
      console.error("Error generating guest report:", error);
      toast.error("خطا در تولید گزارش", {
        description: "لطفاً دوباره تلاش کنید",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Calculate occupancy rate
  const occupancyRate = hotelStats?.totalRooms
    ? ((hotelStats.occupiedRooms / hotelStats.totalRooms) * 100).toFixed(1)
    : "0";

  // Calculate filtered revenue based on selected date range
  const calculateFilteredRevenue = () => {
    if (!bookingTrends || bookingTrends.length === 0) return 0;
    return bookingTrends.reduce(
      (total, item) => total + (item.revenue || 0),
      0
    );
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader
            title="در حال بارگیری داشبورد هتل..."
            subtitle="لطفاً منتظر بمانید"
            size="md"
          />
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">
            خطا در بارگیری داشبورد
          </h2>
          <p className="text-muted-foreground mb-4">
            بارگیری داده‌های داشبورد هتل ناموفق بود
          </p>
          <Button onClick={refreshAll} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            دوباره امتحان کنید
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-3 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            داشبورد مدیریت هتل
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            نمای کامل عملیات هتل شما
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground shrink-0">
            <div
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            {autoRefresh ? "Automatic Refresh" : "manual"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="hidden sm:flex items-center gap-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            خودکار
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportDashboardData}
            className="hidden sm:flex items-center gap-2"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">خروجی</span>
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground shrink-0">
            {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 shrink-0"
          >
            {isRefreshing ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">تازه‌سازی</span>
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              statsError ? "bg-red-500" : "bg-green-500"
            }`}
          ></div>
          <span>وضعیت داده: {statsError ? "خطا" : "متصل"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              autoRefresh ? "bg-blue-500 animate-pulse" : "bg-gray-400"
            }`}
          ></div>
          <span>تازه‌سازی خودکار: {autoRefresh ? "فعال" : "غیرفعال"}</span>
        </div>
        {hotelStats && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>آخرین همگام‌سازی: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium text-sm sm:text-base">فیلتر تاریخ</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              نتایج را بر اساس محدوده تاریخ فیلتر کنید (پیش‌فرض ماه جاری را نشان
              می‌دهد)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportDashboardData}
            className="hidden sm:flex items-center gap-2"
          >
            <Download className="h-3 w-3" />
            خروجی داده
          </Button>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              مجموع درآمد
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ${hotelStats?.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +${hotelStats?.monthlyRevenue?.toLocaleString() || 0} این ماه
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              درصد رزروها
            </CardTitle>
            <Bed className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {hotelStats?.occupiedRooms || 0} از {hotelStats?.totalRooms || 0}{" "}
              اتاق
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              کل رزروها
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {hotelStats?.totalBookings?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hotelStats?.pendingBookings || 0} در انتظار
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              ورودهای امروز
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {hotelStats?.checkInsToday?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hotelStats?.checkOutsToday || 0} خروج
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              اتاق‌های موجود
            </CardTitle>
            <Home className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-amber-600">
              {hotelStats?.availableRooms?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">آماده برای رزرو</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            نمای کلی
          </TabsTrigger>
          <TabsTrigger
            value="rooms"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <BedDouble className="h-3 w-3 sm:h-4 sm:w-4" />
            اتاق‌ها
          </TabsTrigger>
          <TabsTrigger
            value="guests"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            مهمانان
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            عابد
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Booking Trend Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  روند رزروها
                  {dateRange.from && dateRange.to && (
                    <span className="text-xs text-muted-foreground">
                      ({format(dateRange.from, "MMM dd")} -{" "}
                      {format(dateRange.to, "MMM dd")})
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  روند روزانه رزروها و درآمد
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {trendLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                    <Loader
                      title="در حال بارگیری روند رزروها..."
                      subtitle="لطفاً منتظر بمانید"
                      size="sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      در حال دریافت آخرین داده‌های رزرو
                    </p>
                  </div>
                ) : bookingTrends && bookingTrends.length > 0 ? (
                  <>
                    <BookingTrendChart data={bookingTrends} />
                    <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        رزروها
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        درآمد
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                    <p>داده‌ای برای رزروها موجود نیست</p>
                    <p className="text-xs mt-1">
                      روند رزروها در اینجا نمایش داده می‌شود
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchTrends()}
                      className="mt-2"
                    >
                      دوباره امتحان کنید
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Room Status Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Bed className="h-4 w-4 sm:h-5 sm:w-5" />
                  وضعیت اتاق
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  وضعیت اشغال فعلی اتاق
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {roomStatusLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader
                      title="در حال بارگیری وضعیت اتاق..."
                      subtitle="لطفاً منتظر بمانید"
                      size="sm"
                    />
                  </div>
                ) : roomStatus ? (
                  <RoomStatusChart data={roomStatus} />
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    داده‌ای برای اتاق‌ها موجود نیست
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {revenueCardInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  ${calculateFilteredRevenue().toLocaleString() || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {revenueCardInfo.dateText}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  میانگین کرایه اتاق‌ها روزانه
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  ${hotelStats?.averageRoomRate?.toLocaleString() || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  به ازای هر اتاق پر شده
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  کل مهمانان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {guestAnalytics?.totalGuests?.toLocaleString() || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  مهمانان ثبت‌نام شده
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  RevPAR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  ${revenueAnalytics?.revPAR?.toLocaleString() || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calculator className="h-3 w-3 mr-1" />
                  درآمد به ازای هر اتاق موجود
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  میانگین اقامت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-amber-600">
                  {guestAnalytics?.averageStay?.toFixed(1) || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  روز به ازای هر مهمان
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <BedDouble className="h-4 w-4 sm:h-5 sm:w-5" />
                  مدیریت اتاق
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  وضعیت و مدیریت جامع اتاق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    کل اتاق‌ها
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {hotelStats?.totalRooms || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    اتاق‌های اشغال شده
                  </span>
                  <span className="font-medium text-sm sm:text-base text-blue-600">
                    {hotelStats?.occupiedRooms || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    اتاق‌های موجود
                  </span>
                  <span className="font-medium text-sm sm:text-base text-green-600">
                    {hotelStats?.availableRooms || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    درصد اتاق های پر
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {occupancyRate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  تجزیه وضعیت اتاق
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  توزیع جزئیات وضعیت اتاق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomStatus && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        موجود
                      </span>
                      <span className="font-medium text-sm sm:text-base text-green-600">
                        {roomStatus.available}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        اتاق های پر شده
                      </span>
                      <span className="font-medium text-sm sm:text-base text-blue-600">
                        {roomStatus.occupied}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        در حال تعمیر
                      </span>
                      <span className="font-medium text-sm sm:text-base text-red-600">
                        {roomStatus.maintenance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        در حال نظافت
                      </span>
                      <span className="font-medium text-sm sm:text-base text-amber-600">
                        {roomStatus.cleaning}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        رزرو شده
                      </span>
                      <span className="font-medium text-sm sm:text-base text-purple-600">
                        {roomStatus.reserved}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">
                اقدامات مدیریت اتاق
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                دسترسی سریع به ویژگی‌های مدیریت اتاق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/rooms">
                    <BedDouble className="h-6 w-6 text-primary" />
                    <span className="text-sm">مدیریت اتاق‌ها</span>
                    <span className="text-xs text-muted-foreground">
                      مشاهده و تغییرات در اتاق‌ها
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/bookings">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                    <span className="text-sm">مشاهده رزروها</span>
                    <span className="text-xs text-muted-foreground">
                      تمام رزروها
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/bookings">
                    <Plus className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">رزرو جدید</span>
                    <span className="text-xs text-muted-foreground">
                      ایجاد رزرو
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  تحلیلات مهمان
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  بینش و آمار جامع مهمان
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    تمام مهمانان
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {guestAnalytics?.totalGuests?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    مهمانان جدید
                  </span>
                  <span className="font-medium text-sm sm:text-base text-green-600">
                    {guestAnalytics?.newGuests?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    مهمانان بازگشتی
                  </span>
                  <span className="font-medium text-sm sm:text-base text-blue-600">
                    {guestAnalytics?.returningGuests?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    میانگین اقامت
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {guestAnalytics?.averageStay?.toFixed(1) || 0} روز
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  رضایت مهمان
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  معیارهای بازخورد و رضایت مهمان
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    امتیاز رضایت
                  </span>
                  <span className="font-medium text-sm sm:text-base text-green-600">
                    {guestAnalytics?.guestSatisfaction?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    کل رزروها
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {hotelStats?.totalBookings?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ورودهای امروز
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {hotelStats?.checkInsToday?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    خروج‌های امروز
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {hotelStats?.checkOutsToday?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">
                اقدامات مدیریت مهمان
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                دسترسی سریع به ویژگی‌های مدیریت مهمان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/guests">
                    <Users className="h-6 w-6 text-primary" />
                    <span className="text-sm">مدیریت مهمانان</span>
                    <span className="text-xs text-muted-foreground">
                      مشاهده پروفایل مهمانان
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/bookings">
                    <UserCheck className="h-6 w-6 text-green-600" />
                    <span className="text-sm">ورودها</span>
                    <span className="text-xs text-muted-foreground">
                      ورودی‌های امروز
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/bookings">
                    <UserX className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">خروج‌ها</span>
                    <span className="text-xs text-muted-foreground">
                      خروجی‌های امروز
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  نمای درآمد
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  شاخص‌های کلیدی درآمد و عملکرد
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    مجموع عواید
                  </span>
                  <span className="font-medium text-sm sm:text-base text-green-600">
                    ${revenueAnalytics?.totalRevenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    درآمد اتاق
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ${revenueAnalytics?.roomRevenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    درآمد خدمات
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ${revenueAnalytics?.serviceRevenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    میانگین نرخ روزانه
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ${revenueAnalytics?.avgDailyRate?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  مقایسه ماهانه
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  تغییرات درآمد نسبت به ماه گذشته
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    این ماه
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    $
                    {revenueAnalytics?.monthlyComparison?.current?.toLocaleString() ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ماه گذشته
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    $
                    {revenueAnalytics?.monthlyComparison?.previous?.toLocaleString() ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    تغییر
                  </span>
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      (revenueAnalytics?.monthlyComparison?.percentageChange ||
                        0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {revenueAnalytics?.monthlyComparison?.percentageChange?.toFixed(
                      1
                    ) || 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    RevPAR
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ${revenueAnalytics?.revPAR?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">
                اقدامات مدیریت درآمد
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                دسترسی سریع به ویژگی‌های مدیریت درآمد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/payments">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span className="text-sm">پرداخت‌ها</span>
                    <span className="text-xs text-muted-foreground">
                      مشاهده تراکنش‌ها
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/bookings">
                    <Calculator className="h-6 w-6 text-green-600" />
                    <span className="text-sm">صورت‌حساب‌ها</span>
                    <span className="text-xs text-muted-foreground">
                      ایجاد صورت‌حساب
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <Link href="/admin/payments">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">گزارش‌ها</span>
                    <span className="text-xs text-muted-foreground">
                      تحلیلات درآمد
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions and Alerts Section */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <QuickActions
            onGenerateReport={generateGuestReport}
            isGeneratingReport={isGeneratingReport}
            reportDate={reportDate}
            setReportDate={setReportDate}
          />
          <AlertSystem hotelStats={hotelStats} />
        </div>

        {/* Mobile Room Status Table */}
        {roomStatus && <MobileRoomStatusTable roomStatus={roomStatus} />}
      </Tabs>
    </div>
  );
}
