// components/admin/AdminAccessButton.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAccessButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function AdminAccessButton({
  className = "",
  variant = "outline",
  size = "default",
}: AdminAccessButtonProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "staff";

  if (!isLoaded || !isAdmin) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push("/admin")}
      className={`flex items-center gap-2 ${className}`}
      title="Admin Dashboard"
    >
      <Settings className="h-4 w-4" />
      <span>Admin</span>
    </Button>
  );
}

export default AdminAccessButton;
