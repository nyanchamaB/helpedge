'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { getTicketsByCreator, Ticket } from '@/lib/api/tickets';
import { TicketCard } from '@/components/portal/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  RefreshCw,
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  X,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

// Status tab definitions
const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'OnHold', label: 'On Hold' },
  { value: 'AwaitingInfo', label: 'Awaiting Info' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'updated-asc', label: 'Oldest updated' },
  { value: 'created-desc', label: 'Newest created' },
  { value: 'created-asc', label: 'Oldest created' },
  { value: 'priority', label: 'Priority' },
];

const PRIORITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function getInitials(firstName?: string, lastName?: string) {
  return ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || 'U';
}

export default function PortalMyTickets() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('updated-desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && user) {fetchTickets();}
  }, [authLoading, user]);

  async function fetchTickets() {
    if (!user?.id) {return;}
    setIsLoading(true);
    setError(null);
    const res = await getTicketsByCreator(user.id);

    if (res.success && res.data) {setTickets(res.data);}
    else {setError(res.error ?? 'Failed to load tickets');}
    setIsLoading(false);
  }

  // Counts per status tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tickets.length };

    tickets.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });

    return counts;
  }, [tickets]);

  // Stats
  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'InProgress').length,
      resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
      escalated: tickets.filter((t) => t.isEscalated).length,
    }),
    [tickets],
  );

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) {return false;}
      if (search.trim()) {
        const q = search.toLowerCase();

        if (
          !t.subject.toLowerCase().includes(q) &&
          !(t.ticketNumber ?? '').toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        )
          {return false;}
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'updated-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [tickets, statusFilter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleStatusTab = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const hasFilters = search !== '' || statusFilter !== 'all';

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {user?.firstName ? `Welcome back, ${user.firstName}` : 'My Support Tickets'}
            </h1>
            <p className="text-sm text-muted-foreground">Track and manage your support requests</p>
          </div>
        </div>
        <Button
          onClick={() => navigateTo('/portal/create-ticket', { from: '/portal/my-tickets' })}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Ticket
        </Button>
      </div>

      {/* ── Stats ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<TicketIcon className="h-4 w-4" />}
            label="Total"
            value={stats.total}
            accent="blue"
            active={statusFilter === 'all'}
            onClick={() => handleStatusTab('all')}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Open"
            value={stats.open}
            accent="amber"
            active={statusFilter === 'Open'}
            onClick={() => handleStatusTab('Open')}
          />
          <StatCard
            icon={<RefreshCw className="h-4 w-4" />}
            label="In Progress"
            value={stats.inProgress}
            accent="violet"
            active={statusFilter === 'InProgress'}
            onClick={() => handleStatusTab('InProgress')}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Resolved"
            value={stats.resolved}
            accent="green"
            active={statusFilter === 'Resolved'}
            onClick={() => handleStatusTab('Resolved')}
          />
        </div>
      )}

      {/* Escalated notice */}
      {!isLoading && stats.escalated > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 px-4 py-2.5 text-sm text-orange-700 dark:text-orange-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {stats.escalated === 1
              ? '1 of your tickets has been escalated for urgent attention.'
              : `${stats.escalated} of your tickets have been escalated for urgent attention.`}
          </span>
        </div>
      )}

      {/* ── Status tabs ── */}
      <div className="border-b flex gap-0.5 overflow-x-auto no-scrollbar -mb-1">
        {STATUS_TABS.map((tab) => {
          const count = tabCounts[tab.value] ?? 0;
          const isActive = statusFilter === tab.value;

          if (tab.value !== 'all' && !isLoading && count === 0) {return null;}

          return (
            <button
              key={tab.value}
              onClick={() => handleStatusTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors shrink-0',
                isActive
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {!isLoading && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full text-xs min-w-[18px] h-[18px] px-1 tabular-nums',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tab.value === 'all' ? tickets.length : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search + Sort bar ── */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tickets…"
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-9 text-sm w-auto min-w-[170px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={fetchTickets}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* ── Results label ── */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground -mt-3">
          {filtered.length === 0 ? (
            'No tickets found'
          ) : (
            <>
              Showing{' '}
              <span className="font-medium text-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{' '}
              of <span className="font-medium text-foreground">{filtered.length}</span>
            </>
          )}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="ml-2 text-primary underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          {error}
          <Button variant="outline" size="sm" className="mt-3 ml-2" onClick={fetchTickets}>
            Try again
          </Button>
        </div>
      ) : paged.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onCreateNew={() => navigateTo('/portal/create-ticket', { from: '/portal/my-tickets' })}
          onClear={() => {
            setSearch('');
            setStatusFilter('all');
            setPage(1);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </>
      )}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

const accentMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/40',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/40',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/40',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    icon: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-500/40',
  },
};

function StatCard({
  icon,
  label,
  value,
  accent,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const a = accentMap[accent] ?? accentMap.blue;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all w-full',
        a.bg,
        active ? `ring-2 ${a.ring} border-transparent` : 'hover:shadow-sm',
      )}
    >
      <div className={cn('shrink-0', a.icon)}>{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </button>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const range: (number | '…')[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '…') {
        range.push('…');
      }
    }

    return range;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="h-8 px-3 text-xs"
      >
        Previous
      </Button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="text-muted-foreground text-sm px-1">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0 text-xs"
            onClick={() => onChange(p as number)}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="h-8 px-3 text-xs"
      >
        Next
      </Button>
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onCreateNew,
  onClear,
}: {
  hasFilters: boolean;
  onCreateNew: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-3">
      <div className="rounded-full bg-muted p-4">
        <TicketIcon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="font-semibold text-lg">
        {hasFilters ? 'No tickets match your filters' : 'No tickets yet'}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasFilters
          ? 'Try adjusting your search or selecting a different status.'
          : "Submit your first support request and we'll get back to you shortly."}
      </p>
      {hasFilters ? (
        <Button variant="outline" size="sm" onClick={onClear}>
          <X className="h-3.5 w-3.5 mr-1.5" /> Clear filters
        </Button>
      ) : (
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-1.5" /> Create Ticket
        </Button>
      )}
    </div>
  );
}
