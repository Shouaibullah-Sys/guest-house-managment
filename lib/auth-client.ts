// lib/auth-client.ts - Client-side authentication utilities
import { useAuth } from "@clerk/nextjs";

/**
 * Custom hook for authenticated API calls
 * Automatically includes Clerk session tokens in requests
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    try {
      // Get the session token using Clerk's default template
      const token = await getToken();

      if (!token) {
        throw new Error("No session token available");
      }

      // Merge headers with authentication
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

      // Provide more specific error messages for common issues
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("JWT template")) {
        throw new Error(
          "Authentication configuration error: JWT template not found. Please check Clerk configuration."
        );
      }

      if (errorMessage.includes("No session token available")) {
        throw new Error("No active session found. Please sign in again.");
      }

      throw error;
    }
  };

  return authenticatedFetch;
}

/**
 * Helper function to check if user has required role
 */
export function useRequireRole(requiredRole: "guest" | "staff" | "admin") {
  const { userId, sessionClaims } = useAuth();

  const metadata = sessionClaims?.metadata as
    | { role?: "guest" | "staff" | "admin"; approved?: boolean }
    | undefined;

  const userRole = metadata?.role || "guest";
  const isApproved = metadata?.approved === true;

  const hasPermission = () => {
    if (!userId || !isApproved) return false;

    const roleHierarchy = {
      guest: ["guest"],
      staff: ["staff", "admin"],
      admin: ["admin"],
    };

    return roleHierarchy[requiredRole].includes(userRole);
  };

  return {
    hasPermission: hasPermission(),
    userRole,
    isApproved,
    userId,
  };
}

/**
 * Auth debugging helper
 */
export function useAuthDebug() {
  const { userId, sessionClaims, isSignedIn } = useAuth();

  const debugInfo = {
    isSignedIn,
    userId,
    sessionClaims,
    metadata: sessionClaims?.metadata,
    hasValidSession: !!userId,
  };

  console.log("🔍 Auth Debug Info:", debugInfo);

  return debugInfo;
}
