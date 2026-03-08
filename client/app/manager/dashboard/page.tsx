"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { getAllUsers, User } from "@/lib/api/users";
import { TicketAnalyticsCards } from "@/components/manager/TicketAnalyticsCards";
import { TeamWorkloadTable } from "@/components/manager/TeamWorkloadTable";
import { EscalationPanel } from "@/components/manager/EscalationPanel";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const SLA_HOURS: Record<string, number> = {
  Critical: 1,
  High: 4,
  Medium: 8,
  Low: 24,
};

function isSlaBreached(ticket: Ticket): boolean {
  if (ticket.status === "Resolved" || ticket.status === "Closed") return false;
  const threshold = SLA_HOURS[ticket.priority] ?? 24;
  const hoursOpen =
    (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  return hoursOpen > threshold;
}

export default function ManagerDashboard() {
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [ticketRes, userRes] = await Promise.all([
      getAllTickets(),
      getAllUsers(),
    ]);
    if (ticketRes.success && ticketRes.data) setTickets(ticketRes.data);
    if (userRes.success && userRes.data) setUsers(userRes.data);
    setIsLoading(false);
  }

  const slaBreaches = useMemo(
    () => tickets.filter(isSlaBreached),
    [tickets]
  );

  const unassigned = useMemo(
    () =>
      tickets.filter(
        (t) =>
          t.status === "Open" &&
          !t.assignedToId &&
          t.triageStatus !== "Pending"
      ),
    [tickets]
  );

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Ticket operations overview and team performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo("/manager/tickets")}
          >
            All Tickets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics cards */}
      <TicketAnalyticsCards tickets={tickets} isLoading={isLoading} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team workload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Users className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Team Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamWorkloadTable
                tickets={tickets}
                users={users}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Escalated tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm">Escalated Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <EscalationPanel tickets={tickets} maxItems={5} />
            </CardContent>
          </Card>

          {/* SLA breaches */}
          <Card className={slaBreaches.length > 0 ? "border-red-200" : ""}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  slaBreaches.length > 0 ? "text-red-500" : "text-gray-400"
                )}
              />
              <CardTitle className="text-sm">
                SLA Breaches
                {slaBreaches.length > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {slaBreaches.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slaBreaches.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No SLA breaches — all good!
                </p>
              ) : (
                <TicketsTable
                  tickets={slaBreaches.slice(0, 5)}
                  isLoading={isLoading}
                  showFilters={false}
                  emptyMessage=""
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unassigned tickets needing attention */}
      {unassigned.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">
                Unassigned Tickets
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({unassigned.length})
                </span>
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() =>
                navigateTo("/manager/tickets", { filter: "unassigned" })
              }
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <TicketsTable
              tickets={unassigned.slice(0, 5)}
              isLoading={false}
              showFilters={false}
              emptyMessage=""
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
