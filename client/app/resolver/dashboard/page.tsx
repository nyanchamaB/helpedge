"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getTicketsByAssignee, Ticket } from "@/lib/api/tickets";
import { getMySLA, SLAStats } from "@/lib/api/dashboard";
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
import {
  ClipboardList,
  Play,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Timer,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Returns a human-readable age string from a UTC date string, e.g. "2h 15m" */
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchAll();
  }, [user?.id]);

  async function fetchAll() {
    if (!user?.id) return;
    setIsLoading(true);
    const [ticketsRes, slaRes] = await Promise.all([
      getTicketsByAssignee(user.id),
      getMySLA(),
    ]);
    if (ticketsRes.success && ticketsRes.data) setTickets(ticketsRes.data);
    if (slaRes.success && slaRes.data) setSlaStats(slaRes.data);
    setIsLoading(false);
  }

  const queues = useMemo(() => ({
    assigned: tickets.filter((t) => t.status === "Open"),
    inProgress: tickets.filter((t) => t.status === "InProgress"),
    waiting: tickets.filter((t) => t.status === "OnHold"),
    resolved: tickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ),
  }), [tickets]);

  // Oldest unacknowledged ticket (Open + has assignedAt)
  const oldestUnacked = useMemo(() => {
    const unacked = queues.assigned.filter((t) => t.assignedAt);
    return unacked.sort(
      (a, b) => new Date(a.assignedAt!).getTime() - new Date(b.assignedAt!).getTime()
    )[0] ?? null;
  }, [queues.assigned]);

  // Most urgent ticket to work on (first in-progress, then oldest open)
  const nextTicket = queues.inProgress[0] || queues.assigned[0] || null;

  const queueItems: QueueItem[] = [
    {
      id: "assigned",
      label: "Unacknowledged",
      icon: ClipboardList,
      count: queues.assigned.length,
      description: queues.assigned.length > 0 ? "TTA clock running" : "All acknowledged",
      colorClasses: {
        bg: queues.assigned.length > 0 ? "bg-amber-50" : "bg-blue-50",
        iconBg: queues.assigned.length > 0 ? "bg-amber-100" : "bg-blue-100",
        iconText: queues.assigned.length > 0 ? "text-amber-600" : "text-blue-600",
        border: queues.assigned.length > 0 ? "border-amber-200" : "border-blue-200",
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
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}{" "}
            assigned to you
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAll}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Unacknowledged alert */}
      {!isLoading && queues.assigned.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">{queues.assigned.length} ticket{queues.assigned.length !== 1 ? "s" : ""} awaiting acknowledgment.</span>
            {" "}Acknowledge tickets to start your SLA clock.
            {oldestUnacked?.assignedAt && (
              <span className="ml-1">
                Oldest: <span className="font-semibold">{formatAge(oldestUnacked.assignedAt)}</span> ago
                {" "}({oldestUnacked.ticketNumber}).
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Queue cards */}
      <TicketQueueList queues={queueItems} isLoading={isLoading} />

      {/* SLA summary bar */}
      {slaStats && (slaStats.avgTtaMinutes != null || slaStats.avgTtrMinutes != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg TTA</span>
            </div>
            <p className="text-2xl font-bold">
              {formatMinutes(slaStats.avgTtaMinutes)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Time to acknowledge</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg TTR</span>
            </div>
            <p className="text-2xl font-bold">
              {formatMinutes(slaStats.avgTtrMinutes)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Time to resolve</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">SLA Breach</span>
            </div>
            <p className={cn("text-2xl font-bold", slaStats.slaBreaching > 0 ? "text-red-600" : "text-foreground")}>
              {slaStats.slaBreaching}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Tickets breaching</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Near Breach</span>
            </div>
            <p className={cn("text-2xl font-bold", slaStats.slaNearBreach > 0 ? "text-orange-600" : "text-foreground")}>
              {slaStats.slaNearBreach}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Due soon</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket list */}
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

        {/* Next ticket work panel */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {nextTicket?.status === "Open" ? "Next to Acknowledge" : "Next Ticket"}
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
                      <p className="text-xs font-mono text-gray-400">
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
                      onClick={() => navigateTo(`/tickets/${nextTicket.id}`)}
                    >
                      {nextTicket.subject}
                    </button>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
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
        </div>
      </div>
    </div>
  );
}
