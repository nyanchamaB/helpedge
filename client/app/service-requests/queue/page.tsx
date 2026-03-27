"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  useAllServiceRequests,
  useAssignedServiceRequests,
  usePendingApprovalForMe,
  useOverdueServiceRequests,
} from "@/hooks/service-requests/useServiceRequests";
import {
  ServiceRequest,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
} from "@/lib/api/service-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Search, RefreshCw, AlertCircle, Inbox } from "lucide-react";

type QueueTab = "unassigned" | "mine" | "pending-approval" | "overdue";

const TABS: { key: QueueTab; label: string; description: string }[] = [
  { key: "unassigned", label: "Unassigned", description: "Approved requests not yet assigned" },
  { key: "mine", label: "My Queue", description: "Requests assigned to me" },
  { key: "pending-approval", label: "Needs My Approval", description: "Requests awaiting my approval" },
  { key: "overdue", label: "Overdue", description: "Requests past their required-by date" },
];

function SRRow({ req, onClick }: { req: ServiceRequest; onClick: () => void }) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
        {req.requestNumber}
      </TableCell>
      <TableCell className="font-medium max-w-[240px] truncate">
        {req.subject}
        {req.isOverdue && <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>}
      </TableCell>
      <TableCell className="text-sm">{getSRTypeLabel(req.requestType)}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSRStatusStyle(req.status)}`}>
          {getSRStatusLabel(req.status)}
        </span>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSRPriorityStyle(req.priority)}`}>
          {req.priority}
        </span>
      </TableCell>
      <TableCell className="text-sm">{req.requesterName ?? "—"}</TableCell>
      <TableCell className="text-sm whitespace-nowrap">
        {req.requiredByDate ? new Date(req.requiredByDate).toLocaleDateString() : "—"}
      </TableCell>
    </TableRow>
  );
}

export default function ServiceRequestQueuePage() {
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState<QueueTab>("unassigned");
  const [search, setSearch] = useState("");

  const allQuery = useAllServiceRequests();
  const mineQuery = useAssignedServiceRequests();
  const pendingQuery = usePendingApprovalForMe();
  const overdueQuery = useOverdueServiceRequests();

  const baseData = useMemo(() => {
    if (activeTab === "mine") return mineQuery.data ?? [];
    if (activeTab === "pending-approval") return pendingQuery.data ?? [];
    if (activeTab === "overdue") return overdueQuery.data ?? [];
    // unassigned = Approved + no assignee
    return (allQuery.data ?? []).filter((r) => r.status === "Approved" && !r.assignedToId);
  }, [activeTab, allQuery.data, mineQuery.data, pendingQuery.data, overdueQuery.data]);

  const isLoading =
    (activeTab === "unassigned" && allQuery.isLoading) ||
    (activeTab === "mine" && mineQuery.isLoading) ||
    (activeTab === "pending-approval" && pendingQuery.isLoading) ||
    (activeTab === "overdue" && overdueQuery.isLoading);

  const filtered = useMemo(() => {
    if (!search) return baseData;
    return baseData.filter(
      (r) =>
        r.subject.toLowerCase().includes(search.toLowerCase()) ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        (r.requesterName ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [baseData, search]);

  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Request Queue</h1>
            <p className="text-sm text-muted-foreground">{activeTabInfo.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { allQuery.refetch(); mineQuery.refetch(); pendingQuery.refetch(); overdueQuery.refetch(); }}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {!isLoading && (
        <p className="text-sm text-muted-foreground">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <AlertCircle className="h-10 w-10 opacity-30" />
          <p className="text-sm">Queue is empty</p>
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
                <TableHead>Required By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <SRRow key={req.id} req={req} onClick={() => navigateTo(`/service-requests/${req.id}`)} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
