// app/admin/diagnostic/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRequireRole } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserDiagnosticData {
  userInfo: {
    id: string;
    email: string;
    name: string;
    clerkRole?: string;
    clerkApproved?: boolean;
    dbRole?: string;
    dbApproved?: boolean;
    isActive: boolean;
    issues: string[];
  };
  diagnosis: string[];
  actionResult?: {
    success: boolean;
    message: string;
  };
}

export default function UserDiagnosticPage() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const { hasPermission, isApproved } = useRequireRole("admin");
  const [userIdToCheck, setUserIdToCheck] = useState("");
  const [diagnosticData, setDiagnosticData] =
    useState<UserDiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authorized
  useEffect(() => {
    if (isSignedIn && !hasPermission) {
      router.push("/unauthorized");
    }
  }, [isSignedIn, hasPermission, router]);

  const fetchDiagnostic = async (targetUserId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userIdParam = targetUserId || userIdToCheck || userId;
      if (!userIdParam) {
        setError("No user ID provided");
        return;
      }

      const response = await fetch(
        `/api/admin/user-diagnostic?userId=${userIdParam}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch diagnostic"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const performAction = async (action: string, role?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const targetUserId = userIdToCheck || userId;
      if (!targetUserId) {
        setError("No user ID provided");
        return;
      }

      const body: any = { targetUserId, action };
      if (role) body.role = role;

      const response = await fetch("/api/admin/user-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Refresh diagnostic data
      await fetchDiagnostic(targetUserId);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn || !hasPermission) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <p>Checking permissions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Diagnostic</h1>
          <p className="text-muted-foreground mt-2">
            Diagnose and fix user authentication and authorization issues
          </p>
        </div>
        <Button onClick={() => fetchDiagnostic()} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* User ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>User Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID to check (leave empty for current user)"
              value={userIdToCheck}
              onChange={(e) => setUserIdToCheck(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => fetchDiagnostic()}
              disabled={isLoading}
              variant="outline"
            >
              Check User
            </Button>
            <Button
              onClick={() => fetchDiagnostic(userId || "")}
              disabled={isLoading}
            >
              Check Current User
            </Button>
          </div>
          {userId && (
            <p className="text-sm text-muted-foreground">
              Current user ID: {userId}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Diagnostic Results */}
      {diagnosticData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">
                  {diagnosticData.userInfo.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">
                  {diagnosticData.userInfo.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">User ID</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {diagnosticData.userInfo.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Clerk Role</label>
                  <Badge
                    variant={
                      diagnosticData.userInfo.clerkRole === "admin"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {diagnosticData.userInfo.clerkRole || "None"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">DB Role</label>
                  <Badge
                    variant={
                      diagnosticData.userInfo.dbRole === "admin"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {diagnosticData.userInfo.dbRole || "None"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Clerk Approved</label>
                  <div className="flex items-center gap-2">
                    {diagnosticData.userInfo.clerkApproved ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {diagnosticData.userInfo.clerkApproved ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">DB Approved</label>
                  <div className="flex items-center gap-2">
                    {diagnosticData.userInfo.dbApproved ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {diagnosticData.userInfo.dbApproved ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Active Status</label>
                <div className="flex items-center gap-2">
                  {diagnosticData.userInfo.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {diagnosticData.userInfo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagnosticData.diagnosis.map((item, index) => (
                  <div key={index} className="text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Results */}
      {diagnosticData?.actionResult && (
        <Alert
          variant={
            diagnosticData.actionResult.success ? "default" : "destructive"
          }
        >
          <AlertDescription>
            {diagnosticData.actionResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      {diagnosticData && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={() => performAction("sync")}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Sync Data
              </Button>
              <Button
                onClick={() => performAction("approve")}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Approve User
              </Button>
              <Button
                onClick={() => performAction("set-role", "admin")}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Make Admin
              </Button>
              <Button
                onClick={() => performAction("set-role", "staff")}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Make Staff
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Result */}
      {diagnosticData?.actionResult && (
        <Alert
          variant={
            diagnosticData.actionResult.success ? "default" : "destructive"
          }
        >
          <AlertDescription>
            {diagnosticData.actionResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
