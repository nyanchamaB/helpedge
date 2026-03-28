"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAllServiceRequests, usePendingApprovalForMe, useOverdueServiceRequests } from "@/hooks/service-requests/useServiceRequests";
import {
  ServiceRequest,
  ServiceRequestStatus,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_TYPES,
} from "@/lib/api/service-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn, DataTableFilter, DataTableAction } from "@/components/data-table";
import { ClipboardList, Plus, RefreshCw, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TabKey = "all" | "pending" | "active" | "overdue";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",     label: "All Requests" },
  { key: "pending", label: "Pending Approval" },
  { key: "active",  label: "Active" },
  { key: "overdue", label: "Overdue" },
];

const ACTIVE_STATUSES: ServiceRequestStatus[] = ["Approved", "InProgress", "OnHold"];

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "MMM d, yyyy"); } catch { return "—"; }
}

export default function ServiceRequestsPage() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const allQuery     = useAllServiceRequests();
  const pendingQuery = usePendingApprovalForMe();
  const overdueQuery = useOverdueServiceRequests();

  // Exclude Draft requests that belong to other users — drafts are private to their creator
  const visibleAll = useMemo(
    () => (allQuery.data ?? []).filter(r => r.status !== "Draft" || r.requesterId === user?.id),
    [allQuery.data, user?.id]
  );

  const tabCounts = useMemo<Record<TabKey, number | null>>(() => ({
    all:     allQuery.data  ? visibleAll.length : null,
    pending: pendingQuery.data ? pendingQuery.data.length : null,
    active:  allQuery.data  ? visibleAll.filter(r => ACTIVE_STATUSES.includes(r.status)).length : null,
    overdue: overdueQuery.data ? overdueQuery.data.length : null,
  }), [visibleAll, pendingQuery.data, overdueQuery.data, allQuery.data]);

  const tableData = useMemo(() => {
    if (activeTab === "pending") return pendingQuery.data ?? [];
    if (activeTab === "overdue") return overdueQuery.data ?? [];
    if (activeTab === "active") return visibleAll.filter(r => ACTIVE_STATUSES.includes(r.status));
    return visibleAll;
  }, [activeTab, visibleAll, pendingQuery.data, overdueQuery.data]);

  const isLoading =
    (activeTab === "all"     && allQuery.isLoading)     ||
    (activeTab === "pending" && pendingQuery.isLoading)  ||
    (activeTab === "overdue" && overdueQuery.isLoading)  ||
    (activeTab === "active"  && allQuery.isLoading);

  function handleRefresh() {
    allQuery.refetch();
    pendingQuery.refetch();
    overdueQuery.refetch();
  }

  // ── Columns ──
  const columns: DataTableColumn<ServiceRequest>[] = [
    {
      key: "requestNumber",
      label: "Request #",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-sm text-muted-foreground whitespace-nowrap">
          {r.requestNumber}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (r) => (
        <div className="max-w-[280px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{r.subject}</p>
            {r.isOverdue && (
              <Badge variant="destructive" className="shrink-0 text-xs">Overdue</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{getSRTypeLabel(r.requestType)}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (r) => (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", getSRStatusStyle(r.status))}>
          {getSRStatusLabel(r.status)}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (r) => (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", getSRPriorityStyle(r.priority))}>
          {r.priority}
        </span>
      ),
    },
    {
      key: "requesterName",
      label: "Requester",
      sortable: true,
      render: (r) => <span className="text-sm">{r.requesterName ?? "—"}</span>,
    },
    {
      key: "assignedToName",
      label: "Assigned To",
      sortable: true,
      render: (r) => <span className="text-sm">{r.assignedToName ?? "—"}</span>,
    },
    {
      key: "requiredByDate",
      label: "Required By",
      sortable: true,
      render: (r) => <span className="text-sm whitespace-nowrap">{formatDate(r.requiredByDate)}</span>,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (r) => (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(r.createdAt)}
        </div>
      ),
    },
  ];

  // ── Filters ──
  const filters: DataTableFilter[] = [
    {
      key: "status",
      label: "Status",
      options: SERVICE_REQUEST_STATUSES.map(s => ({ value: s, label: getSRStatusLabel(s) })),
    },
    {
      key: "requestType",
      label: "Type",
      options: SERVICE_REQUEST_TYPES.map(t => ({ value: t, label: getSRTypeLabel(t) })),
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "Low",      label: "Low" },
        { value: "Medium",   label: "Medium" },
        { value: "High",     label: "High" },
        { value: "Critical", label: "Critical" },
      ],
    },
  ];

  // ── Actions ──
  const actions: DataTableAction<ServiceRequest>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (r) => navigateTo(`/service-requests/${r.id}`, { from: '/service-requests' }),
    },
  ];

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
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => navigateTo("/service-requests/create-request", { from: '/service-requests' })}>
            <Plus className="h-4 w-4 mr-1.5" /> New Request
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => {
          const count = tabCounts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {count != null && (
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[18px] h-[18px] px-1",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : count > 0
                      ? tab.key === "overdue"
                        ? "bg-red-100 text-red-600"
                        : tab.key === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable<ServiceRequest>
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search by subject, request #, or requester…"
        searchKeys={["subject", "requestNumber", "requesterName"]}
        filters={filters}
        defaultSortField="createdAt"
        defaultSortDirection="desc"
        actions={actions}
        pagination={true}
        onRowClick={(r) => navigateTo(`/service-requests/${r.id}`, { from: '/service-requests' })}
        getItemId={(r) => r.id}
        emptyState={{
          icon: <AlertCircle className="h-8 w-8 text-muted-foreground/40" />,
          title: "No service requests found",
          description: "Try adjusting your search or filter criteria",
        }}
      />
    </div>
  );
}
