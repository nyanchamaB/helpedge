"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
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
  Ticket,
  TicketStatusString,
  TicketPriorityString,
  getStatusString,
  getPriorityString,
} from "@/lib/api/tickets";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface TicketsTableProps {
  tickets: Ticket[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  title?: string;
  showFilters?: boolean;
  emptyMessage?: string;
}

type SortField = "ticketNumber" | "subject" | "status" | "priority" | "createdAt";
type SortDirection = "asc" | "desc";

// Status badge styling
function getStatusBadgeStyle(status: TicketStatusString): string {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "InProgress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Closed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "OnHold":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Priority badge styling
function getPriorityBadgeStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function TicketsTable({
  tickets,
  isLoading = false,
  error = null,
  onRefresh,
  title = "Tickets",
  showFilters = true,
  emptyMessage = "No tickets found",
}: TicketsTableProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Sort states
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ticket) =>
          ticket.subject?.toLowerCase().includes(query) ||
          ticket.description?.toLowerCase().includes(query) ||
          ticket.ticketNumber?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (ticket) => ticket.status === statusFilter
      );
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter(
        (ticket) => ticket.priority === priorityFilter
      );
    }

    // Status and priority order for sorting
    const statusOrder: Record<string, number> = {
      Open: 0,
      InProgress: 1,
      OnHold: 2,
      Resolved: 3,
      Closed: 4,
    };
    const priorityOrder: Record<string, number> = {
      Low: 0,
      Medium: 1,
      High: 2,
      Critical: 3,
    };

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "ticketNumber":
          comparison = (a.ticketNumber || "").localeCompare(b.ticketNumber || "");
          break;
        case "subject":
          comparison = (a.subject || "").localeCompare(b.subject || "");
          break;
        case "status":
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case "priority":
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortField, sortDirection]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500">Loading tickets...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedTickets.length} of {tickets.length} tickets
            </span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="OnHold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredAndSortedTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <button
                      onClick={() => handleSort("ticketNumber")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Ticket # {getSortIcon("ticketNumber")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <button
                      onClick={() => handleSort("subject")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Subject {getSortIcon("subject")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Status {getSortIcon("status")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <button
                      onClick={() => handleSort("priority")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Priority {getSortIcon("priority")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Created {getSortIcon("createdAt")}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600">
                        {ticket.ticketNumber || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-md">
                        <p className="font-medium text-gray-900 truncate">
                          {ticket.subject || "No Subject"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {ticket.description || "No description"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyle(ticket.status)}
                      >
                        {getStatusString(ticket.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={getPriorityBadgeStyle(ticket.priority)}
                      >
                        {getPriorityString(ticket.priority)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      <br />
                      <span className="text-xs text-gray-400">
                        {format(new Date(ticket.createdAt), "h:mm a")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/tickets/${ticket.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
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
  );
}

export default TicketsTable;
