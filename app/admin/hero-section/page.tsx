// app/admin/hero-section/page.tsx

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
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Upload,
  Eye,
  EyeOff,
  Move,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import Loader from "@/components/loader";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { uploadFiles } from "@/lib/uploadthing-client";

// Types based on API schema
interface HeroSection {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  imagePath?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: HeroSection[] | HeroSection;
  message?: string;
}

// Zod validation schemas
const heroSectionFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),
  imageUrl: z.string().url("Invalid image URL"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().min(0, "Display order must be 0 or greater"),
});

type HeroSectionFormData = z.infer<typeof heroSectionFormSchema>;

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  displayOrder?: string;
}

// Authenticated fetch function
const createAuthenticatedFetch = (getToken: () => Promise<string | null>) => {
  return async (url: string, options: RequestInit = {}) => {
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

      console.log(`Authenticated fetch to ${url}:`, {
        method: options.method || "GET",
        status: response.status,
        statusText: response.statusText,
      });

      return response;
    } catch (error) {
      console.error("Authenticated fetch error:", error);
      throw error;
    }
  };
};

// Fetch functions
const fetchHeroSections = async (): Promise<HeroSection[]> => {
  try {
    const response = await fetch("/api/hero-section");
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch error response:", errorText);
      throw new Error(
        `Failed to fetch hero sections: ${response.status} ${response.statusText}`
      );
    }
    const result: ApiResponse = await response.json();
    if (!result.success) {
      throw new Error(result.message || "API returned unsuccessful response");
    }
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    console.error("Error in fetchHeroSections:", error);
    throw error;
  }
};

