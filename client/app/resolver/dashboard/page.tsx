"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getMyAssignedTickets, type Ticket } from "@/lib/api/tickets";
import {
  getMySLA,
  getDetailedHealth,
  type SLAStats,
  type DetailedHealthStatus,
} from "@/lib/api/dashboard";
import {
  getAssignedServiceRequests,
  getOverdueServiceRequests,
  type ServiceRequest,
} from "@/lib/api/service-request";
import { TicketQueueList, QueueItem } from "@/components/agent/TicketQueueList";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { ResolverWorkPanel } from "@/components/resolver/ResolverWorkPanel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Play,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Timer,
  TrendingUp,
  Server,
  Database,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatAge(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatMinutes(mins: number | null | undefined): string {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ResolverDashboard() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  const isSystemAdmin = user?.role === "SystemAdmin";
  const isSecurityAdmin = user?.role === "SecurityAdmin";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [assignedSRs, setAssignedSRs] = useState<ServiceRequest[]>([]);
  const [overdueSRs, setOverdueSRs] = useState<ServiceRequest[]>([]);
  const [health, setHealth] = useState<DetailedHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    const noOp = Promise.resolve({ success: false as const, data: null, error: undefined });
    const [ticketsRes, slaRes, srRes, overdueRes, healthRes] = await Promise.all([
      getMyAssignedTickets(),
      getMySLA(),
      getAssignedServiceRequests(),
      getOverdueServiceRequests(),
      isSystemAdmin ? getDetailedHealth() : noOp,
    ]);
    if (ticketsRes.success && ticketsRes.data) setTickets(ticketsRes.data);
    if (slaRes.success && slaRes.data) setSlaStats(slaRes.data);
    if (srRes.success && srRes.data) setAssignedSRs(srRes.data);
    if (overdueRes.success && overdueRes.data) setOverdueSRs(overdueRes.data);
    if (healthRes.success && healthRes.data) setHealth(healthRes.data as DetailedHealthStatus);
    setIsLoading(false);
  }

  const queues = useMemo(
    () => ({
      assigned: tickets.filter((t) => t.status === "Open"),
      inProgress: tickets.filter((t) => t.status === "InProgress"),
      waiting: tickets.filter(
        (t) => t.status === "OnHold" || t.status === "AwaitingInfo"
      ),
      resolved: tickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ),
    }),
    [tickets]
  );

  const oldestUnacked = useMemo(() => {
    const unacked = queues.assigned.filter((t) => t.assignedAt);
    return (
      unacked.sort(
        (a, b) =>
          new Date(a.assignedAt!).getTime() - new Date(b.assignedAt!).getTime()
      )[0] ?? null
    );
  }, [queues.assigned]);

  const nextTicket = queues.inProgress[0] || queues.assigned[0] || null;

  // SecurityAdmin: filter assigned SRs to security-relevant ones
  const securitySRs = useMemo(
    () =>
      isSecurityAdmin
        ? assignedSRs.filter(
            (sr) =>
              sr.requestType === "Access" ||
              sr.requestType === "PermissionChange" ||
              sr.requestType === "Account"
          )
        : [],
    [assignedSRs, isSecurityAdmin]
  );

  const queueItems: QueueItem[] = [
    {
      id: "assigned",
      label: "Unacknowledged",
      icon: ClipboardList,
      count: queues.assigned.length,
      description:
        queues.assigned.length > 0 ? "TTA clock running" : "All acknowledged",
      colorClasses: {
        bg: queues.assigned.length > 0 ? "bg-amber-50" : "bg-blue-50",
        iconBg: queues.assigned.length > 0 ? "bg-amber-100" : "bg-blue-100",
        iconText:
          queues.assigned.length > 0 ? "text-amber-600" : "text-blue-600",
        border:
          queues.assigned.length > 0 ? "border-amber-200" : "border-blue-200",
      },
      onClick: () => navigateTo("/resolver/tickets", { queue: "assigned" }),
    },
    {
      id: "inprogress",
      label: "In Progress",
      icon: Play,
      count: queues.inProgress.length,
      description: "Currently working",
      colorClasses: {
        bg: "bg-yellow-50",
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
        border: "border-yellow-200",
      },
      onClick: () => navigateTo("/resolver/tickets", { queue: "inprogress" }),
    },
    {
      id: "waiting",
      label: "Awaiting Info",
      icon: Clock,
      count: queues.waiting.length,
      description: "Waiting for user",
      colorClasses: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        border: "border-purple-200",
      },
      onClick: () => navigateTo("/resolver/tickets", { queue: "waiting" }),
    },
    {
      id: "resolved",
      label: "Resolved",
      icon: CheckCircle,
      count: queues.resolved.length,
      description: "Completed by you",
      colorClasses: {
        bg: "bg-green-50",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
        border: "border-green-200",
      },
      onClick: () => navigateTo("/resolver/tickets", { queue: "resolved" }),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Work Queue</h1>
          <p className="text-muted-foreground mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} assigned
            to you
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAll}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Unacknowledged alert */}
      {!isLoading && queues.assigned.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">
              {queues.assigned.length} ticket
              {queues.assigned.length !== 1 ? "s" : ""} awaiting acknowledgment.
            </span>{" "}
            Acknowledge tickets to start your SLA clock.
            {oldestUnacked?.assignedAt && (
              <span className="ml-1">
                Oldest:{" "}
                <span className="font-semibold">
                  {formatAge(oldestUnacked.assignedAt)}
                </span>{" "}
                ago ({oldestUnacked.ticketNumber}).
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Queue cards */}
      <TicketQueueList queues={queueItems} isLoading={isLoading} />

      {/* SLA summary bar */}
      {slaStats &&
        (slaStats.avgTtaMinutes != null || slaStats.avgTtrMinutes != null) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Avg TTA
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatMinutes(slaStats.avgTtaMinutes)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Time to acknowledge
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Avg TTR
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatMinutes(slaStats.avgTtrMinutes)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Time to resolve
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  SLA Breach
                </span>
              </div>
              <p className={cn(
                "text-2xl font-bold",
                slaStats.slaBreaching > 0 ? "text-red-600" : "text-foreground"
              )}>
                {slaStats.slaBreaching}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Tickets breaching</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Near Breach
                </span>
              </div>
              <p className={cn(
                "text-2xl font-bold",
                slaStats.slaNearBreach > 0 ? "text-orange-600" : "text-foreground"
              )}>
                {slaStats.slaNearBreach}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Due soon</p>
            </Card>
          </div>
        )}

      {/* Main work area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active ticket list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Active Work</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigateTo("/resolver/tickets")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <TicketsTable
                tickets={[...queues.inProgress, ...queues.assigned].slice(0, 8)}
                isLoading={isLoading}
                showFilters={false}
                emptyMessage="No active tickets"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Next ticket work panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {nextTicket?.status === "Open"
                  ? "Next to Acknowledge"
                  : "Next Ticket"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!nextTicket ? (
                <div className="text-center py-6 text-gray-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                  <p className="text-sm">Queue clear!</p>
                  <p className="text-xs mt-0.5">No active tickets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-muted-foreground">
                        {nextTicket.ticketNumber}
                      </p>
                      {nextTicket.assignedAt && !nextTicket.acknowledgedAt && (
                        <span className="text-xs text-amber-600 font-medium">
                          {formatAge(nextTicket.assignedAt)} waiting
                        </span>
                      )}
                    </div>
                    <button
                      className="text-sm font-medium text-blue-600 hover:underline text-left mt-0.5"
                      onClick={() => navigateTo(`/tickets/${nextTicket.id}`, { from: '/resolver/dashboard' })}
                    >
                      {nextTicket.subject}
                    </button>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {nextTicket.description}
                    </p>
                  </div>
                  {user?.id && (
                    <ResolverWorkPanel
                      ticket={nextTicket}
                      currentUserId={user.id}
                      currentUserRole={user.role}
                      onUpdate={fetchAll}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Request queue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                My Service Requests
                {assignedSRs.length > 0 && (
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    {assignedSRs.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : assignedSRs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No SRs assigned
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedSRs.slice(0, 4).map((sr) => (
                    <button
                      key={sr.id}
                      onClick={() => navigateTo(`/service-requests/${sr.id}`, { from: '/resolver/dashboard' })}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-xs font-medium truncate">{sr.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {sr.requestType}
                        </span>
                        {sr.isOverdue && (
                          <Badge variant="destructive" className="text-xs py-0 px-1">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                  {overdueSRs.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {overdueSRs.length} overdue SR{overdueSRs.length !== 1 ? "s" : ""}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs mt-1"
                    onClick={() => navigateTo("/service-requests")}
                  >
                    View all SRs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SecurityAdmin: Security-type SR spotlight */}
      {isSecurityAdmin && !isLoading && securitySRs.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base">
              Security Requests
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({securitySRs.length} assigned to you)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securitySRs.slice(0, 5).map((sr) => (
                <button
                  key={sr.id}
                  onClick={() => navigateTo(`/service-requests/${sr.id}`)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{sr.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sr.requestType} · {sr.priority} priority
                      </p>
                    </div>
                    <Badge
                      variant={sr.status === "PendingApproval" ? "destructive" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {sr.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SystemAdmin: System health panel */}
      {isSystemAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Server className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm">System Health</CardTitle>
              {health && (
                <Badge
                  className={cn(
                    "ml-auto text-xs",
                    health.checks ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  {health.checks ? "Healthy" : "Issues"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {!health && isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : !health ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Health data unavailable
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Service</span>
                    <Badge
                      className={cn(
                        "text-xs",
                        health.checks ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      {health.checks ? "Running" : "Issues"}
                    </Badge>
                  </div>
                  {health.checks?.mongodb && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Database className="h-3 w-3" /> MongoDB
                      </span>
                      <Badge
                        className={cn(
                          "text-xs",
                          health.checks.mongodb.status === "Healthy"
                            ? "bg-green-500"
                            : "bg-red-500"
                        )}
                      >
                        {health.checks.mongodb.status}
                      </Badge>
                    </div>
                  )}
                  {health.checks?.configuration && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">JWT Auth</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            health.checks.configuration.jwtConfigured
                              ? "bg-green-500"
                              : "bg-red-500"
                          )}
                        >
                          {health.checks.configuration.jwtConfigured
                            ? "Configured"
                            : "Not Set"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">CORS</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            health.checks.configuration.corsConfigured
                              ? "bg-green-500"
                              : "bg-red-500"
                          )}
                        >
                          {health.checks.configuration.corsConfigured
                            ? "Configured"
                            : "Not Set"}
                        </Badge>
                      </div>
                    </>
                  )}
                  {health.environment && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Environment</span>
                      <span className="text-xs font-medium">{health.environment}</span>
                    </div>
                  )}
                  {health.version && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Version</span>
                      <span className="text-xs font-mono">{health.version}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm">SLA by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              {slaStats ? (
                <div className="space-y-2 text-sm">
                  {[
                    {
                      label: "Critical",
                      value: slaStats.byPriority.critical,
                      color: "bg-red-500",
                    },
                    {
                      label: "High",
                      value: slaStats.byPriority.high,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Medium",
                      value: slaStats.byPriority.medium,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Low",
                      value: slaStats.byPriority.low,
                      color: "bg-green-500",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{label}</span>
                      <Badge className={cn("text-xs", color)}>{value}</Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Open</span>
                      <span>{slaStats.byStatus.open}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">In Progress</span>
                      <span>{slaStats.byStatus.inProgress}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">On Hold</span>
                      <span>{slaStats.byStatus.onHold}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No SLA data
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
