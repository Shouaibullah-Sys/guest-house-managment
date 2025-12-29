// components/booking/room-selector.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Search, X } from "lucide-react";
import { roomResponseSchema, type RoomResponse } from "@/lib/validation/room";
import { z } from "zod";

// Validate room response data
const validateRoom = (room: any): RoomResponse | null => {
  try {
    return roomResponseSchema.parse(room);
  } catch (error) {
    console.error("Invalid room data:", error);
    return null;
  }
};

interface RoomSelectorProps {
  onRoomSelect: (room: RoomResponse | null) => void;
  disabled?: boolean;
  value?: RoomResponse | null;
}

export function RoomSelector({
  onRoomSelect,
  disabled = false,
  value,
}: RoomSelectorProps) {
  const { getToken, isLoaded, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated fetch function
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    try {
      if (!isLoaded || !userId) {
        throw new Error('Authentication not loaded');
      }

      const token = await getToken();
      if (!token) {
        throw new Error('No session token available');
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

  // Update selected room when value prop changes
  useEffect(() => {
    setSelectedRoom(value || null);
  }, [value]);

  // Fetch available rooms with validation
  useEffect(() => {
    const fetchRooms = async () => {
      if (!isLoaded || !userId) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
          // Validate search query using our schema
          if (searchQuery.length <= 100) {
            params.set("search", searchQuery.trim());
          }
        }
        params.set("status", "available");
        params.set("limit", "50"); // Limit results for performance

        const response = await authenticatedFetch(`/api/rooms?${params}`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Validate each room data
          const validatedRooms = result.data
            .map((room: any) => validateRoom(room))
            .filter((room: RoomResponse | null): room is RoomResponse => room !== null);
          
          setRooms(validatedRooms);
        } else {
          console.error("Invalid response format:", result);
          setError("فرمت پاسخ نامعتبر است");
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError(error instanceof Error ? error.message : "خطا در بارگذاری اتاق‌ها");
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchRooms, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isLoaded, userId]);

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      // Additional runtime validation
      const validatedRoom = validateRoom(room);
      if (validatedRoom && validatedRoom.roomType) {
        setSelectedRoom(validatedRoom);
        onRoomSelect(validatedRoom);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedRoom(null);
    onRoomSelect(null);
  };

  const getStatusBadge = (status: string) => {
    // Use constants from validation schema for type safety
    const validStatuses = ["available", "occupied", "maintenance", "cleaning", "reserved"];
    
    if (!validStatuses.includes(status)) {
      return (
        <Badge variant="outline">
          <Building className="h-3 w-3 ml-1" />
          {status}
        </Badge>
      );
    }

    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-600">
            <Building className="h-3 w-3 ml-1" />
            آماده
          </Badge>
        );
      case "occupied":
        return (
          <Badge className="bg-red-600">
            <Building className="h-3 w-3 ml-1" />
            اشغال شده
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="destructive">
            <Building className="h-3 w-3 ml-1" />
            تعمیر
          </Badge>
        );
      case "cleaning":
        return (
          <Badge className="bg-blue-600">
            <Building className="h-3 w-3 ml-1" />
            تمیزکاری
          </Badge>
        );
      case "reserved":
        return (
          <Badge className="bg-amber-600">
            <Building className="h-3 w-3 ml-1" />
            رزرو شده
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Building className="h-3 w-3 ml-1" />
            {status}
          </Badge>
        );
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="جستجو اتاق (شماره اتاق یا نوع)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))} // Limit input length
            disabled={disabled || !userId}
            className="pr-10"
            maxLength={100}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <Select
          value={selectedRoom?.id || ""}
          onValueChange={handleRoomSelect}
          disabled={disabled || !userId || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="انتخاب اتاق" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                در حال بارگذاری...
              </SelectItem>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">
                        اتاق {room.roomNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {room.roomType?.name || "نامشخص"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {room.roomType?.basePrice.toLocaleString("fa-IR") || "0"} افغانی
                      </span>
                      {getStatusBadge(room.status)}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-rooms" disabled>
                {error ? "خطا در بارگذاری" : "هیچ اتاق آماده‌ای یافت نشد"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Room Info */}
      {selectedRoom && selectedRoom.roomType && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  اتاق {selectedRoom.roomNumber}
                </span>
                <Badge variant="secondary" className="text-xs">
                  طبقه {selectedRoom.floor}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedRoom.roomType.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ظرفیت: {selectedRoom.roomType.maxOccupancy} نفر
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">
                    {selectedRoom.roomType.basePrice.toLocaleString("fa-IR")}{" "}
                    افغانی
                  </span>
                  <span className="text-sm text-muted-foreground">/شب</span>
                </div>

                {selectedRoom.roomType.viewType && (
                  <div className="text-sm text-muted-foreground">
                    نما: {selectedRoom.roomType.viewType}
                  </div>
                )}

                {selectedRoom.roomType.amenities && selectedRoom.roomType.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRoom.roomType.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {selectedRoom.roomType.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedRoom.roomType.amenities.length - 3} مورد دیگر
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearSelection}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