export default function AdminHeroSectionPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // Create authenticated fetch function
  const authenticatedFetch = createAuthenticatedFetch(getToken);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHeroSection, setSelectedHeroSection] =
    useState<HeroSection | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // New hero section state
  const [newHeroSection, setNewHeroSection] = useState<HeroSectionFormData>({
    title: "",
    description: "",
    location: "",
    imageUrl: "",
    isActive: true,
    displayOrder: 0,
  });

  // Queries
  const { data: heroSections = [], isLoading: heroSectionsLoading } = useQuery({
    queryKey: ["heroSections"],
    queryFn: fetchHeroSections,
  });

  // Validation function
  const validateForm = (data: HeroSectionFormData): FormErrors => {
    try {
      heroSectionFormSchema.parse(data);
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

  const handleAddHeroSectionSubmit = () => {
    const errors = validateForm(newHeroSection);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      addHeroSectionMutation.mutate(newHeroSection);
    } else {
      toast.error("Please fix form errors", {
        description: "Some fields need to be corrected.",
      });
    }
  };

  const handleEditHeroSectionSubmit = () => {
    if (!selectedHeroSection) return;

    const editHeroSectionData: HeroSectionFormData = {
      title: selectedHeroSection.title,
      description: selectedHeroSection.description,
      location: selectedHeroSection.location,
      imageUrl: selectedHeroSection.imageUrl,
      isActive: selectedHeroSection.isActive,
      displayOrder: selectedHeroSection.displayOrder,
    };

    const errors = validateForm(editHeroSectionData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      updateHeroSectionMutation.mutate({
        id: selectedHeroSection.id,
        ...editHeroSectionData,
      });
    } else {
      toast.error("Please fix form errors", {
        description: "Some fields need to be corrected.",
      });
    }
  };

  // Image upload function using UploadThing
  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      // Use UploadThing's proper client API
      const result = await uploadFiles.uploadFiles("heroSectionUploader", {
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

  // Mutations
  const addHeroSectionMutation = useMutation({
    mutationFn: async (heroSection: HeroSectionFormData) => {
      console.log("Creating hero section with data:", heroSection);
      const response = await authenticatedFetch("/api/hero-section", {
        method: "POST",
        body: JSON.stringify(heroSection),
      });

      if (!response.ok) {
        let errorMessage = "Failed to add hero section";
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }
        console.error("Add mutation failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Add mutation success:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Add mutation onSuccess:", data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["heroSections"] });

      // Reset form
      setNewHeroSection({
        title: "",
        description: "",
        location: "",
        imageUrl: "",
        isActive: true,
        displayOrder: 0,
      });
      setFormErrors({});

      // Close dialog
      setIsAddDialogOpen(false);

      // Show success message
      toast.success("Hero section created successfully 🎉");
    },
    onError: (error: any) => {
      console.error("Add mutation error:", error);
      toast.error("Error creating hero section", {
        description: error.message || "Unknown error occurred.",
      });
    },
  });

  const updateHeroSectionMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Partial<HeroSection>) => {
      console.log("Updating hero section:", { id, data });
      const response = await authenticatedFetch(`/api/hero-section/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update hero section";
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }
        console.error("Update mutation failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Update mutation success:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Update mutation onSuccess:", data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["heroSections"] });

      // Reset state
      setSelectedHeroSection(null);
      setFormErrors({});

      // Close dialog
      setIsEditDialogOpen(false);

      // Show success message
      toast.success("Hero section updated successfully ✅");
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error);
      toast.error("Error updating hero section", {
        description: error.message || "Unknown error occurred.",
      });
    },
  });

  const deleteHeroSectionMutation = useMutation({
    mutationFn: async (heroSectionId: string) => {
      console.log("Deleting hero section:", heroSectionId);
      const response = await authenticatedFetch(
        `/api/hero-section/${heroSectionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to delete hero section";
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }
        console.error("Delete mutation failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Delete mutation success:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Delete mutation onSuccess:", data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["heroSections"] });

      // Reset state
      setSelectedHeroSection(null);

      // Close dialog
      setIsDeleteDialogOpen(false);

      // Show success message
      toast.success("Hero section deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      toast.error("Error deleting hero section", {
        description: error.message || "Unknown error occurred.",
      });
    },
  });

  // Filter hero sections
  const filteredHeroSections = heroSections.filter((heroSection) => {
    const matchesSearch =
      !searchTerm ||
      heroSection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heroSection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heroSection.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && heroSection.isActive) ||
      (statusFilter === "inactive" && !heroSection.isActive);

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-emerald-500 hover:bg-emerald-600">
        <Check className="h-3 w-3 ml-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">
        <EyeOff className="h-3 w-3 ml-1" />
        Inactive
      </Badge>
    );
  };

  if (heroSectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <Loader title="Loading hero sections" subtitle="Please wait a moment" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  🖼️ Hero Section Management
                </h1>
                <p className="text-blue-100">
                  Manage your homepage hero sections
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/20">
                <ImageIcon className="h-3 w-3 ml-1" />
                {heroSections.length} Total Sections
              </Badge>
              <Badge variant="secondary" className="bg-white/20">
                <Check className="h-3 w-3 ml-1" />
                {heroSections.filter((h) => h.isActive).length} Active
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
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
            </Button>

            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["heroSections"] })
              }
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              Refresh
            </Button>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-lg"
            >
              <Plus className="ml-2 h-4 w-4" />
              Add Hero Section
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-100 dark:border-blue-900 bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Sections
                </p>
                <p className="text-2xl font-bold mt-1">{heroSections.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ImageIcon className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    All hero sections
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-100 dark:border-emerald-900 bg-linear-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Active Sections
                </p>
                <p className="text-2xl font-bold mt-1">
                  {heroSections.filter((h) => h.isActive).length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    Currently displayed
                  </span>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 dark:border-amber-900 bg-linear-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Inactive Sections
                </p>
                <p className="text-2xl font-bold mt-1">
                  {heroSections.filter((h) => !h.isActive).length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <EyeOff className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Not displayed
                  </span>
                </div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <EyeOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Hero Sections
              </CardTitle>
              <CardDescription>
                Manage {heroSections.length} hero sections for your homepage
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 bg-white dark:bg-gray-800"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active" className="text-emerald-600">
                    <Check className="h-3 w-3 ml-1 inline" />
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="text-gray-600">
                    <EyeOff className="h-3 w-3 ml-1 inline" />
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredHeroSections.length} sections found
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  <X className="ml-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Sections Table */}
          <div className="rounded-lg border-2 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-linear-to-r from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
                  <TableRow>
                    <TableHead className="font-bold">Order</TableHead>
                    <TableHead className="font-bold">Image</TableHead>
                    <TableHead className="font-bold">Title</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Created</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHeroSections
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((heroSection) => (
                      <TableRow
                        key={heroSection.id}
                        className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            {heroSection.displayOrder}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={heroSection.imageUrl}
                              alt={heroSection.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.png";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium max-w-[200px]">
                            <div className="truncate">{heroSection.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{heroSection.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {heroSection.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(heroSection.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              new Date(heroSection.createdAt),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedHeroSection(heroSection);
                                setIsEditDialogOpen(true);
                              }}
                              className="hover:bg-emerald-100 hover:text-emerald-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedHeroSection(heroSection);
                                setIsDeleteDialogOpen(true);
                              }}
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

          {filteredHeroSections.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No hero sections found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No hero sections match your current filters"
                  : "Get started by creating your first hero section"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Hero Section Dialog */}
      <AddHeroSectionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setFormErrors({});
          }
        }}
        newHeroSection={newHeroSection}
        setNewHeroSection={setNewHeroSection}
        isLoading={addHeroSectionMutation.isPending}
        formErrors={formErrors}
        onSubmit={handleAddHeroSectionSubmit}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />

      {/* Edit Hero Section Dialog */}
      <EditHeroSectionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setFormErrors({});
          }
        }}
        heroSection={selectedHeroSection}
        setHeroSection={setSelectedHeroSection}
        isLoading={updateHeroSectionMutation.isPending}
        formErrors={formErrors}
        onSubmit={handleEditHeroSectionSubmit}
        onImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />

      {/* Delete Hero Section Dialog */}
      <DeleteHeroSectionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        heroSection={selectedHeroSection}
        isLoading={deleteHeroSectionMutation.isPending}
        onConfirm={() => {
          if (selectedHeroSection) {
            deleteHeroSectionMutation.mutate(selectedHeroSection.id);
          }
        }}
      />
    </div>
  );
}

