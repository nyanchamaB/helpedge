'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { getMyAssignedTickets, type Ticket } from '@/lib/api/tickets';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Queue = 'all' | 'assigned' | 'inprogress' | 'waiting' | 'resolved';

const QUEUE_LABELS: Record<Queue, string> = {
  all: 'All Mine',
  assigned: 'To Start',
  inprogress: 'In Progress',
  waiting: 'Awaiting Info',
  resolved: 'Resolved',
};

const ALERT_QUEUES = new Set<Queue>(['assigned', 'waiting']);

export default function MyWorkPage() {
  const { user } = useAuth();
  const { pageParams, navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeQueue = (pageParams.queue as Queue) || 'all';

  async function fetchTickets() {
    setIsLoading(true);
    setError(null);
    const res = await getMyAssignedTickets();

    if (res.success && res.data) {setTickets(res.data);}
    else {setError(res.error ?? 'Failed to load your tickets');}
    setIsLoading(false);
  }

  useEffect(() => {
    async function loadTickets() {
      await fetchTickets();
    }

    void loadTickets();
  }, []);

  const filtered = useMemo(() => {
    switch (activeQueue) {
      case 'assigned':
        return tickets.filter((t) => t.status === 'Open');
      case 'inprogress':
        return tickets.filter((t) => t.status === 'InProgress');
      case 'waiting':
        return tickets.filter((t) => t.status === 'OnHold' || t.status === 'AwaitingInfo');
      case 'resolved':
        return tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
      default:
        return tickets;
    }
  }, [tickets, activeQueue]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      assigned: tickets.filter((t) => t.status === 'Open').length,
      inprogress: tickets.filter((t) => t.status === 'InProgress').length,
      waiting: tickets.filter((t) => t.status === 'OnHold' || t.status === 'AwaitingInfo').length,
      resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
    }),
    [tickets],
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Work</h1>
          <p className="text-muted-foreground mt-1">Tickets assigned to you for resolution</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Queue tabs */}
      <div className="flex gap-1 border-b flex-wrap">
        {(Object.keys(QUEUE_LABELS) as Queue[]).map((q) => {
          const count = counts[q];
          const isActive = activeQueue === q;
          const alertBadge = !isActive && count > 0 && ALERT_QUEUES.has(q);

          return (
            <button
              key={q}
              onClick={() => navigateTo('/resolver/tickets', { queue: q })}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {QUEUE_LABELS[q]}
              {!isLoading && (
                <span
                  className={`inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[18px] h-[18px] px-1 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : alertBadge
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <TicketsTable
        tickets={filtered}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchTickets}
        title=""
        showFilters={true}
        emptyMessage={`No ${QUEUE_LABELS[activeQueue].toLowerCase()} tickets`}
      />
    </div>
  );
}
