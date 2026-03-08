"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Queue = "all" | "assigned" | "inprogress" | "waiting" | "resolved";

const QUEUE_LABELS: Record<Queue, string> = {
  all: "All Mine",
  assigned: "To Start",
  inprogress: "In Progress",
  waiting: "Awaiting Info",
  resolved: "Resolved",
};

export default function ResolverTickets() {
  const { user } = useAuth();
  const { pageParams, navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeQueue = (pageParams.queue as Queue) || "all";

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

  const filtered = useMemo(() => {
    switch (activeQueue) {
      case "assigned":
        return myTickets.filter((t) => t.status === "Open");
      case "inprogress":
        return myTickets.filter((t) => t.status === "InProgress");
      case "waiting":
        return myTickets.filter((t) => t.status === "OnHold");
      case "resolved":
        return myTickets.filter(
          (t) => t.status === "Resolved" || t.status === "Closed"
        );
      default:
        return myTickets;
    }
  }, [myTickets, activeQueue]);

  const counts = useMemo(
    () => ({
      all: myTickets.length,
      assigned: myTickets.filter((t) => t.status === "Open").length,
      inprogress: myTickets.filter((t) => t.status === "InProgress").length,
      waiting: myTickets.filter((t) => t.status === "OnHold").length,
      resolved: myTickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
    }),
    [myTickets]
  );

  return (
    <div className="container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Tickets assigned to you
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

      <Tabs
        value={activeQueue}
        onValueChange={(v) =>
          navigateTo("/resolver/tickets", { queue: v as Queue })
        }
      >
        <TabsList className="h-9">
          {(Object.keys(QUEUE_LABELS) as Queue[]).map((q) => (
            <TabsTrigger key={q} value={q} className="text-xs gap-1.5">
              {QUEUE_LABELS[q]}
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {counts[q]}
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
        emptyMessage={`No ${QUEUE_LABELS[activeQueue].toLowerCase()} tickets`}
      />
    </div>
  );
}
