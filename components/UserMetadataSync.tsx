// components/UserMetadataSync.tsx
"use client";

import { useUserMetadataSync } from "@/hooks/useUserMetadataSync";

/**
 * Component that automatically synchronizes user metadata
 * Include this in your app layout or key pages
 */
export function UserMetadataSync() {
  const { syncNow } = useUserMetadataSync();

  // This component doesn't render anything visible
  // It just runs the sync effect
  return null;
}
