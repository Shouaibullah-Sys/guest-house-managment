// app/admin/rooms/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { Progress } from "@/components/ui/progress";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Sparkles,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Clock,
  Users,
  Calendar,
  BarChart3,
  Search,
  X,
  Check,
  AlertCircle,
  Home,
  Bath,
  Tv,
  Wifi,
  Coffee,
  Snowflake,
  Dumbbell,
  Car,
  Star,
  Shield,
  Lock,
  Unlock,
  BedDouble,
  Square,
  Layers,
  Hash,
  FileText,
  Phone,
  Mail,
  User,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Printer,
  Copy,
  Link,
  QrCode,
  List,
  Grid,
  Wrench,
  Eye,
  Key,
  Bell,
  CreditCard,
  MapPin,
  Crown,
  Award,
  Hotel,
  DoorOpen,
  Thermometer,
  Wind,
  Droplets,
  Utensils,
  Headphones,
  ShieldCheck,
  Smartphone,
  Monitor,
  Speaker,
  Zap,
  Battery,
  BatteryCharging,
  Activity,
  TrendingUp,
  Percent,
  LineChart,
  Heart,
  Scale,
  Pill,
} from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import Loader from "@/components/loader";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { uploadFiles } from "@/lib/uploadthing-client";

// Hotel Theme Configuration
const HOTEL_THEME = {
  name: "اقامتگاه لوکس کوهستان",
  slogan: "تجربه‌ای بی‌نظیر از اقامت",
  logo: "🏔️",
  colors: {
    primary: "hsl(221, 83%, 53%)", // Royal Blue
    secondary: "hsl(142, 76%, 36%)", // Emerald Green
    accent: "hsl(43, 96%, 56%)", // Golden Yellow
    luxury: "hsl(340, 82%, 52%)", // Rose Gold
  },
  amenities: {
    premium: ["سرویس VIP", "صبحانه رایگان", "استخر خصوصی", "اسپا"],
    standard: ["وای‌فای رایگان", "صبحانه", "پارکینگ", "سالن ورزشی"],
  },
  roomCategories: {
    luxury: "سوئیت‌های لوکس",
    executive: "اتاق‌های اجرایی",
    standard: "اتاق‌های استاندارد",
    family: "اتاق‌های خانوادگی",
  },
};

// Types based on API schema
type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "cleaning"
  | "reserved";

interface RoomType {
  id: string;
  name: string;
  code: string;
  category: "luxury" | "executive" | "standard" | "family";
  description: string | null;
  maxOccupancy: number;
  basePrice: number;
  extraPersonPrice: number | null;
  amenities: string[] | null;
  premiumAmenities: string[] | null;
  images: string[] | null;
  size: string | null;
  bedType: string | null;
  viewType: "mountain" | "city" | "garden" | "pool";
  smokingAllowed: boolean;
  isActive: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string | null;
  roomType?: RoomType | null;
  floor: number;
  status: RoomStatus;
  lastCleaned: Date | null;
  notes: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse {
  success: boolean;
  data: Room[] | Room;
  message?: string;
}

interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  cleaning: number;
  vip: number;
  occupancyRate: number;
  revenueToday: number;
  revenueThisMonth: number;
  averageRating: number;
  mostPopularType: string;
}

