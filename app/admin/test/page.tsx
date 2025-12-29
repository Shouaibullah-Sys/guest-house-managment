// app/admin/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader, AlertTriangle } from "lucide-react";

interface ApiTest {
  name: string;
  endpoint: string;
  status: "pending" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function AdminTestPage() {
  const [tests, setTests] = useState<ApiTest[]>([
    {
      name: "Hotel Stats",
      endpoint: "/api/dashboard/hotel-stats",
      status: "pending",
    },
    {
      name: "Booking Trends",
      endpoint: "/api/dashboard/booking-trends",
      status: "pending",
    },
    {
      name: "Guest Analytics",
      endpoint: "/api/dashboard/guest-analytics",
      status: "pending",
    },
    {
      name: "Revenue Analytics",
      endpoint: "/api/dashboard/revenue-analytics",
      status: "pending",
    },
    { name: "Room Stats", endpoint: "/api/rooms/stats", status: "pending" },
    { name: "Rooms List", endpoint: "/api/rooms", status: "pending" },
    { name: "Bookings", endpoint: "/api/bookings", status: "pending" },
  ]);

  const runTest = async (testIndex: number) => {
    const test = tests[testIndex];
    if (test.status === "loading") return;

    // Update status to loading
    setTests((prev) =>
      prev.map((t, i) => (i === testIndex ? { ...t, status: "loading" } : t))
    );

    const startTime = Date.now();

    try {
      const response = await fetch(test.endpoint);
      const data = await response.json();
      const responseTime = Date.now() - startTime;

      setTests((prev) =>
        prev.map((t, i) =>
          i === testIndex
            ? {
                ...t,
                status: response.ok ? "success" : "error",
                data: response.ok ? data : null,
                error: response.ok
                  ? undefined
                  : data.error || `HTTP ${response.status}`,
                responseTime,
              }
            : t
        )
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTests((prev) =>
        prev.map((t, i) =>
          i === testIndex
            ? {
                ...t,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
                responseTime,
              }
            : t
        )
      );
    }
  };

  const runAllTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const getStatusIcon = (status: ApiTest["status"]) => {
    switch (status) {
      case "loading":
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ApiTest["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Loading</Badge>;
      case "success":
        return <Badge className="bg-green-600">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard Test Page
          </h1>
          <p className="text-gray-600">
            Test all API endpoints and dashboard functionality
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Endpoint Tests</CardTitle>
                <CardDescription>
                  Click individual tests or run all tests to check dashboard
                  functionality
                </CardDescription>
              </div>
              <Button onClick={runAllTests} className="flex items-center gap-2">
                Run All Tests
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div
                  key={test.endpoint}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {test.endpoint}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {test.responseTime && (
                      <span className="text-xs text-gray-400">
                        {test.responseTime}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(index)}
                      disabled={test.status === "loading"}
                    >
                      {test.status === "pending" ? "Test" : "Retest"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {tests.some((t) => t.status === "success" || t.status === "error") && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                API response data and error details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests
                  .filter((t) => t.status === "success" || t.status === "error")
                  .map((test) => (
                    <div key={test.endpoint} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <span className="text-xs text-gray-500">
                          {test.endpoint}
                        </span>
                      </div>

                      {test.status === "success" && test.data && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            Success Response:
                          </p>
                          <pre className="text-xs text-green-700 overflow-auto max-h-32">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {test.status === "error" && test.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm font-medium text-red-800 mb-2">
                            Error Details:
                          </p>
                          <p className="text-sm text-red-700">{test.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => (window.location.href = "/admin")}
            className="mr-4"
          >
            Go to Admin Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
