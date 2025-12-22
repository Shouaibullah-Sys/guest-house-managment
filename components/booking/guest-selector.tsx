// components/booking/guest-selector.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Search, X, UserPlus } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
}

interface GuestSelectorProps {
  onGuestSelect: (guest: Guest | null) => void;
  onNewGuest: () => void;
  disabled?: boolean;
  value?: Guest | null;
}

export function GuestSelector({
  onGuestSelect,
  onNewGuest,
  disabled = false,
  value,
}: GuestSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(
    value || null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Update selected guest when value prop changes
  useEffect(() => {
    setSelectedGuest(value || null);
    if (value) {
      setSearchQuery(value.name);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search guests
  useEffect(() => {
    const searchGuests = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/guests?search=${encodeURIComponent(searchQuery)}&limit=10`
        );

        if (!response.ok) {
          console.error(
            "Guest search failed:",
            response.status,
            response.statusText
          );
          return;
        }

        const result = await response.json();
        console.log("Guest search result:", result); // Debug log

        if (result.data && Array.isArray(result.data)) {
          setSearchResults(result.data);
          setShowResults(true);
        } else {
          console.log("No guest data found or invalid format");
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching guests:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchGuests, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setSearchQuery(guest.name);
    setShowResults(false);
    onGuestSelect(guest);
  };

  const handleClearSelection = () => {
    setSelectedGuest(null);
    setSearchQuery("");
    setSearchResults([]);
    onGuestSelect(null);
  };

  const handleNewGuest = () => {
    handleClearSelection();
    onNewGuest();
  };

  return (
    <div className="space-y-3" ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="جستجو میهمان (نام، ایمیل یا شماره تماس)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true);
              }}
              disabled={disabled}
              className="pr-10 border-border focus:border-primary focus:ring-primary/20"
            />
            {selectedGuest && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClearSelection}
                disabled={disabled}
                className="absolute left-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => handleSelectGuest(guest)}
                  className="w-full text-right p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {guest.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          ID: {guest.id.substring(0, 8)}...
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {guest.email}
                      </div>
                      {guest.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults &&
            searchQuery.trim().length >= 2 &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                <p>میهمان یافت نشد</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleNewGuest}
                  className="mt-2"
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  ایجاد میهمان جدید
                </Button>
              </div>
            )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleNewGuest}
          disabled={disabled}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <UserPlus className="ml-2 h-4 w-4" />
          میهمان جدید
        </Button>
      </div>

      {/* Selected Guest Info */}
      {selectedGuest && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {selectedGuest.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  ID: {selectedGuest.id.substring(0, 8)}...
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedGuest.email}
              </div>
              {selectedGuest.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{selectedGuest.phone}</span>
                </div>
              )}
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
