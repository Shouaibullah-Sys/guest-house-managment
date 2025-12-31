// hooks/useUserMetadataSync.ts
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Hook to synchronize user metadata between Clerk and database
 * Call this in components where you need to ensure metadata consistency
 */
export function useUserMetadataSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Only run on client side when user is loaded and authenticated
    if (!isLoaded || !user) return;

    const syncMetadata = async () => {
      try {
        const response = await fetch("/api/auth/sync-user-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ User metadata synchronized:", data);
        } else {
          console.error("❌ Failed to sync user metadata");
        }
      } catch (error) {
        console.error("💥 Error syncing metadata:", error);
      }
    };

    // Check if user has metadata, if not, trigger sync
    const metadata = user.publicMetadata as any;
    if (!metadata?.role) {
      console.log("🔄 User has no role metadata, syncing...");
      syncMetadata();
    }
  }, [user, isLoaded]);

  // Return a manual sync function
  const syncNow = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/auth/sync-user-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Manual sync completed:", data);
        return data;
      } else {
        console.error("❌ Manual sync failed");
        return null;
      }
    } catch (error) {
      console.error("💥 Manual sync error:", error);
      return null;
    }
  };

  return { syncNow };
}
