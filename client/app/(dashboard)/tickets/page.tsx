'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  getAllTickets,
  getMyAssignedTickets,
  getUnassignedTickets,
  deleteTicket,
  type Ticket,
} from '@/lib/api/tickets';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import { TicketAnalyticsCards } from '@/components/manager/TicketAnalyticsCards';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Queue =
  | 'all'
  | 'open'
  | 'unassigned'
  | 'mine'
  | 'inprogress'
  | 'waiting'
  | 'escalated'
  | 'resolved';

const QUEUE_LABELS: Record<Queue, string> = {
  all: 'All',
  open: 'Open',
  unassigned: 'Unassigned',
  mine: 'Mine',
  inprogress: 'In Progress',
  waiting: 'Waiting',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

// Roles with full system-wide ticket visibility
const MANAGER_ROLES = ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'];
// Roles allowed to delete tickets
const DELETE_ROLES = ['Admin', 'ITManager', 'TeamLead'];

// Tabs visible per role group
const MANAGER_TABS: Queue[] = [
  'all',
  'open',
  'unassigned',
  'mine',
  'inprogress',
  'escalated',
  'resolved',
];
const AGENT_TABS: Queue[] = ['all', 'unassigned', 'mine', 'inprogress', 'waiting'];

// Tabs that get amber highlight when non-zero
const ALERT_TABS = new Set<Queue>(['unassigned', 'waiting', 'escalated']);

export default function TicketsPage() {
  const { user } = useAuth();
  const { pageParams, navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isManager = MANAGER_ROLES.includes(user?.role ?? '');
  const canDelete = DELETE_ROLES.includes(user?.role ?? '');
  const visibleTabs = isManager ? MANAGER_TABS : AGENT_TABS;

  async function fetchTickets() {
    setIsLoading(true);
    setError(null);
    if (isManager) {
      const res = await getAllTickets();

      if (res.success && res.data) {setTickets(res.data);}
      else {setError(res.error ?? 'Failed to load tickets');}
    } else {
      const [myRes, unassignedRes] = await Promise.all([
        getMyAssignedTickets(),
        getUnassignedTickets(),
      ]);

      if (myRes.success && myRes.data) {setMyTickets(myRes.data);}
      if (unassignedRes.success && unassignedRes.data) {setUnassignedTickets(unassignedRes.data);}
    }
    setIsLoading(false);
  }

  const activeQueue = useMemo(() => {
    const q = pageParams.queue as Queue | undefined;

    // Fall back to "all" if the queue param isn't valid for this role
    return q && visibleTabs.includes(q) ? q : 'all';
  }, [pageParams.queue, visibleTabs]);

  useEffect(() => {
    fetchTickets();
  }, [user?.role]);

  async function fetchTickets() {
    setIsLoading(true);
    setError(null);
    if (isManager) {
      const res = await getAllTickets();

      if (res.success && res.data) {setTickets(res.data);}
      else {setError(res.error ?? 'Failed to load tickets');}
    } else {
      const [myRes, unassignedRes] = await Promise.all([
        getMyAssignedTickets(),
        getUnassignedTickets(),
      ]);

      if (myRes.success && myRes.data) {setMyTickets(myRes.data);}
      if (unassignedRes.success && unassignedRes.data) {setUnassignedTickets(unassignedRes.data);}
    }
    setIsLoading(false);
  }

  const allAvailable = useMemo(
    () => (isManager ? tickets : [...myTickets, ...unassignedTickets]),
    [isManager, tickets, myTickets, unassignedTickets],
  );

  const filtered = useMemo(() => {
    switch (activeQueue) {
      case 'open':
        return allAvailable.filter((t) => t.status === 'Open');
      case 'unassigned':
        return allAvailable.filter((t) => t.status === 'Open' && !t.assignedToId);
      case 'mine':
        return allAvailable.filter((t) => t.assignedToId === user?.id);
      case 'inprogress':
        return allAvailable.filter((t) => t.status === 'InProgress');
      case 'waiting':
        return allAvailable.filter((t) => t.status === 'OnHold' || t.status === 'AwaitingInfo');
      case 'escalated':
        return allAvailable.filter((t) => t.isEscalated);
      case 'resolved':
        return allAvailable.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
      default:
        return allAvailable;
    }
  }, [allAvailable, activeQueue, user?.id]);

  const counts = useMemo(
    () => ({
      all: allAvailable.length,
      open: allAvailable.filter((t) => t.status === 'Open').length,
      unassigned: allAvailable.filter((t) => t.status === 'Open' && !t.assignedToId).length,
      mine: allAvailable.filter((t) => t.assignedToId === user?.id).length,
      inprogress: allAvailable.filter((t) => t.status === 'InProgress').length,
      waiting: allAvailable.filter((t) => t.status === 'OnHold' || t.status === 'AwaitingInfo')
        .length,
      escalated: allAvailable.filter((t) => t.isEscalated).length,
      resolved: allAvailable.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
    }),
    [allAvailable, user?.id],
  );

  async function handleDelete(ticket: Ticket) {
    const res = await deleteTicket(ticket.id);

    if (res.success) {
      toast.success('Ticket deleted');
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    } else {
      toast.error('Failed to delete ticket', { description: res.error });
    }
  }

  async function handleBulkDelete(ids: string[]) {
    const results = await Promise.allSettled(ids.map((id) => deleteTicket(id)));
    const succeededIds = ids.filter((_, i) => {
      const r = results[i];

      return r.status === 'fulfilled' && (r.value as { success: boolean }).success;
    });
    const failed = ids.length - succeededIds.length;

    if (succeededIds.length > 0) {
      setTickets((prev) => prev.filter((t) => !succeededIds.includes(t.id)));
      toast.success(`${succeededIds.length} ticket${succeededIds.length !== 1 ? 's' : ''} deleted`);
    }
    if (failed > 0) {
      toast.error(`${failed} ticket${failed !== 1 ? 's' : ''} could not be deleted`);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Tickets</h1>
          <p className="text-muted-foreground mt-1">
            {isManager
              ? 'Full ticket visibility across all agents'
              : 'Your queue and unassigned tickets'}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <Button variant="outline" size="sm" onClick={() => navigateTo('/manager/dashboard')}>
              Dashboard
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics row — managers only */}
      {isManager && <TicketAnalyticsCards tickets={allAvailable} isLoading={isLoading} />}

      {/* Queue tabs */}
      <div className="flex gap-1 border-b flex-wrap">
        {visibleTabs.map((q) => {
          const count = counts[q];
          const isActive = activeQueue === q;
          const alertBadge = !isActive && count > 0 && ALERT_TABS.has(q);

          return (
            <button
              key={q}
              onClick={() => navigateTo('/tickets', { queue: q })}
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
                        ? q === 'escalated'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-700'
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
        onDelete={canDelete ? handleDelete : undefined}
        onBulkDelete={canDelete ? handleBulkDelete : undefined}
      />
    </div>
  );
}
