// app/admin/bookings/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  User,
  Building,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Printer,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Moon,
  Sun,
  Settings,
  RefreshCw,
  AlertTriangle,
  Shield,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Users,
  Bed,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import { CreateBookingDialog } from "@/components/booking/create-booking-dialog";
import { EditBookingDialog } from "@/components/booking/edit-booking-dialog";
import { CheckInDialog } from "@/components/booking/checkin-dialog";
import { CheckOutDialog } from "@/components/booking/checkout-dialog";
import { PaymentDialog } from "@/components/booking/payment-dialog";

interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestId: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  adults: number;
  children: number;
  infants: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  paymentStatus: string;
  specialRequests: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

interface BookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    totalBookings: number;
    confirmedBookings: number;
    checkedInBookings: number;
    revenue: number;
    avgBookingValue: number;
  };
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for search with debounce
function useSearchFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Debounce search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Debounce other filters (200ms delay)
  const debouncedStatusFilter = useDebounce(statusFilter, 200);
  const debouncedPaymentFilter = useDebounce(paymentFilter, 200);
  const debouncedDateFilter = useDebounce(dateFilter, 200);

  // Track if user is currently typing
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    dateFilter,
    setDateFilter,
    debouncedSearchTerm,
    debouncedStatusFilter,
    debouncedPaymentFilter,
    debouncedDateFilter,
    isTyping,
    resetFilters,
  };
}

