import { useState, useEffect } from "react";
import { useDebounce } from "./use-debounce";

export function useSearchFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce search term (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Debounce status filter (200ms delay)
  const debouncedStatusFilter = useDebounce(statusFilter, 200);

  // Track if user is currently typing
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    debouncedSearchTerm,
    debouncedStatusFilter,
    isTyping,
    resetFilters,
  };
}
