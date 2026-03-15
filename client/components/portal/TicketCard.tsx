"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, MessageSquare, ArrowRight, TrendingUp } from "lucide-react";
import {
  Ticket,
  TicketPriorityString,
  getEffectiveStatusLabel,
  getEffectiveStatusStyle,
} from "@/lib/api/tickets";
import { useNavigation } from "@/contexts/NavigationContext";
import { cn } from "@/lib/utils";


function getPriorityStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700";
    case "Medium":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700";
  }
}

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { navigateTo } = useNavigation();
  const publicComments = (ticket.comments ?? []).filter((c) => !c.isInternal);
  const commentCount = publicComments.length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border hover:border-blue-200 group"
      onClick={() => navigateTo(`/portal/ticket/${ticket.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">
                {ticket.ticketNumber ?? ticket.id.slice(0, 8)}
              </span>
              {ticket.isEscalated && (
                <Badge
                  variant="outline"
                  className="text-xs bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 px-1.5 py-0"
                >
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                  Escalated
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {ticket.subject}
            </h3>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
        </div>

        {/* Description preview */}
        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-xs", getEffectiveStatusStyle(ticket.status, ticket.assignedToId))}
          >
            {getEffectiveStatusLabel(ticket.status, ticket.assignedToId)}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs", getPriorityStyle(ticket.priority))}
          >
            {ticket.priority}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(ticket.updatedAt), "MMM d")}</span>
          </div>
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
