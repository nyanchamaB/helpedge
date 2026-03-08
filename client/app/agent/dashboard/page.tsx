"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { TicketQueueList, QueueItem } from "@/components/agent/TicketQueueList";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  AlertCircle,
  User,
  Clock,
  Bell,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SLA_WARN_HOURS: Record<string, number> = {
  Critical: 1,
  High: 4,
  Medium: 8,
  Low: 24,
};

function isSlaWarning(ticket: Ticket): boolean {
  if (ticket.status === "Resolved" || ticket.status === "Closed") return false;
  const hours = (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  const threshold = SLA_WARN_HOURS[ticket.priority] ?? 24;
  return hours > threshold * 0.75; // warn at 75% of SLA
}

export default function AgentDashboard() {
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

  const queues = useMemo(() => {
    const unassigned = tickets.filter(
      (t) => t.status === "Open" && !t.assignedToId
    );
    const mine = tickets.filter((t) => t.assignedToId === user?.id);
    const waiting = tickets.filter((t) => t.status === "OnHold");
    const recentNew = tickets.filter((t) => {
      const hoursAgo = (Date.now() - new Date(t.createdAt).getTime()) / 3_600_000;
      return t.status === "Open" && !t.assignedToId && hoursAgo < 24;
    });

    return { unassigned, mine, waiting, recentNew };
  }, [tickets, user]);

  const slaWarnings = useMemo(
    () => tickets.filter(isSlaWarning),
    [tickets]
  );

  // Recent user replies on my tickets
  const userReplies = useMemo(() => {
    if (!user?.id) return [];
    return tickets.filter(
      (t) =>
        t.assignedToId === user.id &&
        (t.comments ?? []).some(
          (c) => !c.isInternal && c.authorId !== user.id
        )
    );
  }, [tickets, user]);

  const queueItems: QueueItem[] = [
    {
      id: "new",
      label: "New Tickets",
      icon: Inbox,
      count: queues.recentNew.length,
      description: "Received in last 24h",
      colorClasses: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        border: "border-blue-200",
      },
      onClick: () => navigateTo("/agent/tickets", { queue: "unassigned" }),
    },
    {
      id: "unassigned",
      label: "Unassigned",
      icon: AlertCircle,
      count: queues.unassigned.length,
      description: "Needs an agent",
      colorClasses: {
        bg: "bg-amber-50",
        iconBg: "bg-amber-100",
        iconText: "text-amber-600",
        border: "border-amber-200",
      },
      onClick: () => navigateTo("/agent/tickets", { queue: "unassigned" }),
    },
    {
      id: "mine",
      label: "My Tickets",
      icon: User,
      count: queues.mine.length,
      description: "Assigned to you",
      colorClasses: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        border: "border-purple-200",
      },
      onClick: () => navigateTo("/agent/tickets", { queue: "mine" }),
    },
    {
      id: "waiting",
      label: "Waiting",
      icon: Clock,
      count: queues.waiting.length,
      description: "Waiting for user",
      colorClasses: {
        bg: "bg-gray-50",
        iconBg: "bg-gray-100",
        iconText: "text-gray-600",
        border: "border-gray-200",
      },
      onClick: () => navigateTo("/agent/tickets", { queue: "waiting" }),
    },
  ];

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. Here is
            your queue overview.
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
        {/* My assigned tickets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Assigned Tickets</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigateTo("/agent/tickets", { queue: "mine" })}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <TicketsTable
                tickets={queues.mine.slice(0, 8)}
                isLoading={isLoading}
                showFilters={false}
                emptyMessage="No tickets assigned to you"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notifications sidebar */}
        <div className="space-y-4">
          {/* SLA Warnings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                SLA Warnings
                {slaWarnings.length > 0 && (
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {slaWarnings.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slaWarnings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  No SLA warnings
                </p>
              ) : (
                <div className="space-y-2">
                  {slaWarnings.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigateTo(`/tickets/${t.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {t.subject}
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {t.priority} · opened{" "}
                        {format(new Date(t.createdAt), "MMM d, h:mm a")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User replies */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                User Replies
                {userReplies.length > 0 && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {userReplies.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReplies.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  No new replies
                </p>
              ) : (
                <div className="space-y-2">
                  {userReplies.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigateTo(`/tickets/${t.id}`)}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {t.subject}
                      </p>
                      <p className="text-xs text-blue-500 mt-0.5">
                        User replied ·{" "}
                        {format(new Date(t.updatedAt), "MMM d, h:mm a")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
