"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminSetupPage() {
  const { isSignedIn, userId } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isSignedIn) {
      fetchUserInfo();
    }
  }, [isSignedIn]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/debug/user");
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const setAdminRole = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "✅ Admin role set successfully! You can now access the expenses page."
        );
        fetchUserInfo(); // Refresh user info
      } else {
        setMessage(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage("❌ Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <UserButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Admin Setup</h1>
          <p className="text-gray-600">Set up your admin permissions</p>
        </div>

        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Current Status:</h3>
            {userInfo ? (
              <div className="text-sm space-y-1">
                <p>
                  <strong>User ID:</strong> {userInfo.userId}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  <span className="font-mono">{userInfo.userRole}</span>
                </p>
                <p>
                  <strong>Approved:</strong>{" "}
                  {userInfo.isApproved ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Has Access:</strong>{" "}
                  {userInfo.hasAccess ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                message.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <Button onClick={setAdminRole} disabled={loading} className="w-full">
            {loading ? "Setting Admin Role..." : "Set Admin Role"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            After setting admin role, you can access:
          </p>
          <div className="space-y-1 text-sm">
            <a href="/expenses" className="text-blue-600 hover:underline block">
              • Expenses Management
            </a>
            <a href="/admin" className="text-blue-600 hover:underline block">
              • Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