// Add Hero Section Dialog Component
function AddHeroSectionDialog({
  isOpen,
  onOpenChange,
  newHeroSection,
  setNewHeroSection,
  isLoading,
  formErrors,
  onSubmit,
  onImageUpload,
  uploadingImage,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newHeroSection: HeroSectionFormData;
  setNewHeroSection: (heroSection: HeroSectionFormData) => void;
  isLoading: boolean;
  formErrors: FormErrors;
  onSubmit: () => void;
  onImageUpload: (file: File) => Promise<string>;
  uploadingImage: boolean;
}) {
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await onImageUpload(file);
        setNewHeroSection({ ...newHeroSection, imageUrl });
      } catch (error) {
        // Error is handled in the parent component
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-linear-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add Hero Section</DialogTitle>
              <DialogDescription>
                Create a new hero section for your homepage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Title *
            </Label>
            <Input
              id="title"
              value={newHeroSection.title}
              onChange={(e) =>
                setNewHeroSection({ ...newHeroSection, title: e.target.value })
              }
              placeholder="Enter hero section title"
              className={cn(
                formErrors.title && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location *
            </Label>
            <Input
              id="location"
              value={newHeroSection.location}
              onChange={(e) =>
                setNewHeroSection({
                  ...newHeroSection,
                  location: e.target.value,
                })
              }
              placeholder="Enter location"
              className={cn(
                formErrors.location && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.location && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={newHeroSection.description}
              onChange={(e) =>
                setNewHeroSection({
                  ...newHeroSection,
                  description: e.target.value,
                })
              }
              placeholder="Enter description"
              rows={3}
              className={cn(
                "resize-none",
                formErrors.description && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {newHeroSection.description.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {newHeroSection.imageUrl ? (
                  <img
                    src={newHeroSection.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
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
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </Label>
              </div>
            </div>
            {formErrors.imageUrl && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.imageUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order *</Label>
              <Input
                id="displayOrder"
                type="number"
                value={newHeroSection.displayOrder}
                onChange={(e) =>
                  setNewHeroSection({
                    ...newHeroSection,
                    displayOrder: Number(e.target.value),
                  })
                }
                min="0"
                className={cn(
                  formErrors.displayOrder &&
                    "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.displayOrder && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.displayOrder}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newHeroSection.isActive}
                  onChange={(e) =>
                    setNewHeroSection({
                      ...newHeroSection,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="text-sm">
                  Active (visible on homepage)
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
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isLoading || !newHeroSection.title || !newHeroSection.imageUrl
            }
            className="flex-1 bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                Create Hero Section
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Hero Section Dialog Component
function EditHeroSectionDialog({
  isOpen,
  onOpenChange,
  heroSection,
  setHeroSection,
  isLoading,
  formErrors,
  onSubmit,
  onImageUpload,
  uploadingImage,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  heroSection: HeroSection | null;
  setHeroSection: (heroSection: HeroSection | null) => void;
  isLoading: boolean;
  formErrors: FormErrors;
  onSubmit: () => void;
  onImageUpload: (file: File) => Promise<string>;
  uploadingImage: boolean;
}) {
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});

  if (!heroSection) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await onImageUpload(file);
        setHeroSection({ ...heroSection, imageUrl });
      } catch (error) {
        // Error is handled in the parent component
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-linear-to-b from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
              <Edit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Hero Section</DialogTitle>
              <DialogDescription>
                Update hero section information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Title *
            </Label>
            <Input
              id="edit-title"
              value={heroSection.title}
              onChange={(e) =>
                setHeroSection({ ...heroSection, title: e.target.value })
              }
              className={cn(
                formErrors.title && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location *
            </Label>
            <Input
              id="edit-location"
              value={heroSection.location}
              onChange={(e) =>
                setHeroSection({ ...heroSection, location: e.target.value })
              }
              className={cn(
                formErrors.location && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.location && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={heroSection.description}
              onChange={(e) =>
                setHeroSection({ ...heroSection, description: e.target.value })
              }
              rows={3}
              className={cn(
                "resize-none",
                formErrors.description && "border-red-500 focus:border-red-500"
              )}
            />
            {formErrors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {heroSection.description.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Image *</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                <img
                  src={heroSection.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="edit-image"
                  accept="image/*"
                  onChange={handleImageChange}
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
                  {uploadingImage ? "Uploading..." : "Change Image"}
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-displayOrder">Display Order *</Label>
              <Input
                id="edit-displayOrder"
                type="number"
                value={heroSection.displayOrder}
                onChange={(e) =>
                  setHeroSection({
                    ...heroSection,
                    displayOrder: Number(e.target.value),
                  })
                }
                min="0"
                className={cn(
                  formErrors.displayOrder &&
                    "border-red-500 focus:border-red-500"
                )}
              />
              {formErrors.displayOrder && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.displayOrder}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={heroSection.isActive}
                  onChange={(e) =>
                    setHeroSection({
                      ...heroSection,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-isActive" className="text-sm">
                  Active (visible on homepage)
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
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isLoading ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="ml-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Hero Section Dialog Component
function DeleteHeroSectionDialog({
  isOpen,
  onOpenChange,
  heroSection,
  isLoading,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  heroSection: HeroSection | null;
  isLoading: boolean;
  onConfirm: () => void;
}) {
  if (!heroSection) return null;

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
                Delete Hero Section
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this hero section?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={heroSection.imageUrl}
                  alt={heroSection.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-lg">{heroSection.title}</h4>
                <p className="text-muted-foreground">
                  {heroSection.location} • Order: {heroSection.displayOrder}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Warning</p>
                <p className="text-sm">
                  This action cannot be undone. The hero section will be
                  permanently removed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Consequences:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  Hero section will be permanently deleted
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  Image will remain in storage but won't be used
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-3 w-3 text-rose-500 mt-0.5" />
                  Cannot be recovered
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
            Cancel
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="ml-2 h-4 w-4" />
                Delete Hero Section
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
