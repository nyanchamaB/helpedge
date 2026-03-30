import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ArrowRight, Clock } from 'lucide-react';
import type { SimilarTicket } from '@/lib/types/ai';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SimilarTicketsWidgetProps {
  tickets: SimilarTicket[];
  onTicketClick?: (ticketId: string) => void;
  maxDisplay?: number;
  className?: string;
}

/**
 * Displays similar past tickets with similarity scores
 */
export const SimilarTicketsWidget: FC<SimilarTicketsWidgetProps> = ({
  tickets,
  onTicketClick,
  maxDisplay = 5,
  className,
}) => {
  const displayTickets = tickets.slice(0, maxDisplay);

  if (displayTickets.length === 0) {
    return null;
  }

  const formatResolutionTime = (minutes?: number) => {
    if (!minutes) {return null;}

    if (minutes < 60) {
      return `${minutes}m`;
    }
    if (minutes < 1440) {
      return `${Math.round(minutes / 60)}h`;
    }

    return `${Math.round(minutes / 1440)}d`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Similar Tickets</CardTitle>
        <p className="text-sm text-muted-foreground">
          These past tickets have similar characteristics
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayTickets.map((ticket) => (
          <div
            key={ticket.ticketId}
            className={cn(
              'rounded-lg border p-4 space-y-3 transition-colors',
              'hover:bg-accent/50',
              onTicketClick && 'cursor-pointer',
            )}
            onClick={() => onTicketClick?.(ticket.ticketId)}
            role={onTicketClick ? 'button' : undefined}
            tabIndex={onTicketClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onTicketClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onTicketClick(ticket.ticketId);
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {ticket.ticketNumber}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {ticket.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-sm line-clamp-2">{ticket.description}</p>
                {ticket.resolvedAt && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Resolved{' '}
                      {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}
                    </span>
                    {ticket.resolutionTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatResolutionTime(ticket.resolutionTime)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {onTicketClick && (
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">View ticket</span>
                </Button>
              )}
            </div>

            <ConfidenceMeter
              confidence={ticket.similarity}
              label="Similarity"
              showPercentage
              size="sm"
            />
          </div>
        ))}

        {tickets.length > maxDisplay && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{tickets.length - maxDisplay} more similar tickets
          </p>
        )}
      </CardContent>
    </Card>
  );
};
