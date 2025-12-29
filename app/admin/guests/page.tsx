//app/dashboards/admin/guests/page.tsx

"use client";

import { useState } from "react";
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
  Calendar,
  MapPin,
  Eye,
  Edit,
  Filter,
  Search,
  Plus,
} from "lucide-react";
import Loader from "@/components/loader";
import { CreateGuestDialog } from "@/components/guests/create-guest-dialog";
import { EditGuestDialog } from "@/components/guests/edit-guest-dialog";
import { GuestListItem, GuestResponse } from "@/lib/validation/guest";

const fetchGuests = async (search = ""): Promise<GuestListItem[]> => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const response = await fetch(`/api/guests?${params}`);
  if (!response.ok) throw new Error("Failed to fetch guests");
  const data = await response.json();
  return data.data;
};

export default function AdminGuestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestResponse | null>(
    null
  );

  const queryClient = useQueryClient();

  const { data: guests, isLoading } = useQuery({
    queryKey: ["guests", searchTerm, statusFilter],
    queryFn: () => fetchGuests(searchTerm),
  });

  const filteredGuests = guests?.filter((guest) => {
    if (statusFilter === "active") return guest.isActive;
    if (statusFilter === "inactive") return !guest.isActive;
    if (statusFilter === "all") return true;
    return true;
  });

  const handleGuestCreated = () => {
    // Refresh the guests query to show the new guest
    queryClient.invalidateQueries({ queryKey: ["guests"] });
  };

  const handleGuestUpdated = () => {
    // Refresh the guests query to show updated data
    queryClient.invalidateQueries({ queryKey: ["guests"] });
  };

  const handleEditGuest = (guest: GuestListItem) => {
    setSelectedGuest(guest);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader
          title="در حال بارگذاری میهمانان"
          subtitle="لطفاً چند لحظه صبر کنید"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
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

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>لیست میهمانان</CardTitle>
          <CardDescription>
            {filteredGuests?.length || 0} میهمان پیدا شد
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
                {filteredGuests?.map((guest) => (
                  <TableRow key={guest.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="font-medium">{guest.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {guest.email}
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGuest(guest)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جزئیات میهمان</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">نام کامل</div>
                  <div className="p-2 border rounded">{selectedGuest.name}</div>
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
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    تعداد اقامت
                  </div>
                  <div className="p-2 border rounded">
                    {selectedGuest.totalStays}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    مجموع هزینه
                  </div>
                  <div className="p-2 border rounded font-bold">
                    {selectedGuest.totalSpent.toLocaleString("fa-IR")} افغانی
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    امتیاز وفاداری
                  </div>
                  <div className="p-2 border rounded text-green-600 font-bold">
                    {selectedGuest.loyaltyPoints}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">وضعیت</div>
                  <div className="p-2 border rounded">
                    {selectedGuest.isActive ? (
                      <Badge className="bg-green-600">فعال</Badge>
                    ) : (
                      <Badge variant="outline">غیرفعال</Badge>
                    )}
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
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedGuest) {
                  handleEditGuest(selectedGuest);
                }
              }}
            >
              ویرایش اطلاعات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Guest Dialog */}
      <CreateGuestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGuestCreated={handleGuestCreated}
        navigateToBookingAfterCreate={true}
      />

      {/* Edit Guest Dialog */}
      <EditGuestDialog
        guest={selectedGuest}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onGuestUpdated={handleGuestUpdated}
      />
    </div>
  );
}
