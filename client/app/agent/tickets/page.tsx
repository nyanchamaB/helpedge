"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Queue = "all" | "unassigned" | "mine" | "waiting" | "inprogress";

const QUEUE_LABELS: Record<Queue, string> = {
  all: "All",
  unassigned: "Unassigned",
  mine: "Mine",
  inprogress: "In Progress",
  waiting: "Waiting",
};

export default function AgentTickets() {
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

  const filtered = useMemo(() => {
    switch (activeQueue) {
      case "unassigned":
        return tickets.filter((t) => t.status === "Open" && !t.assignedToId);
      case "mine":
        return tickets.filter((t) => t.assignedToId === user?.id);
      case "inprogress":
        return tickets.filter((t) => t.status === "InProgress");
      case "waiting":
        return tickets.filter((t) => t.status === "OnHold" || t.status === "AwaitingInfo");
      default:
        return tickets;
    }
  }, [tickets, activeQueue, user?.id]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      unassigned: tickets.filter((t) => t.status === "Open" && !t.assignedToId).length,
      mine: tickets.filter((t) => t.assignedToId === user?.id).length,
      inprogress: tickets.filter((t) => t.status === "InProgress").length,
      waiting: tickets.filter((t) => t.status === "OnHold" || t.status === "AwaitingInfo").length,
    }),
    [tickets, user?.id]
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ticket Queue</h1>
          <p className="text-muted-foreground mt-1">
            {QUEUE_LABELS[activeQueue]} tickets
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

      {/* Queue tabs */}
      <Tabs
        value={activeQueue}
        onValueChange={(v) =>
          navigateTo("/agent/tickets", { queue: v as Queue })
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
        emptyMessage={`No tickets in the ${QUEUE_LABELS[activeQueue]} queue`}
      />
    </div>
  );
}
