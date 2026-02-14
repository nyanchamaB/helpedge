"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  User,
  getAllUsers,
  getUserDisplayName,
  getRoleDisplayString,
  getRoleBadgeColor,
  UserRoleString,
  activateUser,
  deactivateUser,
} from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Mail,
  Phone,
  Building,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Users,
} from "lucide-react";

type SortField = "fullName" | "email" | "role" | "department" | "isActive" | "lastLoginAt";
type SortDirection = "asc" | "desc";

/**
 * Team Members Page
 * Displays all users based on role permissions:
 * - Admin: Full access to all users
 * - ITManager: Full access to all users
 * - TeamLead: Access to team members only (filtered by backend)
 */
export default function TeamMembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Sort states
  const [sortField, setSortField] = useState<SortField>("fullName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Roles that can access this page
  const allowedRoles = ["Admin", "ITManager", "TeamLead"];

  useEffect(() => {
    if (!authLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    }
  }, [authLoading, user]);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);

    const response = await getAllUsers();

    if (response.success && response.data) {
      setUsers(response.data);
    } else {
      setError(response.error || "Failed to load users");
    }

    setIsLoading(false);
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter and sort users
  const filteredAndSortedUsers = (() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(query) ||
          u.firstName?.toLowerCase().includes(query) ||
          u.lastName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.department?.toLowerCase().includes(query) ||
          u.jobTitle?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((u) => u.isActive === isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "fullName":
          comparison = (a.fullName || "").localeCompare(b.fullName || "");
          break;
        case "email":
          comparison = (a.email || "").localeCompare(b.email || "");
          break;
        case "role":
          comparison = (a.role || "").localeCompare(b.role || "");
          break;
        case "department":
          comparison = (a.department || "").localeCompare(b.department || "");
          break;
        case "isActive":
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
        case "lastLoginAt":
          const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  })();

  // Handle activate/deactivate user
  async function handleToggleUserStatus() {
    if (!selectedUser) return;

    setIsUpdatingStatus(true);

    const response = selectedUser.isActive
      ? await deactivateUser(selectedUser.id)
      : await activateUser(selectedUser.id);

    if (response.success) {
      // Update user in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, isActive: !selectedUser.isActive } : u
        )
      );
      setIsStatusDialogOpen(false);
      setSelectedUser(null);
    } else {
      setError(response.error || "Failed to update user status");
    }

    setIsUpdatingStatus(false);
  }

  // Get unique roles from users for filter
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).sort();

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Members
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "TeamLead"
              ? "View and manage your team members"
              : "View and manage all users in the system"}
          </p>
        </div>
      </div>

      {/* Users Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedUsers.length} of {users.length} users
              </span>
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayString(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Loading users...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchUsers} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          )}

          {/* Users table */}
          {!isLoading && !error && filteredAndSortedUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("fullName")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Name {getSortIcon("fullName")}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("email")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Email {getSortIcon("email")}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("role")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Role {getSortIcon("role")}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("department")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Department {getSortIcon("department")}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("isActive")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Status {getSortIcon("isActive")}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort("lastLoginAt")}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Last Login {getSortIcon("lastLoginAt")}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {u.firstName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getUserDisplayName(u)}
                            </p>
                            {u.jobTitle && (
                              <p className="text-xs text-gray-500">{u.jobTitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getRoleBadgeColor(u.role)}>
                          {getRoleDisplayString(u.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {u.department || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            u.isActive
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {u.lastLoginAt
                          ? format(new Date(u.lastLoginAt), "MMM d, yyyy h:mm a")
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {(user?.role === "Admin" || user?.role === "ITManager") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setIsStatusDialogOpen(true);
                                  }}
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-medium text-gray-600">
                  {selectedUser.firstName?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {getUserDisplayName(selectedUser)}
                  </h3>
                  <Badge variant="outline" className={getRoleBadgeColor(selectedUser.role)}>
                    {getRoleDisplayString(selectedUser.role)}
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{selectedUser.email}</span>
                </div>
                {selectedUser.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedUser.phoneNumber}</span>
                  </div>
                )}
                {selectedUser.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{selectedUser.department}</span>
                  </div>
                )}
                {selectedUser.jobTitle && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">Job Title:</span>
                    <span>{selectedUser.jobTitle}</span>
                  </div>
                )}
                {selectedUser.officeLocation && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">Office:</span>
                    <span>{selectedUser.officeLocation}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.isActive
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Last Login</span>
                  <span>
                    {selectedUser.lastLoginAt
                      ? format(new Date(selectedUser.lastLoginAt), "MMM d, yyyy h:mm a")
                      : "Never"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Created</span>
                  <span>{format(new Date(selectedUser.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activate/Deactivate Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isActive ? "Deactivate User" : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isActive
                ? `Are you sure you want to deactivate ${getUserDisplayName(selectedUser)}? They will no longer be able to log in.`
                : `Are you sure you want to activate ${selectedUser ? getUserDisplayName(selectedUser) : ""}? They will be able to log in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={handleToggleUserStatus}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus
                ? "Updating..."
                : selectedUser?.isActive
                ? "Deactivate"
                : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