// Zod validation schemas
const roomFormSchema = z.object({
  roomNumber: z
    .string()
    .min(1, "شماره اتاق الزامی است")
    .max(10, "شماره اتاق نباید بیش از ۱۰ کاراکتر باشد")
    .regex(
      /^[a-zA-Z0-9\-_]+$/,
      "شماره اتاق فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد"
    ),
  roomTypeId: z.string().min(1, "نوع اتاق الزامی است"),
  floor: z
    .number()
    .min(1, "طبقه باید حداقل ۱ باشد")
    .max(50, "طبقه نمی‌تواند بیش از ۵۰ باشد"),
  status: z
    .string()
    .min(1, "وضعیت اتاق الزامی است")
    .refine(
      (val) =>
        [
          "available",
          "occupied",
          "maintenance",
          "cleaning",
          "reserved",
        ].includes(val),
      "وضعیت نامعتبر است"
    ),
  notes: z
    .string()
    .max(500, "یادداشت نباید بیش از ۵۰۰ کاراکتر باشد")
    .optional()
    .default(""),
  imageUrl: z.string().optional().default(""),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

interface FormErrors {
  roomNumber?: string;
  roomTypeId?: string;
  floor?: string;
  status?: string;
  notes?: string;
  imageUrl?: string;
}

// Fetch functions
const fetchRooms = async (): Promise<Room[]> => {
  const response = await fetch("/api/rooms");
  if (!response.ok) throw new Error("Failed to fetch rooms");
  const result: ApiResponse = await response.json();
  return Array.isArray(result.data) ? result.data : [result.data];
};

const fetchRoomTypes = async (): Promise<RoomType[]> => {
  const response = await fetch("/api/room-types");
  if (!response.ok) throw new Error("Failed to fetch room types");
  const result = await response.json();
  return result.data || [];
};

const fetchRoomStats = async (): Promise<RoomStats> => {
  const response = await fetch("/api/rooms/stats");
  if (!response.ok) throw new Error("Failed to fetch room stats");
  const result = await response.json();
  return result.data;
};

// Helper functions moved outside component for sub-component access
const getStatusBadge = (status: RoomStatus) => {
  const variants = {
    available: {
      variant: "default" as const,
      icon: CheckCircle,
      label: "آزاد",
      className: "bg-emerald-500 hover:bg-emerald-600",
    },
    occupied: {
      variant: "secondary" as const,
      icon: Users,
      label: "اشغال شده",
      className: "bg-blue-500 hover:bg-blue-600",
    },
    reserved: {
      variant: "outline" as const,
      icon: Calendar,
      label: "رزرو شده",
      className: "border-amber-500 text-amber-500",
    },
    maintenance: {
      variant: "destructive" as const,
      icon: Wrench,
      label: "تعمیرات",
      className: "bg-rose-500 hover:bg-rose-600",
    },
    cleaning: {
      variant: "outline" as const,
      icon: Sparkles,
      label: "در حال نظافت",
      className: "border-purple-500 text-purple-500",
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1 font-medium", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getCategoryBadge = (category: string) => {
  const categories = {
    luxury: {
      label: "لوکس",
      className: "bg-gradient-to-r from-amber-500 to-rose-500 text-white",
      icon: Crown,
    },
    executive: {
      label: "اجرایی",
      className: "bg-blue-500 text-white",
      icon: Award,
    },
    standard: {
      label: "استاندارد",
      className: "bg-emerald-500 text-white",
      icon: Star,
    },
    family: {
      label: "خانوادگی",
      className: "bg-purple-500 text-white",
      icon: Users,
    },
  };

  const config =
    categories[category as keyof typeof categories] || categories.standard;
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getAmenityIcon = (amenity: string) => {
  const icons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-4 w-4 text-blue-500" />,
    tv: <Tv className="h-4 w-4 text-purple-500" />,
    ac: <Snowflake className="h-4 w-4 text-cyan-500" />,
    minibar: <Coffee className="h-4 w-4 text-amber-500" />,
    gym: <Dumbbell className="h-4 w-4 text-rose-500" />,
    parking: <Car className="h-4 w-4 text-indigo-500" />,
    pool: <Droplets className="h-4 w-4 text-blue-400" />,
    spa: <Bath className="h-4 w-4 text-pink-500" />,
    restaurant: <Utensils className="h-4 w-4 text-emerald-500" />,
    "room-service": <Bell className="h-4 w-4 text-amber-500" />,
    "safe-box": <Shield className="h-4 w-4 text-gray-500" />,
    "smart-tv": <Monitor className="h-4 w-4 text-purple-600" />,
    jacuzzi: <Droplets className="h-4 w-4 text-blue-300" />,
  };
  return icons[amenity] || <Star className="h-4 w-4 text-amber-500" />;
};

export default function AdminRoomsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

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

  // Updated fetch functions
  const fetchRooms = async (): Promise<Room[]> => {
    const response = await authenticatedFetch("/api/rooms");
    if (!response.ok) throw new Error("Failed to fetch rooms");
    const result: ApiResponse = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  };

  const fetchRoomTypes = async (): Promise<RoomType[]> => {
    const response = await authenticatedFetch("/api/room-types");
    if (!response.ok) throw new Error("Failed to fetch room types");
    const result = await response.json();
    return result.data || [];
  };

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddRoomTypeDialogOpen, setIsAddRoomTypeDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(
    null
  );
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // New room state
  const [newRoom, setNewRoom] = useState<RoomFormData>({
    roomNumber: "",
    roomTypeId: "",
    floor: 1,
    status: "available",
    notes: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // New room type state
  const [newRoomType, setNewRoomType] = useState({
    name: "",
    code: "",
    category: "luxury" as "luxury" | "executive" | "standard" | "family",
    description: "",
    maxOccupancy: 4,
    basePrice: 15000,
    extraPersonPrice: 3000,
    amenities: [
      "wifi",
      "tv",
      "ac",
      "minibar",
      "gym",
      "parking",
      "spa",
      "restaurant",
      "room-service",
      "safe-box",
      "smart-tv",
    ] as string[],
    premiumAmenities: [
      "vip-service",
      "private-pool",
      "spa-suite",
      "butler-service",
    ] as string[],
    size: "45 m²",
    bedType: "تخت کینگ",
    viewType: "mountain" as "mountain" | "city" | "garden" | "pool",
    smokingAllowed: false,
  });
  const [roomTypeFormErrors, setRoomTypeFormErrors] = useState<any>({});

  // Queries
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  const { data: roomTypes = [] } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: fetchRoomTypes,
  });

  const { data: roomStats, isLoading: statsLoading } = useQuery({
    queryKey: ["roomStats"],
    queryFn: fetchRoomStats,
  });

  // Validation function
  const validateForm = (data: RoomFormData): FormErrors => {
    try {
      roomFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FormErrors = {};
        error.issues.forEach((err) => {
          const path = err.path.join(".") as keyof FormErrors;
          errors[path] = err.message;
        });
        return errors;
      }
      return {};
    }
  };

  // Image upload function using UploadThing
  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      // Use UploadThing's proper client API
      const result = await uploadFiles.uploadFiles("roomUploader", {
        files: [file],
      });

      if (result.length === 0) {
        throw new Error("No files were uploaded");
      }

      return result[0].url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddRoomSubmit = () => {
    const errors = validateForm(newRoom);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      addRoomMutation.mutate(newRoom);
    } else {
      toast.error("لطفاً خطاهای فرم را برطرف کنید", {
        description: "برخی از فیلدها نیاز به تصحیح دارند.",
      });
    }
  };

  const handleEditRoomSubmit = () => {
    if (!selectedRoom) return;

    const editRoomData: RoomFormData = {
      roomNumber: selectedRoom.roomNumber,
      roomTypeId: selectedRoom.roomTypeId || "",
      floor: selectedRoom.floor,
      status: selectedRoom.status,
      notes: selectedRoom.notes || "",
      imageUrl: selectedRoom.imageUrl || "",
    };

    const errors = validateForm(editRoomData);
    setEditFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      updateRoomMutation.mutate({
        id: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        roomTypeId: selectedRoom.roomTypeId,
        floor: selectedRoom.floor,
        status: selectedRoom.status,
        notes: selectedRoom.notes || "",
        imageUrl: selectedRoom.imageUrl,
      });
    } else {
      toast.error("لطفاً خطاهای فرم را برطرف کنید", {
        description: "برخی از فیلدها نیاز به تصحیح دارند.",
      });
    }
  };

  // Mutations
  const addRoomMutation = useMutation({
    mutationFn: async (room: RoomFormData) => {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...room,
          hotelId: "main", // Your hotel ID
          metadata: {
            theme: HOTEL_THEME.name,
            addedBy: "admin",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add room");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      setIsAddDialogOpen(false);
      setNewRoom({
        roomNumber: "",
        roomTypeId: "",
        floor: 1,
        status: "available",
        notes: "",
        imageUrl: "",
      });
      setFormErrors({});
      toast.success("اتاق جدید ایجاد شد 🎉", {
        description: "اتاق جدید با موفقیت به سیستم اضافه شد.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error("خطا در ایجاد اتاق", {
        description: error.message || "خطای ناشناخته رخ داده است.",
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Room>) => {
      const response = await fetch(`/api/rooms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...data,
          metadata: {
            theme: HOTEL_THEME.name,
            updatedBy: "admin",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update room");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      setIsEditDialogOpen(false);
      setSelectedRoom(null);
      setEditFormErrors({});
      toast.success("اتاق بروزرسانی شد ✅", {
        description: "تغییرات با موفقیت ذخیره شد.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error("خطا در بروزرسانی اتاق", {
        description: error.message || "خطای ناشناخته رخ داده است.",
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/rooms?id=${roomId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete room");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      toast.success("اتاق حذف شد", {
        description: "اتاق از سیستم حذف شد.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error("خطا در حذف اتاق", {
        description: error.message || "خطای ناشناخته رخ داده است.",
      });
    },
  });

  const quickActionMutation = useMutation({
    mutationFn: async ({
      roomId,
      action,
      data,
    }: {
      roomId: string;
      action: string;
      data?: any;
    }) => {
      const response = await fetch(`/api/rooms/${roomId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to perform action");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomStats"] });
      toast.success("عملیات انجام شد", {
        description: "تغییرات با موفقیت اعمال شد.",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast.error("خطا در انجام عملیات", {
        description: error.message || "خطای ناشناخته رخ داده است.",
      });
    },
  });

  const addRoomTypeMutation = useMutation({
    mutationFn: async (roomType: any) => {
      const response = await authenticatedFetch("/api/room-types", {
        method: "POST",
        body: JSON.stringify(roomType),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add room type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      setIsAddRoomTypeDialogOpen(false);
      setNewRoomType({
        name: "",
        code: "",
        category: "luxury",
        description: "",
        maxOccupancy: 4,
        basePrice: 15000,
        extraPersonPrice: 3000,
        amenities: [
          "wifi",
          "tv",
          "ac",
          "minibar",
          "gym",
          "parking",
          "spa",
          "restaurant",
          "room-service",
          "safe-box",
          "smart-tv",
        ],
        premiumAmenities: [
          "vip-service",
          "private-pool",
          "spa-suite",
          "butler-service",
        ],
        size: "45 m²",
        bedType: "تخت کینگ",
        viewType: "mountain",
        smokingAllowed: false,
      });
      setRoomTypeFormErrors({});
      toast.success("نوع اتاق جدید ایجاد شد 🎉", {
        description: "نوع اتاق جدید با موفقیت به سیستم اضافه شد.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error("خطا در ایجاد نوع اتاق", {
        description: error.message || "خطای ناشناخته رخ داده است.",
      });
    },
  });

  const handleQuickAction = (roomId: string, action: string) => {
    quickActionMutation.mutate({ roomId, action });
  };

  const handleAddRoomTypeSubmit = () => {
    // Basic validation
    const errors: any = {};
    if (!newRoomType.name.trim()) errors.name = "نام نوع اتاق الزامی است";
    if (!newRoomType.code.trim()) errors.code = "کد نوع اتاق الزامی است";
    if (newRoomType.basePrice <= 0)
      errors.basePrice = "قیمت باید بیشتر از صفر باشد";
    if (newRoomType.maxOccupancy <= 0)
      errors.maxOccupancy = "ظرفیت باید بیشتر از صفر باشد";

    setRoomTypeFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      addRoomTypeMutation.mutate(newRoomType);
    } else {
      toast.error("لطفاً خطاهای فرم را برطرف کنید", {
        description: "برخی از فیلدها نیاز به تصحیح دارند.",
      });
    }
  };

  const handleExportRooms = () => {
    toast.info("در حال آماده‌سازی خروجی", {
      description: "لیست اتاق‌ها در حال آماده‌سازی برای دانلود است...",
    });
  };

  const handlePrintRoomList = () => {
    window.print();
  };

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !searchTerm ||
      room.roomNumber.includes(searchTerm) ||
      (room.roomType?.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesFloor =
      floorFilter === "all" || room.floor.toString() === floorFilter;
    const matchesRoomType =
      roomTypeFilter === "all" || room.roomTypeId === roomTypeFilter;
    const matchesCategory =
      categoryFilter === "all" || room.roomType?.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFloor &&
      matchesRoomType &&
      matchesCategory
    );
  });

  // Get unique floors
  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort(
    (a, b) => a - b
  );

  // Get occupancy rate color
  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-500";
    if (rate >= 60) return "text-amber-500";
    if (rate >= 40) return "text-blue-500";
    return "text-gray-500";
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <Loader
          title="در حال بارگذاری اطلاعات اتاق‌ها"
          subtitle="لطفاً چند لحظه صبر کنید"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4 space-y-6">
      {/* Hotel Header */}
      <div className="bg-linear-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Hotel className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {HOTEL_THEME.logo} {HOTEL_THEME.name}
                </h1>
                <p className="text-blue-100">{HOTEL_THEME.slogan}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/20">
                <ShieldCheck className="h-3 w-3 ml-1" />
                استاندارد ۵ ستاره
              </Badge>
              <Badge variant="secondary" className="bg-white/20">
                <Award className="h-3 w-3 ml-1" />
                برترین هتل ۱۴۰۳
              </Badge>
              <Badge variant="secondary" className="bg-white/20">
                <Heart className="h-3 w-3 ml-1" />
                ۹۸% رضایت مهمانان
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["rooms"] })
              }
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              بروزرسانی
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddRoomTypeDialogOpen(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20"
              >
                <Building className="ml-2 h-4 w-4" />
                ایجاد نوع اتاق
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-lg"
              >
                <Plus className="ml-2 h-4 w-4" />
                افزودن اتاق جدید
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-2 border-blue-100 dark:border-blue-900 bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  کل اتاق‌ها
                </p>
                <p className="text-2xl font-bold mt-1">{rooms.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    {roomStats?.occupancyRate || 0}% اشغال
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-100 dark:border-emerald-900 bg-linear-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  اتاق‌های آزاد
                </p>
                <p className="text-2xl font-bold mt-1">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    آماده پذیرش
                  </span>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 dark:border-blue-900 bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  اشغال شده
                </p>
                <p className="text-2xl font-bold mt-1">
                  {rooms.filter((r) => r.status === "occupied").length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    مهمان در اتاق
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 dark:border-amber-900 bg-linear-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  رزرو شده
                </p>
                <p className="text-2xl font-bold mt-1">
                  {rooms.filter((r) => r.status === "reserved").length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    رزرو آینده
                  </span>
                </div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-100 dark:border-rose-900 bg-linear-to-br from-white to-rose-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  در حال تعمیر
                </p>
                <p className="text-2xl font-bold mt-1">
                  {rooms.filter((r) => r.status === "maintenance").length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Wrench className="h-3 w-3 text-rose-500" />
                  <span className="text-xs text-muted-foreground">
                    نیاز به سرویس
                  </span>
                </div>
              </div>
              <div className="bg-rose-100 dark:bg-rose-900 p-3 rounded-full">
                <Wrench className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 dark:border-purple-900 bg-linear-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  در حال نظافت
                </p>
                <p className="text-2xl font-bold mt-1">
                  {rooms.filter((r) => r.status === "cleaning").length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-muted-foreground">
                    نظافت روزانه
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Analytics */}
      {roomStats && (
        <Card className="bg-linear-to-r from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold">درآمد امروز</h3>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {roomStats.revenueToday.toLocaleString("fa-IR")} افغانی
                </div>
                <div className="text-sm text-muted-foreground">
                  +۱۲٪ نسبت به دیروز
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">نرخ اشغال</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-blue-600">
                    {roomStats.occupancyRate}%
                  </div>
                  <div className="flex-1">
                    <Progress value={roomStats.occupancyRate} className="h-2" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  میانگین امتیاز: ⭐{" "}
                  {roomStats.averageRating?.toFixed(1) || "0.0"}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">محبوب‌ترین نوع</h3>
                </div>
                <div className="text-xl font-bold text-amber-600">
                  {roomStats.mostPopularType}
                </div>
                <div className="text-sm text-muted-foreground">
                  بیشترین درخواست مهمانان
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content with Tabs */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                مدیریت اتاق‌ها
              </CardTitle>
              <CardDescription>
                مشاهده و مدیریت {rooms.length} اتاق در {HOTEL_THEME.name}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="ml-2 h-4 w-4" />
                    خروجی
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportRooms}>
                    <FileText className="ml-2 h-4 w-4" />
                    خروجی Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrintRoomList}>
                    <Printer className="ml-2 h-4 w-4" />
                    چاپ لیست
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="ml-2 h-4 w-4" />
                    کپی لیست
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <QrCode className="ml-2 h-4 w-4" />
                    تولید QR کد
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Enhanced Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی شماره اتاق، نوع یا امکانات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 bg-white dark:bg-gray-800"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="available" className="text-emerald-600">
                    <CheckCircle className="h-3 w-3 ml-1 inline" />
                    آزاد
                  </SelectItem>
                  <SelectItem value="occupied" className="text-blue-600">
                    <Users className="h-3 w-3 ml-1 inline" />
                    اشغال شده
                  </SelectItem>
                  <SelectItem value="reserved" className="text-amber-600">
                    <Calendar className="h-3 w-3 ml-1 inline" />
                    رزرو شده
                  </SelectItem>
                  <SelectItem value="vip" className="text-amber-500">
                    <Crown className="h-3 w-3 ml-1 inline" />
                    VIP
                  </SelectItem>
                  <SelectItem value="maintenance" className="text-rose-600">
                    <Wrench className="h-3 w-3 ml-1 inline" />
                    تعمیرات
                  </SelectItem>
                  <SelectItem value="cleaning" className="text-purple-600">
                    <Sparkles className="h-3 w-3 ml-1 inline" />
                    در حال نظافت
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="طبقه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه طبقات</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      <Layers className="h-3 w-3 ml-1 inline" />
                      طبقه {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع اتاق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه انواع</SelectItem>
                  {roomTypes.map((roomType) => (
                    <SelectItem key={roomType.id} value={roomType.id}>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(roomType.category)}
                        <span>{roomType.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                  <SelectItem value="luxury">
                    <Crown className="h-3 w-3 ml-1 inline" />
                    سوئیت‌های لوکس
                  </SelectItem>
                  <SelectItem value="executive">
                    <Award className="h-3 w-3 ml-1 inline" />
                    اجرایی
                  </SelectItem>
                  <SelectItem value="standard">
                    <Star className="h-3 w-3 ml-1 inline" />
                    استاندارد
                  </SelectItem>
                  <SelectItem value="family">
                    <Users className="h-3 w-3 ml-1 inline" />
                    خانوادگی
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="ml-2 h-4 w-4" />
                  نماد کارتی
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="ml-2 h-4 w-4" />
                  نماد لیستی
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredRooms.length} اتاق یافت شد
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setFloorFilter("all");
                    setRoomTypeFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  <X className="ml-2 h-4 w-4" />
                  پاک کردن فیلترها
                </Button>
              </div>
            </div>
          </div>

          {/* Rooms Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={() => {
                    setSelectedRoom(room);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedRoom(room);
                    setIsDeleteDialogOpen(true);
                  }}
                  onViewDetails={() => {
                    setSelectedRoomDetails(room);
                    setIsDetailsSheetOpen(true);
                  }}
                  onQuickAction={(action) => handleQuickAction(room.id, action)}
                />
              ))}
            </div>
          ) : (
            <RoomsTable
              rooms={filteredRooms}
              onEdit={(room) => {
                setSelectedRoom(room);
                setIsEditDialogOpen(true);
              }}
              onDelete={(room) => {
                setSelectedRoom(room);
                setIsDeleteDialogOpen(true);
              }}
              onViewDetails={(room) => {
                setSelectedRoomDetails(room);
                setIsDetailsSheetOpen(true);
              }}
            />
          )}

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">اتاقی یافت نشد</h3>
              <p className="text-muted-foreground">
                هیچ اتاقی با فیلترهای انتخاب شده مطابقت ندارد
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <AddRoomDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setFormErrors({});
          }
        }}
        newRoom={newRoom}
        setNewRoom={setNewRoom}
        roomTypes={roomTypes}
        isLoading={addRoomMutation.isPending}
        formErrors={formErrors}
        onSubmit={handleAddRoomSubmit}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />

      {/* Edit Room Dialog */}
      <EditRoomDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditFormErrors({});
          }
        }}
        room={selectedRoom}
        setRoom={setSelectedRoom}
        roomTypes={roomTypes}
        isLoading={updateRoomMutation.isPending}
        formErrors={editFormErrors}
        onSubmit={handleEditRoomSubmit}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />

      {/* Delete Room Dialog */}
      <DeleteRoomDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        room={selectedRoom}
        isLoading={deleteRoomMutation.isPending}
        onConfirm={() => {
          if (selectedRoom) {
            deleteRoomMutation.mutate(selectedRoom.id);
          }
        }}
      />

      {/* Room Details Sheet */}
      <RoomDetailsSheet
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        room={selectedRoomDetails}
      />

      {/* Add Room Type Dialog */}
      <AddRoomTypeDialog
        isOpen={isAddRoomTypeDialogOpen}
        onOpenChange={(open) => {
          setIsAddRoomTypeDialogOpen(open);
          if (!open) {
            setRoomTypeFormErrors({});
          }
        }}
        newRoomType={newRoomType}
        setNewRoomType={setNewRoomType}
        isLoading={addRoomTypeMutation.isPending}
        formErrors={roomTypeFormErrors}
        onSubmit={handleAddRoomTypeSubmit}
      />
    </div>
  );
}

// Enhanced Room Card Component
function RoomCard({
  room,
  onEdit,
  onDelete,
  onViewDetails,
  onQuickAction,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onQuickAction: (action: string) => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        room.status === "reserved" && "border-amber-500 dark:border-amber-600"
      )}
    >
      <CardHeader className="pb-3 relative">
        {/* Room Image */}
        {room.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
            <img
              src={room.imageUrl}
              alt={`اتاق ${room.roomNumber}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-room.png";
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-emerald-500/10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  room.status === "available"
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : room.status === "occupied"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <DoorOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">اتاق {room.roomNumber}</span>
                </div>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  <span>طبقه {room.floor}</span>
                  <span>•</span>
                  <span className="font-medium">
                    {room.roomType?.name || "نامشخص"}
                  </span>
                </CardDescription>
              </div>
            </CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                عملیات اتاق
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="ml-2 h-4 w-4" />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="ml-2 h-4 w-4" />
                ویرایش اطلاعات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>عملیات سریع</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onQuickAction("mark_clean")}>
                <Sparkles className="ml-2 h-4 w-4" />
                علامت گذاری تمیز
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onQuickAction("mark_maintenance")}
              >
                <Wrench className="ml-2 h-4 w-4" />
                درخواست تعمیر
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction("mark_available")}>
                <CheckCircle className="ml-2 h-4 w-4" />
                علامت گذاری آزاد
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onQuickAction("generate_qr")}>
                <QrCode className="ml-2 h-4 w-4" />
                تولید QR کد
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="ml-2 h-4 w-4" />
                چاپ اطلاعات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف اتاق
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Room Status and Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">وضعیت</div>
              {getStatusBadge(room.status)}
            </div>

            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">نرخ شبی</div>
              <div className="font-bold text-lg text-emerald-600">
                {(room.roomType?.basePrice || 0).toLocaleString("fa-IR")} افغانی
              </div>
            </div>
          </div>

          {/* Capacity and Size */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{room.roomType?.maxOccupancy || 2} نفر</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span>{room.roomType?.size || "25 m²"}</span>
              </div>
            </div>
          </div>

          {/* Amenities Preview */}
          {room.roomType?.amenities && room.roomType.amenities.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">امکانات</div>
              <div className="flex flex-wrap gap-1">
                {room.roomType.amenities.slice(0, 4).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs"
                    title={amenity}
                  >
                    {getAmenityIcon(amenity)}
                    <span className="truncate max-w-[60px]">{amenity}</span>
                  </div>
                ))}
                {room.roomType.amenities.length > 4 && (
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                    +{room.roomType.amenities.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Cleaned */}
          {room.lastCleaned && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t">
              <Clock className="h-3 w-3" />
              آخرین نظافت:{" "}
              {format(new Date(room.lastCleaned), "dd MMMM", { locale: faIR })}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetails}
          >
            <Eye className="ml-2 h-3 w-3" />
            مشاهده
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className={
              room.status === "reserved"
                ? "border-amber-200 text-amber-600"
                : ""
            }
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Enhanced Rooms Table Component
function RoomsTable({
  rooms,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewDetails: (room: Room) => void;
}) {
  return (
    <div className="rounded-lg border-2 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-linear-to-r from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
            <TableRow>
              <TableHead className="font-bold">تصویر</TableHead>
              <TableHead className="font-bold">شماره اتاق</TableHead>
              <TableHead className="font-bold">طبقه</TableHead>
              <TableHead className="font-bold">نوع اتاق</TableHead>
              <TableHead className="font-bold">دسته‌بندی</TableHead>
              <TableHead className="font-bold">وضعیت</TableHead>
              <TableHead className="font-bold">نرخ پایه</TableHead>
              <TableHead className="font-bold">ظرفیت</TableHead>
              <TableHead className="font-bold">آخرین نظافت</TableHead>
              <TableHead className="font-bold">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow
                key={room.id}
                className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50"
              >
                <TableCell>
                  {room.imageUrl ? (
                    <div className="w-12 h-8 rounded overflow-hidden bg-gray-100">
                      <img
                        src={room.imageUrl}
                        alt={`اتاق ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-room.png";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        room.status === "available"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : room.status === "occupied"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold">اتاق {room.roomNumber}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    طبقه {room.floor}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {room.roomType?.name || "نامشخص"}
                  </div>
                </TableCell>
                <TableCell>
                  {room.roomType?.category &&
                    getCategoryBadge(room.roomType.category)}
                </TableCell>
                <TableCell>{getStatusBadge(room.status)}</TableCell>
                <TableCell>
                  <div className="font-bold text-emerald-600">
                    {(room.roomType?.basePrice || 0).toLocaleString("fa-IR")}{" "}
                    افغانی
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {room.roomType?.maxOccupancy || 2} نفر
                  </div>
                </TableCell>
                <TableCell>
                  {room.lastCleaned ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(room.lastCleaned), "dd MMM", {
                        locale: faIR,
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(room)}
                      className="hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(room)}
                      className="hover:bg-emerald-100 hover:text-emerald-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(room)}
                      className="hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Enhanced Add Room Dialog Component
function AddRoomDialog({
  isOpen,
  onOpenChange,
  newRoom,
  setNewRoom,
  roomTypes,
  isLoading,
  formErrors,
  onSubmit,
  onImageUpload,
  uploadingImage,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRoom: RoomFormData;
  setNewRoom: (room: RoomFormData) => void;
  roomTypes: RoomType[];
  isLoading: boolean;
  formErrors: FormErrors;
  onSubmit: () => void;
  onImageUpload: (file: File) => Promise<string>;
  uploadingImage: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-linear-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">افزودن اتاق جدید</DialogTitle>
              <DialogDescription>
                اطلاعات اتاق جدید را در {HOTEL_THEME.name} وارد کنید
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                شماره اتاق *
              </Label>
              <Input
                id="roomNumber"
                value={newRoom.roomNumber}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomNumber: e.target.value })
                }
                placeholder="مثال: ۱۰۱"
                className={cn(
                  "text-center font-bold text-lg",
                  formErrors.roomNumber && "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.roomNumber && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.roomNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor" className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                طبقه *
              </Label>
              <Input
                id="floor"
                type="number"
                value={newRoom.floor}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, floor: Number(e.target.value) })
                }
                min="1"
                max="50"
                className={cn(
                  "text-center",
                  formErrors.floor && "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.floor && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.floor}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              نوع اتاق *
            </Label>
            <Select
              value={newRoom.roomTypeId}
              onValueChange={(value) =>
                setNewRoom({ ...newRoom, roomTypeId: value })
              }
            >
              <SelectTrigger
                className={cn(
                  "h-11",
                  formErrors.roomTypeId && "border-red-500 focus:border-red-500"
                )}
              >
                <SelectValue placeholder="انتخاب نوع اتاق" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(roomType.category)}
                        <span>{roomType.name}</span>
                      </div>
                      <span className="text-emerald-600 font-medium">
                        {roomType.basePrice.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.roomTypeId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.roomTypeId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                وضعیت اولیه *
              </Label>
              <Select
                value={newRoom.status}
                onValueChange={(value: RoomStatus) =>
                  setNewRoom({ ...newRoom, status: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available" className="text-emerald-600">
                    <CheckCircle className="h-3 w-3 ml-1 inline" />
                    آزاد
                  </SelectItem>
                  <SelectItem value="reserved" className="text-amber-600">
                    <Calendar className="h-3 w-3 ml-1 inline" />
                    رزرو شده
                  </SelectItem>
                  <SelectItem value="cleaning" className="text-purple-600">
                    <Sparkles className="h-3 w-3 ml-1 inline" />
                    در حال نظافت
                  </SelectItem>
                  <SelectItem value="maintenance" className="text-rose-600">
                    <Wrench className="h-3 w-3 ml-1 inline" />
                    تعمیرات
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              یادداشت‌ها
            </Label>
            <Textarea
              id="notes"
              value={newRoom.notes}
              onChange={(e) =>
                setNewRoom({ ...newRoom, notes: e.target.value })
              }
              placeholder="یادداشت‌های اضافی در مورد اتاق..."
              rows={3}
              className={cn(
                "resize-none",
                formErrors.notes && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.notes && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.notes}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {newRoom.notes.length}/500 کاراکتر
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">تصویر اتاق</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {newRoom.imageUrl ? (
                  <img
                    src={newRoom.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const imageUrl = await onImageUpload(file);
                        setNewRoom({ ...newRoom, imageUrl });
                      } catch (error) {
                        // Error is handled in the parent component
                      }
                    }
                  }}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingImage ? "در حال آپلود..." : "آپلود تصویر"}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !newRoom.roomNumber}
            className="flex-1 bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                ایجاد اتاق
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Edit Room Dialog Component
function EditRoomDialog({
  isOpen,
  onOpenChange,
  room,
  setRoom,
  roomTypes,
  isLoading,
  formErrors,
  onSubmit,
  onImageUpload,
  uploadingImage,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  setRoom: (room: Room | null) => void;
  roomTypes: RoomType[];
  isLoading: boolean;
  formErrors: FormErrors;
  onSubmit: () => void;
  onImageUpload: (file: File) => Promise<string>;
  uploadingImage: boolean;
}) {
  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-linear-to-b from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
              <Edit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                ویرایش اتاق {room.roomNumber}
              </DialogTitle>
              <DialogDescription>اطلاعات اتاق را ویرایش کنید</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit-roomNumber"
                className="flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                شماره اتاق *
              </Label>
              <Input
                id="edit-roomNumber"
                value={room.roomNumber}
                onChange={(e) =>
                  setRoom({ ...room, roomNumber: e.target.value })
                }
                className={cn(
                  "font-bold",
                  formErrors.roomNumber && "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.roomNumber && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.roomNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-floor" className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                طبقه *
              </Label>
              <Input
                id="edit-floor"
                type="number"
                value={room.floor}
                onChange={(e) =>
                  setRoom({ ...room, floor: Number(e.target.value) })
                }
                min="1"
                max="50"
                className={cn(
                  formErrors.floor && "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.floor && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.floor}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-roomType" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              نوع اتاق *
            </Label>
            <Select
              value={room.roomTypeId || ""}
              onValueChange={(value) => setRoom({ ...room, roomTypeId: value })}
            >
              <SelectTrigger
                className={cn(
                  "h-11",
                  formErrors.roomTypeId && "border-red-500 focus:border-red-500"
                )}
              >
                <SelectValue placeholder="انتخاب نوع اتاق" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(roomType.category)}
                        <span>{roomType.name}</span>
                      </div>
                      <span className="text-emerald-600 font-medium">
                        {roomType.basePrice.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.roomTypeId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.roomTypeId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                وضعیت *
              </Label>
              <Select
                value={room.status}
                onValueChange={(value: RoomStatus) =>
                  setRoom({ ...room, status: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available" className="text-emerald-600">
                    <CheckCircle className="h-3 w-3 ml-1 inline" />
                    آزاد
                  </SelectItem>
                  <SelectItem value="occupied" className="text-blue-600">
                    <Users className="h-3 w-3 ml-1 inline" />
                    اشغال شده
                  </SelectItem>
                  <SelectItem value="reserved" className="text-amber-600">
                    <Calendar className="h-3 w-3 ml-1 inline" />
                    رزرو شده
                  </SelectItem>
                  <SelectItem value="vip" className="text-amber-500">
                    <Crown className="h-3 w-3 ml-1 inline" />
                    VIP
                  </SelectItem>
                  <SelectItem value="maintenance" className="text-rose-600">
                    <Wrench className="h-3 w-3 ml-1 inline" />
                    تعمیرات
                  </SelectItem>
                  <SelectItem value="cleaning" className="text-purple-600">
                    <Sparkles className="h-3 w-3 ml-1 inline" />
                    در حال نظافت
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.status}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              یادداشت‌ها
            </Label>
            <Textarea
              id="edit-notes"
              value={room.notes || ""}
              onChange={(e) => setRoom({ ...room, notes: e.target.value })}
              rows={3}
              className={cn(
                "resize-none",
                formErrors.notes && "border-red-500 focus:border-red-500"
              )}
              placeholder="یادداشت‌های اضافی در مورد اتاق..."
            />
            {formErrors.notes && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.notes}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {(room.notes || "").length}/500 کاراکتر
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">تصویر اتاق</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="edit-image"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const imageUrl = await onImageUpload(file);
                        setRoom({ ...room, imageUrl });
                      } catch (error) {
                        // Error is handled in the parent component
                      }
                    }
                  }}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Label
                  htmlFor="edit-image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingImage ? "در حال آپلود..." : "تغییر تصویر"}
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4"></div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Check className="ml-2 h-4 w-4" />
                ذخیره تغییرات
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Delete Room Dialog Component
function DeleteRoomDialog({
  isOpen,
  onOpenChange,
  room,
  isLoading,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  isLoading: boolean;
  onConfirm: () => void;
}) {
  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-linear-to-b from-white to-rose-50 dark:from-gray-800 dark:to-rose-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-rose-600">
                تایید حذف اتاق
              </DialogTitle>
              <DialogDescription>
                آیا از حذف این اتاق اطمینان دارید؟
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="h-12 w-12 text-rose-500" />
              <div>
                <h4 className="font-bold text-lg">اتاق {room.roomNumber}</h4>
                <p className="text-muted-foreground">
                  طبقه {room.floor} • {room.roomType?.name || "نامشخص"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">هشدار مهم</p>
                <p className="text-sm">
                  در صورت داشتن رزرو فعال یا مهمان در اتاق، امکان حذف وجود
                  ندارد. ابتدا اتاق را خالی کنید.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">عواقب حذف:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  حذف تمام تاریخچه رزروهای این اتاق
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  از دست رفتن گزارشات مالی مرتبط
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  غیرقابل بازگشت بودن این عملیات
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                در حال حذف...
              </>
            ) : (
              <>
                <Trash2 className="ml-2 h-4 w-4" />
                حذف اتاق
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Room Details Sheet Component
function RoomDetailsSheet({
  isOpen,
  onOpenChange,
  room,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}) {
  if (!room) return null;

  const getViewIcon = (viewType: string) => {
    const icons = {
      mountain: "🏔️",
      city: "🏙️",
      garden: "🌳",
      pool: "🏊",
    };
    return icons[viewType as keyof typeof icons] || "🏨";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto bg-linear-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-xl",
                room.status === "available"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : room.status === "occupied"
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <Building className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl">
                اتاق {room.roomNumber}
              </SheetTitle>
              <SheetDescription>جزئیات کامل اتاق و وضعیت فعلی</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Room Image */}
          {room.imageUrl && (
            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                تصویر اتاق
              </h4>
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={room.imageUrl}
                  alt={`اتاق ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-room.png";
                  }}
                />
              </div>
            </div>
          )}

          {/* Header Card */}
          <Card className="bg-linear-to-r from-blue-500/5 to-emerald-500/5 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    اتاق {room.roomNumber}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    طبقه {room.floor} • {room.roomType?.name || "نامشخص"}
                  </div>
                </div>
                {getStatusBadge(room.status)}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Room Type Details */}
          {room.roomType && (
            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                اطلاعات نوع اتاق
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">نرخ پایه</div>
                  <div className="font-bold text-xl text-emerald-600">
                    {room.roomType.basePrice.toLocaleString("fa-IR")} افغانی
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">ظرفیت</div>
                  <div className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    تا {room.roomType.maxOccupancy} نفر
                  </div>
                </div>
                {room.roomType.size && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">مساحت</div>
                    <div className="font-medium flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      {room.roomType.size}
                    </div>
                  </div>
                )}
                {room.roomType.bedType && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">نوع تخت</div>
                    <div className="font-medium flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      {room.roomType.bedType}
                    </div>
                  </div>
                )}
              </div>

              {/* View and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">نمای اتاق</div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="text-2xl">
                      {getViewIcon(room.roomType.viewType)}
                    </span>
                    <span>
                      {room.roomType.viewType === "mountain"
                        ? "نمای کوهستان"
                        : room.roomType.viewType === "city"
                        ? "نمای شهر"
                        : room.roomType.viewType === "garden"
                        ? "نمای باغ"
                        : "نمای استخر"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">دسته‌بندی</div>
                  <div>{getCategoryBadge(room.roomType.category)}</div>
                </div>
              </div>

              {/* Amenities */}
              {room.roomType.amenities &&
                room.roomType.amenities.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">امکانات اتاق</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {room.roomType.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Premium Amenities */}
              {room.roomType.premiumAmenities &&
                room.roomType.premiumAmenities.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium flex items-center gap-2 text-amber-600">
                      <Crown className="h-4 w-4" />
                      امکانات ویژه
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {room.roomType.premiumAmenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 p-2 bg-linear-to-r from-amber-500/10 to-rose-500/10 rounded-lg"
                        >
                          <Crown className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Smoking Policy */}
              <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    room.roomType.smokingAllowed
                      ? "bg-rose-500"
                      : "bg-emerald-500"
                  )}
                />
                <span className="text-sm">
                  {room.roomType.smokingAllowed
                    ? "اتاق مخصوص سیگاری‌ها"
                    : "اتاق غیرسیگاری"}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Room Schedule and Dates */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              برنامه زمان‌بندی
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>زمان نظافت روزانه</span>
                </div>
              </div>

              {room.lastCleaned && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    آخرین نظافت:
                  </span>
                  <span className="font-medium">
                    {format(new Date(room.lastCleaned), "dd MMMM yyyy", {
                      locale: faIR,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {room.notes && (
            <div className="space-y-2">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                یادداشت‌ها
              </h4>
              <Card>
                <CardContent className="p-4 bg-amber-50/50 dark:bg-amber-900/10">
                  <p className="text-sm whitespace-pre-wrap">{room.notes}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Info */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              اطلاعات سیستم
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">ایجاد شده در:</div>
                <div className="font-medium">
                  {format(new Date(room.createdAt), "dd MMMM yyyy", {
                    locale: faIR,
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">آخرین بروزرسانی:</div>
                <div className="font-medium">
                  {format(new Date(room.updatedAt), "dd MMMM yyyy", {
                    locale: faIR,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Add Room Type Dialog Component
function AddRoomTypeDialog({
  isOpen,
  onOpenChange,
  newRoomType,
  setNewRoomType,
  isLoading,
  formErrors,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRoomType: any;
  setNewRoomType: (roomType: any) => void;
  isLoading: boolean;
  formErrors: any;
  onSubmit: () => void;
}) {
  const availableAmenities = [
    "wifi",
    "tv",
    "ac",
    "minibar",
    "gym",
    "parking",
    "pool",
    "spa",
    "restaurant",
    "room-service",
    "safe-box",
    "smart-tv",
    "jacuzzi",
  ];

  const availablePremiumAmenities = [
    "vip-service",
    "private-pool",
    "spa-suite",
    "butler-service",
    "helicopter-tour",
    "private-dining",
    "luxury-transfer",
  ];

  const toggleAmenity = (
    amenity: string,
    type: "amenities" | "premiumAmenities"
  ) => {
    const currentAmenities = newRoomType[type] || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a: string) => a !== amenity)
      : [...currentAmenities, amenity];

    setNewRoomType({
      ...newRoomType,
      [type]: updatedAmenities,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-linear-to-b from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">ایجاد نوع اتاق جدید</DialogTitle>
              <DialogDescription>
                اطلاعات کامل نوع اتاق جدید را وارد کنید
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              اطلاعات پایه
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="roomTypeName"
                  className="flex items-center gap-1"
                >
                  <Hash className="h-3 w-3" />
                  نام نوع اتاق *
                </Label>
                <Input
                  id="roomTypeName"
                  value={newRoomType.name}
                  onChange={(e) =>
                    setNewRoomType({ ...newRoomType, name: e.target.value })
                  }
                  placeholder="مثال: اتاق دلوکس کوهستان"
                  className={cn(
                    formErrors.name && "border-red-500 focus:border-red-500"
                  )}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="roomTypeCode"
                  className="flex items-center gap-1"
                >
                  <Hash className="h-3 w-3" />
                  کد نوع اتاق *
                </Label>
                <Input
                  id="roomTypeCode"
                  value={newRoomType.code}
                  onChange={(e) =>
                    setNewRoomType({
                      ...newRoomType,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="مثال: DLX"
                  className={cn(
                    "uppercase",
                    formErrors.code && "border-red-500 focus:border-red-500"
                  )}
                />
                {formErrors.code && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.code}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">دسته‌بندی *</Label>
                <Select
                  value={newRoomType.category}
                  onValueChange={(
                    value: "luxury" | "executive" | "standard" | "family"
                  ) => setNewRoomType({ ...newRoomType, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        استاندارد
                      </div>
                    </SelectItem>
                    <SelectItem value="executive">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        اجرایی
                      </div>
                    </SelectItem>
                    <SelectItem value="luxury">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        لوکس
                      </div>
                    </SelectItem>
                    <SelectItem value="family">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        خانوادگی
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewType">نمای اتاق</Label>
                <Select
                  value={newRoomType.viewType}
                  onValueChange={(
                    value: "mountain" | "city" | "garden" | "pool"
                  ) => setNewRoomType({ ...newRoomType, viewType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نمای اتاق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">🏙️ نمای شهر</SelectItem>
                    <SelectItem value="mountain">🏔️ نمای کوهستان</SelectItem>
                    <SelectItem value="garden">🌳 نمای باغ</SelectItem>
                    <SelectItem value="pool">🏊 نمای استخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={newRoomType.description}
                onChange={(e) =>
                  setNewRoomType({
                    ...newRoomType,
                    description: e.target.value,
                  })
                }
                placeholder="توضیحات کامل نوع اتاق..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Pricing and Capacity */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              قیمت‌گذاری و ظرفیت
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">قیمت پایه (افغانی) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={newRoomType.basePrice}
                  onChange={(e) =>
                    setNewRoomType({
                      ...newRoomType,
                      basePrice: Number(e.target.value),
                    })
                  }
                  min="0"
                  className={cn(
                    formErrors.basePrice &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {formErrors.basePrice && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.basePrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraPersonPrice">قیمت نفر اضافه</Label>
                <Input
                  id="extraPersonPrice"
                  type="number"
                  value={newRoomType.extraPersonPrice}
                  onChange={(e) =>
                    setNewRoomType({
                      ...newRoomType,
                      extraPersonPrice: Number(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOccupancy">حداکثر ظرفیت *</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  value={newRoomType.maxOccupancy}
                  onChange={(e) =>
                    setNewRoomType({
                      ...newRoomType,
                      maxOccupancy: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="10"
                  className={cn(
                    formErrors.maxOccupancy &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {formErrors.maxOccupancy && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.maxOccupancy}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">مساحت اتاق</Label>
                <Input
                  id="size"
                  value={newRoomType.size}
                  onChange={(e) =>
                    setNewRoomType({ ...newRoomType, size: e.target.value })
                  }
                  placeholder="مثال: 35 m²"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedType">نوع تخت</Label>
                <Input
                  id="bedType"
                  value={newRoomType.bedType}
                  onChange={(e) =>
                    setNewRoomType({ ...newRoomType, bedType: e.target.value })
                  }
                  placeholder="مثال: تخت کینگ"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              امکانات
            </h4>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">امکانات پایه</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableAmenities.map((amenity) => (
                    <div
                      key={amenity}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                        newRoomType.amenities?.includes(amenity)
                          ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      )}
                      onClick={() => toggleAmenity(amenity, "amenities")}
                    >
                      {getAmenityIcon(amenity)}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  امکانات ویژه
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePremiumAmenities.map((amenity) => (
                    <div
                      key={amenity}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                        newRoomType.premiumAmenities?.includes(amenity)
                          ? "bg-amber-100 border-amber-500 dark:bg-amber-900/30"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      )}
                      onClick={() => toggleAmenity(amenity, "premiumAmenities")}
                    >
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              گزینه‌های اضافی
            </h4>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smokingAllowed"
                  checked={newRoomType.smokingAllowed}
                  onChange={(e) =>
                    setNewRoomType({
                      ...newRoomType,
                      smokingAllowed: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="smokingAllowed" className="text-sm">
                  اتاق مخصوص سیگاری‌ها
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !newRoomType.name || !newRoomType.code}
            className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                ایجاد نوع اتاق
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
