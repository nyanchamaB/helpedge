'use client';

import { format } from 'date-fns';
import { Ticket, getStatusString, TicketStatusString } from '@/lib/api/tickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

const statusStyle: Record<TicketStatusString, string> = {
  Open: 'bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  InProgress:
    'bg-yellow-100 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  Resolved:
    'bg-green-100 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  Closed:
    'bg-gray-100 text-gray-600 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
  OnHold:
    'bg-purple-100 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  AwaitingInfo:
    'bg-teal-100 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
};

const priorityStyle: Record<string, string> = {
  Critical:
    'bg-red-100 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  High: 'bg-orange-100 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  Medium:
    'bg-blue-100 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  Low: 'bg-gray-100 text-gray-600 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
};

interface EscalationPanelProps {
  tickets: Ticket[];
  maxItems?: number;
}

export function EscalationPanel({ tickets, maxItems = 10 }: EscalationPanelProps) {
  const { navigateTo } = useNavigation();

  const escalated = tickets
    .filter((t) => t.isEscalated && t.status !== 'Closed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  if (escalated.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mb-2 text-muted-foreground/40" />
        <p className="text-sm">No escalated tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {escalated.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-colors"
        >
          <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">
                {ticket.ticketNumber ?? ticket.id.slice(0, 8)}
              </span>
              <Badge variant="outline" className={cn('text-xs', statusStyle[ticket.status])}>
                {getStatusString(ticket.status)}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', priorityStyle[ticket.priority])}>
                {ticket.priority}
              </Badge>
              <span className="text-xs text-muted-foreground">
                · updated {format(new Date(ticket.updatedAt), 'MMM d')}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
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
