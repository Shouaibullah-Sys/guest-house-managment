// app/admin/guests/page.tsx - Fixed Version with Focus Retention
"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Users,
  Phone,
  Mail,
  Eye,
  Edit,
  Filter,
  Search,
  Plus,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Loader from "@/components/loader";
import { CreateGuestDialog } from "@/components/guests/create-guest-dialog";
import { EditGuestDialog } from "@/components/guests/edit-guest-dialog";
import { GuestListItem } from "@/lib/validation/guest";
import { useSearchParams } from "next/navigation";

// Custom debounce hook - IMPROVED VERSION
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

// Main component
function AdminGuestsContent() {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  // Debounce status filter (200ms delay)
  const debouncedStatusFilter = useDebounce(statusFilter, 800);

  // Track if user is currently typing
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    // Focus on search input after reset
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch guests function - FIXED: No unnecessary state changes during fetch
  const fetchGuestsData = async (): Promise<GuestListItem[]> => {
    try {
      const params = new URLSearchParams();

      // Only send search if it's at least 2 characters or empty
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
        params.set("search", debouncedSearchTerm);
      }

      // Add status filter if not "all"
      if (debouncedStatusFilter !== "all") {
        params.set(
          "status",
          debouncedStatusFilter === "active" ? "true" : "false"
        );
      }

      const response = await fetch(`/api/guests?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch guests: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch guests");
      throw err;
    }
  };

  const {
    data: guests,
    isLoading,
    error: queryError,
    refetch,
    isFetching, // Use built-in isFetching instead of custom state
  } = useQuery({
    queryKey: ["guests", debouncedSearchTerm, debouncedStatusFilter],
    queryFn: fetchGuestsData,
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
    placeholderData: (previousData) => previousData,
    // Keep focus by preventing unnecessary refetches
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleGuestCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["guests"] });
    setIsCreateDialogOpen(false);
  };

  const handleGuestUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["guests"] });
    setIsEditDialogOpen(false);
  };

  // Handle search input change with focus retention
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search with focus retention
  const handleClearSearch = () => {
    setSearchTerm("");
    // Focus back on input after clearing
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  if (isLoading && !guests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader
          title="در حال بارگذاری میهمانان"
          subtitle="لطفاً چند لحظه صبر کنید"
        />
      </div>
    );
  }

  if (error || queryError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>خطا در بارگذاری میهمانان</p>
              <p className="text-sm mt-2">
                {error || (queryError as Error)?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">خطا</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            بستن
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مدیریت میهمانان</h1>
          <p className="text-muted-foreground mt-2">
            مشاهده و مدیریت اطلاعات میهمانان
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          میهمان جدید
        </Button>
      </div>

      {/* Filters Card - FIXED: Input won't lose focus */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                {/* Show loading spinner when typing or fetching */}
                {isTyping || isFetching ? (
                  <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  ref={searchInputRef} // Add ref to maintain focus
                  placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
                  value={searchTerm}
                  onChange={handleSearchChange} // Use controlled handler
                  className="pl-10 pr-10"
                  disabled={isFetching}
                />
                {/* Clear search button - FIXED: Uses handleClearSearch */}
                {searchTerm && (
                  <button
                    type="button" // Important: specify button type
                    onClick={handleClearSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Typing indicator */}
              {isTyping && (
                <p className="text-xs text-muted-foreground mt-1">
                  در حال تایپ... (جستجو پس از توقف خودکار انجام می‌شود)
                </p>
              )}
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={isFetching}
            >
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset filters button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-10"
              disabled={isFetching}
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>لیست میهمانان</CardTitle>
          <CardDescription>
            {/* Show loading indicator */}
            {guests?.length || 0} میهمان پیدا شد
            {isFetching && " (در حال بارگذاری...)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام میهمان</TableHead>
                  <TableHead>اطلاعات تماس</TableHead>
                  <TableHead>ملیت</TableHead>
                  <TableHead>تعداد اقامت</TableHead>
                  <TableHead>مجموع هزینه</TableHead>
                  <TableHead>امتیاز وفاداری</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests && guests.length > 0 ? (
                  guests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="font-medium">{guest.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">
                              {guest.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{guest.nationality}</TableCell>
                      <TableCell className="text-center">
                        {guest.totalStays}
                      </TableCell>
                      <TableCell className="font-medium">
                        {guest.totalSpent.toLocaleString("fa-IR")} افغانی
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="border-green-600 text-green-600"
                        >
                          {guest.loyaltyPoints} امتیاز
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guest.isActive ? (
                          <Badge className="bg-green-600">فعال</Badge>
                        ) : (
                          <Badge variant="outline">غیرفعال</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGuest(guest);
                              setIsViewDialogOpen(true);
                            }}
                            disabled={isFetching}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGuest(guest);
                              setIsEditDialogOpen(true);
                            }}
                            disabled={isFetching}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {/* No results message */}
                      {debouncedSearchTerm && debouncedSearchTerm.length > 0 ? (
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            میهمانی با مشخصات جستجو شده یافت نشد
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSearch}
                          >
                            پاک کردن جستجو
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            هیچ میهمانی یافت نشد
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateGuestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGuestCreated={handleGuestCreated}
        navigateToBookingAfterCreate={true}
      />

      {selectedGuest && (
        <>
          <EditGuestDialog
            guest={selectedGuest}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onGuestUpdated={handleGuestUpdated}
          />

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>جزئیات میهمان</DialogTitle>
              </DialogHeader>
              {selectedGuest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        نام کامل
                      </div>
                      <div className="p-2 border rounded">
                        {selectedGuest.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">ایمیل</div>
                      <div className="p-2 border rounded">
                        {selectedGuest.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">تلفن</div>
                      <div className="p-2 border rounded">
                        {selectedGuest.phone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">ملیت</div>
                      <div className="p-2 border rounded">
                        {selectedGuest.nationality}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  بستن
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// Main export with Suspense wrapper
export default function AdminGuestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader title="در حال بارگذاری" subtitle="لطفاً چند لحظه صبر کنید" />
        </div>
      }
    >
      <AdminGuestsContent />
    </Suspense>
  );
}
