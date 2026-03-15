"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  getTicketsByCreator,
  Ticket,
  getStatusString,
} from "@/lib/api/tickets";
import { TicketCard } from "@/components/portal/TicketCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  RefreshCw,
  Ticket as TicketIcon,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

export default function PortalMyTickets() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTickets();
    }
  }, [authLoading, user]);

  async function fetchTickets() {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const response = await getTicketsByCreator(user.id);
    if (response.success && response.data) {
      setTickets(response.data);
    } else {
      setError(response.error ?? "Failed to load tickets");
    }
    setIsLoading(false);
  }

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        ticket.subject.toLowerCase().includes(query) ||
        (ticket.ticketNumber ?? "").toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      inProgress: tickets.filter((t) => t.status === "InProgress").length,
      resolved: tickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
    }),
    [tickets]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Support Tickets
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your support requests
          </p>
        </div>
        <Button onClick={() => navigateTo("/portal/create-ticket")}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={TicketIcon}
            label="Total"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Open"
            value={stats.open}
            color="yellow"
          />
          <StatCard
            icon={AlertCircle}
            label="In Progress"
            value={stats.inProgress}
            color="orange"
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={stats.resolved}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ticket # or subject..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="OnHold">On Hold</SelectItem>
            <SelectItem value="AwaitingInfo">Awaiting Info</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchTickets}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : paged.length === 0 ? (
        <EmptyState
          hasFilters={searchQuery !== "" || statusFilter !== "all"}
          onCreateNew={() => navigateTo("/portal/create-ticket")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "yellow" | "orange" | "green";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white">
      <div className={cn("p-2 rounded-lg", colorMap[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onCreateNew,
}: {
  hasFilters: boolean;
  onCreateNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <TicketIcon className="h-12 w-12 text-gray-200 mb-4" />
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-gray-700">
            No tickets match your filters
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or status filter.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-700">
            No tickets yet
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Submit your first support request to get started.
          </p>
          <Button className="mt-4" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </>
      )}
    </div>
  );
}
