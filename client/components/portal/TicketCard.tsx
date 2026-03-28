"use client";

import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, MessageSquare, ArrowRight, TrendingUp, Tag } from "lucide-react";
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
    case "Low":      return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400";
    case "Medium":   return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
    case "High":     return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
    case "Critical": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300";
    default:         return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getStatusBorderColor(status: string, assignedToId?: string | null): string {
  if (!assignedToId && status === "Open") return "border-l-amber-400";
  switch (status) {
    case "Open":        return "border-l-blue-400";
    case "InProgress":  return "border-l-violet-500";
    case "OnHold":      return "border-l-orange-400";
    case "AwaitingInfo":return "border-l-yellow-400";
    case "Resolved":    return "border-l-green-500";
    case "Closed":      return "border-l-gray-400";
    default:            return "border-l-border";
  }
}

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { navigateTo } = useNavigation();
  const publicComments = (ticket.comments ?? []).filter((c) => !c.isInternal);
  const commentCount   = publicComments.length;

  const updatedDate = new Date(ticket.updatedAt);
  const isRecent    = Date.now() - updatedDate.getTime() < 7 * 24 * 60 * 60 * 1000;
  const timeLabel   = isRecent
    ? formatDistanceToNow(updatedDate, { addSuffix: true })
    : format(updatedDate, "MMM d, yyyy");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigateTo(`/portal/ticket/${ticket.id}`, { from: '/portal/my-tickets' })}
      onKeyDown={(e) => e.key === "Enter" && navigateTo(`/portal/ticket/${ticket.id}`, { from: '/portal/my-tickets' })}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4",
        "cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50",
      )}
    >
      {/* Top row — number + escalated + arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {ticket.ticketNumber ?? `#${ticket.id.slice(0, 8)}`}
          </span>
          {ticket.isEscalated && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-orange-100 text-orange-700 border-orange-200">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> Escalated
            </Badge>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all mt-0.5" />
      </div>

      {/* Subject */}
      <h3 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {ticket.subject}
      </h3>

      {/* Description preview */}
      {ticket.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1 border-t border-border/50">
        <Badge variant="outline" className={cn("text-xs", getEffectiveStatusStyle(ticket.status, ticket.assignedToId))}>
          {getEffectiveStatusLabel(ticket.status, ticket.assignedToId)}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", getPriorityStyle(ticket.priority))}>
          {ticket.priority}
        </Badge>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
