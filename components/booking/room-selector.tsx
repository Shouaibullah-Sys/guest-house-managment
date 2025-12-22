// components/booking/room-selector.tsx

"use client";

import { useState, useEffect } from "react";
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

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  view?: string;
  features?: string[];
  roomType: {
    id: string;
    name: string;
    code: string;
    basePrice: number;
    maxOccupancy: number;
    amenities?: string[];
  };
}

interface RoomSelectorProps {
  onRoomSelect: (room: Room | null) => void;
  disabled?: boolean;
  value?: Room | null;
}

export function RoomSelector({
  onRoomSelect,
  disabled = false,
  value,
}: RoomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);

  // Update selected room when value prop changes
  useEffect(() => {
    setSelectedRoom(value || null);
  }, [value]);

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        params.set("status", "available");

        const response = await fetch(`/api/rooms?${params}`);
        const result = await response.json();

        if (result.success) {
          setRooms(result.data);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchRooms, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      onRoomSelect(room);
    }
  };

  const handleClearSelection = () => {
    setSelectedRoom(null);
    onRoomSelect(null);
  };

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="جستجو اتاق (شماره اتاق یا نوع)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="pr-10"
          />
        </div>
      </div>

      <div className="relative">
        <Select
          value={selectedRoom?.id || ""}
          onValueChange={handleRoomSelect}
          disabled={disabled}
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
                        {room.roomType.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {room.roomType.basePrice.toLocaleString("fa-IR")} افغانی
                      </span>
                      {getStatusBadge(room.status)}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-rooms" disabled>
                هیچ اتاق آماده‌ای یافت نشد
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Room Info */}
      {selectedRoom && (
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

                {selectedRoom.view && (
                  <div className="text-sm text-muted-foreground">
                    نما: {selectedRoom.view}
                  </div>
                )}

                {selectedRoom.features && selectedRoom.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRoom.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {selectedRoom.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedRoom.features.length - 3} مورد دیگر
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
