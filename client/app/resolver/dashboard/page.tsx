"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
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
import {
  ClipboardList,
  Play,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResolverDashboard() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setIsLoading(true);
    const res = await getAllTickets();
    if (res.success && res.data) setTickets(res.data);
    setIsLoading(false);
  }

  const myTickets = useMemo(
    () => tickets.filter((t) => t.assignedToId === user?.id),
    [tickets, user]
  );

  const queues = useMemo(() => ({
    assigned: myTickets.filter((t) => t.status === "Open"),
    inProgress: myTickets.filter((t) => t.status === "InProgress"),
    waiting: myTickets.filter((t) => t.status === "OnHold"),
    resolved: myTickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ),
  }), [myTickets]);

  // Most urgent ticket to work on (first open or in-progress)
  const nextTicket =
    queues.inProgress[0] || queues.assigned[0] || null;

  const queueItems: QueueItem[] = [
    {
      id: "assigned",
      label: "Assigned",
      icon: ClipboardList,
      count: queues.assigned.length,
      description: "Ready to start",
      colorClasses: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        border: "border-blue-200",
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
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work Queue</h1>
          <p className="text-muted-foreground mt-1">
            {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""}{" "}
            assigned to you
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Queue cards */}
      <TicketQueueList queues={queueItems} isLoading={isLoading} />

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
              <CardTitle className="text-sm">Next Ticket</CardTitle>
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
                    <p className="text-xs font-mono text-gray-400">
                      {nextTicket.ticketNumber}
                    </p>
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
                      onUpdate={fetchTickets}
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
