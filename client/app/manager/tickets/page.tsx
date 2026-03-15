"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketAnalyticsCards } from "@/components/manager/TicketAnalyticsCards";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "open" | "inprogress" | "escalated" | "unassigned" | "resolved";

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  open: "Open",
  inprogress: "In Progress",
  unassigned: "Unassigned",
  escalated: "Escalated",
  resolved: "Resolved",
};

export default function ManagerTickets() {
  const { pageParams, navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeFilter = (pageParams.filter as Filter) || "all";

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setIsLoading(true);
    const res = await getAllTickets();
    if (res.success && res.data) setTickets(res.data);
    setIsLoading(false);
  }

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "open":
        return tickets.filter((t) => t.status === "Open");
      case "inprogress":
        return tickets.filter((t) => t.status === "InProgress");
      case "unassigned":
        return tickets.filter((t) => t.status === "Open" && !t.assignedToId);
      case "escalated":
        return tickets.filter((t) => t.isEscalated);
      case "resolved":
        return tickets.filter(
          (t) => t.status === "Resolved" || t.status === "Closed"
        );
      default:
        return tickets;
    }
  }, [tickets, activeFilter]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      inprogress: tickets.filter((t) => t.status === "InProgress").length,
      unassigned: tickets.filter((t) => t.status === "Open" && !t.assignedToId).length,
      escalated: tickets.filter((t) => t.isEscalated).length,
      resolved: tickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
    }),
    [tickets]
  );

  return (
    <div className="container py-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Full ticket visibility across all agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo("/manager/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Mini analytics row */}
      <TicketAnalyticsCards tickets={tickets} isLoading={isLoading} />

      {/* Filter tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(v) =>
          navigateTo("/manager/tickets", { filter: v as Filter })
        }
      >
        <TabsList className="h-9 flex-wrap">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <TabsTrigger key={f} value={f} className="text-xs gap-1.5">
              {FILTER_LABELS[f]}
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {counts[f]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <TicketsTable
        tickets={filtered}
        isLoading={isLoading}
        onRefresh={fetchTickets}
        title=""
        showFilters={true}
        emptyMessage={`No ${FILTER_LABELS[activeFilter].toLowerCase()} tickets`}
      />
    </div>
  );
}