// Main component that handles all the logic
function AdminBookingsContent() {
  const { theme, setTheme } = useTheme();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Use the custom search filters hook
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    dateFilter,
    setDateFilter,
    debouncedSearchTerm,
    debouncedStatusFilter,
    debouncedPaymentFilter,
    debouncedDateFilter,
    isTyping,
    resetFilters,
  } = useSearchFilters();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [preSelectedGuest, setPreSelectedGuest] = useState<any>(null);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Track if we're fetching data
  const [isFetchingData, setIsFetchingData] = useState(false);

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

  // Handle search params with proper Suspense
  useEffect(() => {
    const guestId = searchParams.get("guestId");
    const autoOpen = searchParams.get("autoOpen") === "true";

    if (autoOpen && guestId) {
      const handleAutoOpen = async () => {
        try {
          const token = await getToken();
          if (token) {
            const response = await fetch(`/api/guests/${guestId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const guestData = await response.json();
              setPreSelectedGuest(guestData.data);
              setCreateDialogOpen(true);
            }
          }
        } catch (error) {
          console.error("Error fetching guest for auto-open:", error);
        }
      };

      handleAutoOpen();
    }
  }, [searchParams, getToken]);

  // Fetch bookings function with minimum search length
  const fetchBookings = async (): Promise<BookingsResponse> => {
    setIsFetchingData(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        // Only send search if it's at least 2 characters or empty
        ...(debouncedSearchTerm &&
          debouncedSearchTerm.length >= 2 && { search: debouncedSearchTerm }),
        ...(debouncedStatusFilter &&
          debouncedStatusFilter !== "all" && { status: debouncedStatusFilter }),
        ...(debouncedPaymentFilter &&
          debouncedPaymentFilter !== "all" && {
            paymentStatus: debouncedPaymentFilter,
          }),
        ...(debouncedDateFilter &&
          debouncedDateFilter !== "all" && { dateRange: debouncedDateFilter }),
      });

      const response = await authenticatedFetch(`/api/bookings?${params}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    } finally {
      setIsFetchingData(false);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "bookings",
      page,
      limit,
      debouncedSearchTerm,
      debouncedStatusFilter,
      debouncedPaymentFilter,
      debouncedDateFilter,
    ],
    queryFn: fetchBookings,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes("Authentication")) {
        return false;
      }
      return failureCount < 3;
    },
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Stale time to prevent unnecessary refetches
    staleTime: 1000 * 60, // 1 minute
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await authenticatedFetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Delete booking error:", error);
      setAuthError("Failed to delete booking. Please try again.");
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await authenticatedFetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      console.error("Update booking status error:", error);
      setAuthError("Failed to update booking status. Please try again.");
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await authenticatedFetch(`/api/bookings/export`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      setAuthError("Failed to export bookings. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  };

  // Reset page when filters change (except pagination)
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearchTerm,
    debouncedStatusFilter,
    debouncedPaymentFilter,
    debouncedDateFilter,
  ]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingNumber",
      header: "شماره رزرو",
      cell: ({ row }) => (
        <div className="font-mono font-medium text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-primary" /> #
            {row.original.bookingNumber}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {format(new Date(row.original.createdAt), "yyyy/MM/dd")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "guestName",
      header: "میهمان",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="truncate max-w-[120px]">
              {row.original.guestName}
            </div>
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
            {row.original.guestPhone || "بدون شماره"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "roomInfo",
      header: "اتاق",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.roomNumber}</span>
            <Badge variant="outline" className="text-xs">
              {row.original.roomType}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.totalNights} شب
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dates",
      header: "تاریخ ها",
      cell: ({ row }) => (
        <div className="space-y-1 min-w-[120px]">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(new Date(row.original.checkInDate), "MM/dd")}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(new Date(row.original.checkOutDate), "MM/dd")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "مبلغ",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">
            {row.original.totalAmount.toLocaleString()} افغانی
          </div>
          <div className="text-xs">
            <span className="text-green-600">
              {row.original.paidAmount.toLocaleString()}
            </span>
            {" / "}
            <span className="text-amber-600">
              {row.original.outstandingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => {
        const getStatusBadge = (status: string) => {
          const statusConfig = {
            pending: {
              bg: "bg-amber-500",
              text: "در انتظار",
              icon: Clock,
            },
            confirmed: {
              bg: "bg-green-600",
              text: "تایید شده",
              icon: CheckCircle,
            },
            checked_in: {
              bg: "bg-blue-600",
              text: "چک این شده",
              icon: User,
            },
            checked_out: {
              bg: "bg-gray-600",
              text: "چک اوت شده",
              icon: CalendarDays,
            },
            cancelled: {
              bg: "bg-red-600",
              text: "لغو شده",
              icon: XCircle,
            },
            no_show: {
              bg: "bg-gray-400",
              text: "عدم حضور",
              icon: AlertTriangle,
            },
          };

          const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;
          const Icon = config.icon;

          return (
            <Badge className={`${config.bg} text-white hover:${config.bg}`}>
              <Icon className="h-3 w-3 ml-1" />
              {config.text}
            </Badge>
          );
        };
        return getStatusBadge(row.original.status);
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "پرداخت",
      cell: ({ row }) => {
        const getPaymentBadge = (status: string) => {
          const paymentConfig = {
            pending: {
              variant: "outline" as const,
              className: "border-red-300 text-red-600",
              text: "پرداخت نشده",
              icon: Clock,
            },
            paid: {
              variant: "default" as const,
              className: "bg-green-600 text-white",
              text: "پرداخت شده",
              icon: CheckCircle,
            },
            partial: {
              variant: "outline" as const,
              className: "border-amber-300 text-amber-600",
              text: "جزئی",
              icon: DollarSign,
            },
            failed: {
              variant: "destructive" as const,
              className: "",
              text: "ناموفق",
              icon: XCircle,
            },
          };

          const config =
            paymentConfig[status as keyof typeof paymentConfig] ||
            paymentConfig.pending;
          const Icon = config.icon;

          return (
            <Badge variant={config.variant} className={config.className}>
              <Icon className="h-3 w-3 ml-1" />
              {config.text}
            </Badge>
          );
        };
        return getPaymentBadge(row.original.paymentStatus);
      },
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>عملیات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBooking(booking);
                  setViewDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4 ml-2" />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBooking(booking);
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 ml-2" />
                ویرایش رزرو
              </DropdownMenuItem>

              {booking.status === "confirmed" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBooking(booking);
                    setCheckinDialogOpen(true);
                  }}
                >
                  <CheckSquare className="h-4 w-4 ml-2" />
                  چک این
                </DropdownMenuItem>
              )}

              {booking.status === "checked_in" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBooking(booking);
                    setCheckoutDialogOpen(true);
                  }}
                >
                  <XSquare className="h-4 w-4 ml-2" />
                  چک اوت
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => {
                  setSelectedBooking(booking);
                  setPaymentDialogOpen(true);
                }}
              >
                <CreditCard className="h-4 w-4 ml-2" />
                ثبت پرداخت
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBooking(booking);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف رزرو
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    pageCount: data?.pagination.totalPages || 0,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader
          title="در حال بارگذاری رزروها"
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
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <p>خطا در بارگذاری رزروها</p>
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
    <>
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
              onClick={() => setAuthError(null)}
            >
              بستن
            </Button>
          </div>
        )}

        {/* Header with Theme Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              مدیریت رزروها
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              مشاهده، ویرایش و مدیریت رزروهای مهمانسرا
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isFetchingData}
            >
              <RefreshCw
                className={`h-4 w-4 ml-2 ${
                  isRefreshing || isFetchingData ? "animate-spin" : ""
                }`}
              />
              {isRefreshing || isFetchingData
                ? "در حال بروزرسانی"
                : "بروزرسانی"}
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              رزرو جدید
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">کل رزروها</p>
                  <p className="text-2xl font-bold mt-2">
                    {data?.stats?.totalBookings || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">تایید شده</p>
                  <p className="text-2xl font-bold mt-2">
                    {data?.stats?.confirmedBookings || 0}
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
                  <p className="text-sm opacity-90">میهمانان فعلی</p>
                  <p className="text-2xl font-bold mt-2">
                    {data?.stats?.checkedInBookings || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">درآمد کل</p>
                  <p className="text-2xl font-bold mt-2">
                    {(data?.stats?.revenue || 0).toLocaleString()} افغانی
                  </p>
                </div>
                <DollarSign className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="border-border dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  {isTyping || isFetchingData ? (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    placeholder="جستجو بر اساس شماره رزرو، نام میهمان یا شماره اتاق..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 text-sm sm:text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {isTyping && (
                  <p className="text-xs text-muted-foreground mt-1">
                    در حال تایپ... (جستجو پس از توقف خودکار انجام می‌شود)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <Filter className="ml-2 h-4 w-4" />
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="confirmed">تایید شده</SelectItem>
                    <SelectItem value="checked_in">چک این شده</SelectItem>
                    <SelectItem value="checked_out">چک اوت شده</SelectItem>
                    <SelectItem value="cancelled">لغو شده</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <CreditCard className="ml-2 h-4 w-4" />
                    <SelectValue placeholder="پرداخت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه پرداخت‌ها</SelectItem>
                    <SelectItem value="paid">پرداخت شده</SelectItem>
                    <SelectItem value="pending">پرداخت نشده</SelectItem>
                    <SelectItem value="partial">جزئی</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <Calendar className="ml-2 h-4 w-4" />
                    <SelectValue placeholder="تاریخ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه تاریخ‌ها</SelectItem>
                    <SelectItem value="today">امروز</SelectItem>
                    <SelectItem value="tomorrow">فردا</SelectItem>
                    <SelectItem value="this_week">این هفته</SelectItem>
                    <SelectItem value="next_week">هفته آینده</SelectItem>
                    <SelectItem value="this_month">این ماه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-10"
              >
                پاک کردن فیلترها
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table Card */}
        <Card className="border-border dark:border-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>لیست رزروها</CardTitle>
                <CardDescription>
                  {data?.pagination.total || 0} رزرو پیدا شد
                  {isFetchingData && " (در حال بارگذاری...)"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 ml-2" />
                  {isExporting ? "در حال خروجی..." : "خروجی CSV"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 ml-2" />
                  پرینت
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[800px] lg:min-w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
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
                        {debouncedSearchTerm.length > 0 ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <p>
                              هیچ نتیجه‌ای برای "{debouncedSearchTerm}" یافت نشد
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                            >
                              پاک کردن جستجو
                            </Button>
                          </div>
                        ) : (
                          "هیچ رزروی یافت نشد."
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1 || isFetchingData}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isFetchingData}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  صفحه {page} از {data?.pagination.totalPages || 1}
                  {isFetchingData && " (در حال بارگذاری...)"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={
                    page === (data?.pagination.totalPages || 1) ||
                    isFetchingData
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(data?.pagination.totalPages || 1)}
                  disabled={
                    page === (data?.pagination.totalPages || 1) ||
                    isFetchingData
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  تعداد در صفحه:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
                  }}
                  disabled={isFetchingData}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateBookingDialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setPreSelectedGuest(null);
            }
          }}
          onBookingCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
          }}
          onNavigateToSales={(guestName, bookingId) => {
            const params = new URLSearchParams({
              autoSelect: "true",
              guestName: guestName,
              bookingId: bookingId,
            });
            window.location.href = `/admin/sales?${params.toString()}`;
          }}
          preSelectedGuest={preSelectedGuest}
        />

        <EditBookingDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          booking={selectedBooking}
          onBookingUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
          }}
        />

        {selectedBooking && (
          <>
            <CheckInDialog
              open={checkinDialogOpen}
              onOpenChange={setCheckinDialogOpen}
              booking={selectedBooking}
              onCheckInSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["bookings"] });
              }}
            />

            <CheckOutDialog
              open={checkoutDialogOpen}
              onOpenChange={setCheckoutDialogOpen}
              booking={selectedBooking}
              onCheckOutSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["bookings"] });
              }}
            />

            <PaymentDialog
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
              booking={selectedBooking}
              onPaymentSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["bookings"] });
              }}
            />

            {/* View Booking Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    جزئیات رزرو #{selectedBooking.bookingNumber}
                  </DialogTitle>
                  <DialogDescription>
                    اطلاعات کامل رزرو و میهمان
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* ... view dialog content remains the same ... */}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    بستن
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      setEditDialogOpen(true);
                    }}
                  >
                    ویرایش رزرو
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تایید حذف رزرو</DialogTitle>
                  <DialogDescription>
                    آیا از حذف رزرو #{selectedBooking.bookingNumber} اطمینان
                    دارید؟ این عمل غیرقابل بازگشت است.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteBookingMutation.isPending}
                  >
                    انصراف
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedBooking) {
                        deleteBookingMutation.mutate(selectedBooking.id);
                      }
                    }}
                    disabled={deleteBookingMutation.isPending}
                  >
                    {deleteBookingMutation.isPending
                      ? "در حال حذف..."
                      : "حذف رزرو"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
}

// Main export with Suspense wrapper
export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader title="در حال بارگذاری" subtitle="لطفاً چند لحظه صبر کنید" />
        </div>
      }
    >
      <AdminBookingsContent />
    </Suspense>
  );
}
