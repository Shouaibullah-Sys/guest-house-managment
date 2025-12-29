// components/DatabaseStatusIndicator.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DbStatus = "healthy" | "unhealthy" | "checking";

export function DatabaseStatusIndicator() {
  const [dbStatus, setDbStatus] = useState<DbStatus>("checking");

  useEffect(() => {
    checkDatabaseStatus();
    const interval = setInterval(checkDatabaseStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/database/wake", { method: "GET" });
      const data = await response.json();
      setDbStatus(data.healthy ? "healthy" : "unhealthy");
    } catch (error) {
      setDbStatus("unhealthy");
    }
  };

  const wakeDatabase = async () => {
    setDbStatus("checking");
    try {
      const response = await fetch("/api/database/wake", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        setDbStatus("healthy");
        toast.success("Database woken up successfully!");
      } else {
        setDbStatus("unhealthy");
        toast.error("Failed to wake up database");
      }
    } catch (error) {
      setDbStatus("unhealthy");
      toast.error("Error waking up database");
    }
  };

  if (dbStatus === "healthy") {
    return null; // Don't show anything if healthy
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
          dbStatus === "unhealthy"
            ? "bg-red-500 text-white"
            : "bg-yellow-500 text-black"
        }`}
      >
        {dbStatus === "checking" ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Checking database...</span>
          </>
        ) : (
          <>
            <div className="h-3 w-3 rounded-full bg-white animate-pulse"></div>
            <span>Database connection issue</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-white hover:text-white hover:bg-red-600"
              onClick={wakeDatabase}
            >
              Retry
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
