"use client";

import { format } from "date-fns";
import { Ticket, getStatusString, TicketStatusString } from "@/lib/api/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { cn } from "@/lib/utils";

const statusStyle: Record<TicketStatusString, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-100",
  InProgress: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Resolved: "bg-green-50 text-green-700 border-green-100",
  Closed: "bg-gray-50 text-gray-600 border-gray-100",
  OnHold: "bg-purple-50 text-purple-700 border-purple-100",
};

const priorityStyle: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Medium: "bg-blue-50 text-blue-600 border-blue-100",
  Low: "bg-gray-50 text-gray-600 border-gray-100",
};

interface EscalationPanelProps {
  tickets: Ticket[];
  maxItems?: number;
}

export function EscalationPanel({
  tickets,
  maxItems = 10,
}: EscalationPanelProps) {
  const { navigateTo } = useNavigation();

  const escalated = tickets
    .filter((t) => t.isEscalated && t.status !== "Closed")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, maxItems);

  if (escalated.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400">
        <TrendingUp className="h-8 w-8 mb-2 text-gray-200" />
        <p className="text-sm">No escalated tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {escalated.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/60 hover:bg-orange-50 transition-colors"
        >
          <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {ticket.subject}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">
                {ticket.ticketNumber ?? ticket.id.slice(0, 8)}
              </span>
              <Badge
                variant="outline"
                className={cn("text-xs", statusStyle[ticket.status])}
              >
                {getStatusString(ticket.status)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", priorityStyle[ticket.priority])}
              >
                {ticket.priority}
              </Badge>
              <span className="text-xs text-gray-400">
                · updated {format(new Date(ticket.updatedAt), "MMM d")}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-gray-400 hover:text-gray-700"
            onClick={() => navigateTo(`/tickets/${ticket.id}`)}
            title="Open ticket"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
