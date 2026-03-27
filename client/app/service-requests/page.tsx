"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAllServiceRequests, usePendingApprovalForMe, useOverdueServiceRequests } from "@/hooks/service-requests/useServiceRequests";
import {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestType,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_TYPES,
} from "@/lib/api/service-request";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Plus, Search, RefreshCw, AlertCircle } from "lucide-react";

type TabKey = "all" | "pending" | "active" | "overdue";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Requests" },
  { key: "pending", label: "Pending Approval" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
];

const ACTIVE_STATUSES: ServiceRequestStatus[] = ["Approved", "InProgress", "OnHold"];

function SRStatusBadge({ status }: { status: ServiceRequestStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSRStatusStyle(status)}`}>
      {getSRStatusLabel(status)}
    </span>
  );
}

function SRPriorityBadge({ priority }: { priority: ServiceRequest["priority"] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSRPriorityStyle(priority)}`}>
      {priority}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function ServiceRequestsPage() {
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const allQuery = useAllServiceRequests();
  const pendingQuery = usePendingApprovalForMe();
  const overdueQuery = useOverdueServiceRequests();

  const baseData = useMemo(() => {
    if (activeTab === "pending") return pendingQuery.data ?? [];
    if (activeTab === "overdue") return overdueQuery.data ?? [];
    const all = allQuery.data ?? [];
    if (activeTab === "active") return all.filter(r => ACTIVE_STATUSES.includes(r.status));
    return all;
  }, [activeTab, allQuery.data, pendingQuery.data, overdueQuery.data]);

  const isLoading =
    (activeTab === "all" && allQuery.isLoading) ||
    (activeTab === "pending" && pendingQuery.isLoading) ||
    (activeTab === "overdue" && overdueQuery.isLoading) ||
    (activeTab === "active" && allQuery.isLoading);

  const filtered = useMemo(() => {
    return baseData.filter((r) => {
      const matchSearch =
        !search ||
        r.subject.toLowerCase().includes(search.toLowerCase()) ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        (r.requesterName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchType = typeFilter === "all" || r.requestType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [baseData, search, statusFilter, typeFilter]);

  function handleRefresh() {
    allQuery.refetch();
    pendingQuery.refetch();
    overdueQuery.refetch();
  }

  function formatDate(d?: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Service Requests</h1>
            <p className="text-sm text-muted-foreground">Manage and track all IT service requests</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigateTo("/service-requests/create-request")}>
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject, number, or requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {SERVICE_REQUEST_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{getSRStatusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {SERVICE_REQUEST_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{getSRTypeLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <AlertCircle className="h-10 w-10 opacity-30" />
          <p className="text-sm">No requests found</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Required By</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow
                  key={req.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigateTo(`/service-requests/${req.id}`)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {req.requestNumber}
                  </TableCell>
                  <TableCell className="font-medium max-w-[260px] truncate">
                    {req.subject}
                    {req.isOverdue && (
                      <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{getSRTypeLabel(req.requestType)}</TableCell>
                  <TableCell><SRStatusBadge status={req.status} /></TableCell>
                  <TableCell><SRPriorityBadge priority={req.priority} /></TableCell>
                  <TableCell className="text-sm">{req.requesterName ?? "—"}</TableCell>
                  <TableCell className="text-sm">{req.assignedToName ?? "—"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(req.requiredByDate)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(req.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
