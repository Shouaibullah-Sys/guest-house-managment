// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/UsersTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, RefreshCw, Search } from "lucide-react";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
  primaryEmailAddressId?: string;
  imageUrl?: string;
  publicMetadata: {
    role?: "guest" | "staff" | "admin";
    approved?: boolean;
  };
  banned?: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt?: number;
  dbData?: {
    phone?: string;
    dateOfBirth?: Date;
    nationality?: string;
    loyaltyPoints: number;
    totalStays: number;
    totalSpent: number;
    staffProfile?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  isActive: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") {
        if (statusFilter === "approved") params.append("approved", "true");
        else if (statusFilter === "pending") params.append("approved", "false");
        else if (statusFilter === "active") params.append("active", "true");
        else if (statusFilter === "inactive") params.append("active", "false");
      }

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 1,
          }
        );
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

  const handleSetRole = async (
    userId: string,
    role: "guest" | "staff" | "admin"
  ) => {
    const formData = new FormData();
    formData.append("id", userId);
    formData.append("role", role);

    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      } else {
        const error = await response.json();
        console.error("Failed to update role:", error);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("id", userId);

    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      } else {
        const error = await response.json();
        console.error("Failed to approve user:", error);
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("id", userId);

    const endpoint = isActive
      ? "/api/admin/users/disable"
      : "/api/admin/users/enable";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      } else {
        const error = await response.json();
        console.error("Failed to toggle user status:", error);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      } else {
        const error = await response.json();
        console.error("Failed to delete user:", error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSyncMetadata = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/sync-user-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Metadata synced successfully:", data);
        fetchUsers(pagination.page); // Refresh to show updated data
      } else {
        const error = await response.json();
        console.error("Failed to sync metadata:", error);
        alert("Failed to sync metadata: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error syncing metadata:", error);
      alert("Error syncing metadata: " + error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "staff":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "guest":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeColor = (user: User) => {
    if (user.banned || !user.isActive) return "bg-red-100 text-red-800";
    if (!user.publicMetadata.approved) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (user: User) => {
    if (user.banned || !user.isActive) return "Banned";
    if (!user.publicMetadata.approved) return "Pending";
    return "Active";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto flex-grow p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users, roles, and permissions across the system
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter users by role and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  onClick={() => fetchUsers(pagination.page)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading users...</div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Users ({pagination.total})</CardTitle>
                  <CardDescription>
                    Page {pagination.page} of {pagination.pages}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-4 text-left font-medium text-gray-700">
                          User
                        </th>
                        <th className="p-4 text-left font-medium text-gray-700">
                          Role
                        </th>
                        <th className="p-4 text-left font-medium text-gray-700">
                          Status
                        </th>
                        <th className="p-4 text-left font-medium text-gray-700">
                          Last Sign In
                        </th>
                        <th className="p-4 text-left font-medium text-gray-700">
                          Joined
                        </th>
                        <th className="p-4 text-left font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">
                                      {(
                                        user.firstName?.[0] ||
                                        user.emailAddresses[0]
                                          ?.emailAddress[0] ||
                                        "U"
                                      ).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">
                                    {user.fullName || "Unnamed User"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.emailAddresses.find(
                                      (e) => e.id === user.primaryEmailAddressId
                                    )?.emailAddress ||
                                      user.emailAddresses[0]?.emailAddress}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                className={getRoleBadgeColor(
                                  user.publicMetadata.role
                                )}
                              >
                                {user.publicMetadata.role || "No role"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusBadgeColor(user)}>
                                {getStatusText(user)}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {user.lastSignInAt
                                ? formatDate(user.lastSignInAt)
                                : "Never"}
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  {!user.publicMetadata.approved &&
                                    !user.banned &&
                                    user.isActive && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleApproveUser(user.id)
                                        }
                                      >
                                        Approve User
                                      </DropdownMenuItem>
                                    )}

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSetRole(user.id, "guest")
                                    }
                                    disabled={
                                      user.publicMetadata.role === "guest"
                                    }
                                  >
                                    Set as Guest
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSetRole(user.id, "staff")
                                    }
                                    disabled={
                                      user.publicMetadata.role === "staff"
                                    }
                                  >
                                    Set as Staff
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSetRole(user.id, "admin")
                                    }
                                    disabled={
                                      user.publicMetadata.role === "admin"
                                    }
                                  >
                                    Set as Admin
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => handleSyncMetadata(user.id)}
                                  >
                                    Sync Metadata
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleStatus(
                                        user.id,
                                        user.isActive && !user.banned
                                      )
                                    }
                                    className={
                                      user.banned || !user.isActive
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {user.banned || !user.isActive
                                      ? "Enable User"
                                      : "Disable User"}
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600"
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fetchUsers(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => fetchUsers(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
