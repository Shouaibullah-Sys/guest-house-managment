"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/UsersTable";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
  primaryEmailAddressId?: string;
  publicMetadata: {
    role?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users, roles, and permissions
          </p>
        </div>

        <div className="mb-4">
          <Button onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh Users"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading users...</div>
          </div>
        ) : (
          <UsersTable users={users} onRefresh={fetchUsers} />
        )}
      </main>
    </div>
  );
}
