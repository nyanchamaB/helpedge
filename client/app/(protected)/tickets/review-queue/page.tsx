'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/contexts/NavigationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge';
import { ClassificationMethod } from '@/lib/types/ai';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  RefreshCw,
  TrendingDown,
  Clock,
  Search,
  X,
  SlidersHorizontal,
  Brain,
  ArrowUpDown,
  Tag,
  User2,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { getReviewQueue, getReviewQueueStats, approveTicketClassification } from '@/lib/api/ai';
import { getAllCategories } from '@/lib/api/categories';
import { getAssignableStaff } from '@/lib/api/users';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewQueueTicket, ReviewQueueStats } from '@/lib/types/ai';
import { cn } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

function confidenceBorderClass(confidence?: number) {
  if (confidence == null) {return 'border-l-muted';}
  if (confidence < 0.4) {return 'border-l-red-500';}
  if (confidence < 0.6) {return 'border-l-orange-400';}

  return 'border-l-yellow-400';
}

function confidenceBarClass(confidence?: number) {
  if (confidence == null) {return 'bg-muted';}
  if (confidence < 0.4) {return 'bg-red-500';}
  if (confidence < 0.6) {return 'bg-orange-400';}

  return 'bg-yellow-400';
}

function priorityBadgeClass(priority?: string) {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

const CONF_FILTER_OPTIONS = [
  { value: 'all', label: 'Any confidence' },
  { value: 'critical', label: 'Critical  (<40%)' },
  { value: 'low', label: 'Low  (40–60%)' },
  { value: 'medium', label: 'Medium  (60–80%)' },
];

const SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'conf-asc', label: 'Lowest confidence' },
  { value: 'conf-desc', label: 'Highest confidence' },
];

function matchesConfFilter(ticket: ReviewQueueTicket, filter: string) {
  const c = ticket.aiCategoryConfidence;

  if (filter === 'all') {return true;}
  if (c == null) {return false;}
  if (filter === 'critical') {return c < 0.4;}
  if (filter === 'low') {return c >= 0.4 && c < 0.6;}
  if (filter === 'medium') {return c >= 0.6 && c < 0.8;}

  return true;
}

// ─── page ───────────────────────────────────────────────────────────────────

export default function ReviewQueuePage() {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [priFilter, setPriFilter] = useState('all');
  const [confFilter, setConfFilter] = useState('all');
  const [sort, setSort] = useState('oldest');

  // ── queries ──
  const {
    data: queueData,
    isLoading: loadingQueue,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['review-queue'],
    queryFn: getReviewQueue,
    staleTime: 2 * 60 * 1000,
  });

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['review-queue-stats'],
    queryFn: getReviewQueueStats,
    staleTime: 2 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-users'],
    queryFn: getAssignableStaff,
    staleTime: 10 * 60 * 1000,
  });

  // ── lookup maps ──
  const categoryMap = useMemo(() => {
    const m: Record<string, string> = {};

    (categoriesData?.data ?? []).forEach((c: any) => {
      m[c.id] = c.name;
    });

    return m;
  }, [categoriesData]);

  const userMap = useMemo(() => {
    const m: Record<string, string> = {};

    (staffData?.data ?? []).forEach((u: any) => {
      m[u.id] = u.fullName || `${u.firstName} ${u.lastName}`.trim();
    });

    return m;
  }, [staffData]);

  const resolveCat = (id?: string) => (id ? (categoryMap[id] ?? id) : '—');
  const resolveUser = (id?: string) => (id ? (userMap[id] ?? id) : '—');

  // ── approve mutation ──
  const approveMutation = useMutation({
    mutationFn: (ticketId: string) => approveTicketClassification(ticketId),
    onSuccess: (_, ticketId) => {
      queryClient.setQueryData(['review-queue'], (old: any) => {
        if (!old?.data) {return old;}

        return { ...old, data: old.data.filter((t: ReviewQueueTicket) => t.ticketId !== ticketId) };
      });
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['review-queue-stats'] });
      toast.success('Classification approved', {
        description: 'Ticket has been assigned based on AI suggestion.',
      });
    },
    onError: (err: Error) => {
      toast.error('Failed to approve', { description: err.message });
    },
  });

  // ── raw list ──
  const tickets: ReviewQueueTicket[] = (
    Array.isArray(queueData?.data) ? queueData.data : []
  ).filter((t: ReviewQueueTicket) => t.ticketSummary != null);

  const stats: ReviewQueueStats | undefined = statsData?.data;

  // ── unique filter values ──
  const uniqueCategories = Array.from(
    new Set(tickets.map((t) => t.aiCategory).filter(Boolean)),
  ) as string[];
  const uniquePriorities = Array.from(
    new Set(tickets.map((t) => t.aiPriority).filter(Boolean)),
  ) as string[];

  // ── active filters ──
  const activeFilters = [
    catFilter !== 'all'
      ? { key: 'cat', label: `Category: ${catFilter}`, clear: () => setCatFilter('all') }
      : null,
    priFilter !== 'all'
      ? { key: 'pri', label: `Priority: ${priFilter}`, clear: () => setPriFilter('all') }
      : null,
    confFilter !== 'all'
      ? {
          key: 'conf',
          label: CONF_FILTER_OPTIONS.find((o) => o.value === confFilter)?.label ?? confFilter,
          clear: () => setConfFilter('all'),
        }
      : null,
    search.trim() ? { key: 'q', label: `"${search.trim()}"`, clear: () => setSearch('') } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setCatFilter('all');
    setPriFilter('all');
    setConfFilter('all');
    setSearch('');
  };

  // ── filtered + sorted ──
  const filtered = useMemo(() => {
    let result = tickets.filter((t) => {
      if (catFilter !== 'all' && t.aiCategory !== catFilter) {return false;}
      if (priFilter !== 'all' && t.aiPriority !== priFilter) {return false;}
      if (!matchesConfFilter(t, confFilter)) {return false;}
      if (search.trim()) {
        const q = search.toLowerCase();

        if (
          !t.ticketSummary?.subject?.toLowerCase().includes(q) &&
          !t.ticketSummary?.ticketNumber?.toLowerCase().includes(q) &&
          !t.reviewReason?.toLowerCase().includes(q)
        )
          {return false;}
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'newest')
        {return new Date(b.addedToQueueAt).getTime() - new Date(a.addedToQueueAt).getTime();}
      if (sort === 'conf-asc') {return (a.aiCategoryConfidence ?? 1) - (b.aiCategoryConfidence ?? 1);}
      if (sort === 'conf-desc')
        {return (b.aiCategoryConfidence ?? 0) - (a.aiCategoryConfidence ?? 0);}

      return new Date(a.addedToQueueAt).getTime() - new Date(b.addedToQueueAt).getTime(); // oldest
    });

    return result;
  }, [tickets, catFilter, priFilter, confFilter, search, sort]);

  const oldestMinutes = stats?.oldestPendingEntryDate
    ? Math.round((Date.now() - new Date(stats.oldestPendingEntryDate).getTime()) / 60000)
    : null;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Failed to load review queue</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">AI Review Queue</h1>
            {!loadingQueue && tickets.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 border border-amber-200"
              >
                {tickets.length} pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tickets where AI confidence is low — review and approve or override
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ── Stats row ── */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
            label="Pending Review"
            value={stats.pendingCount ?? '—'}
            sub={stats.totalCount != null ? `${stats.totalCount} total processed` : undefined}
            accent="amber"
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            label="Avg. Review Time"
            value={
              stats.averageReviewTimeMinutes != null
                ? `${Math.round(stats.averageReviewTimeMinutes)}m`
                : '—'
            }
            sub="per ticket"
            accent="blue"
          />
          <StatCard
            icon={<TrendingDown className="h-4 w-4 text-violet-600" />}
            label="Oldest Waiting"
            value={oldestMinutes != null ? `${oldestMinutes}m` : '—'}
            sub="time in queue"
            accent="violet"
          />
          <StatCard
            icon={
              stats.pendingCount === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )
            }
            label="Status"
            value={stats.pendingCount === 0 ? 'All clear' : 'Needs attention'}
            sub={
              stats.pendingCount === 0
                ? 'AI performing well'
                : `${stats.approvedCount ?? 0} approved today`
            }
            accent={stats.pendingCount === 0 ? 'green' : 'red'}
          />
        </div>
      ) : null}

      {/* ── Filter bar ── */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search subject, ticket #…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category */}
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-9 text-sm w-auto min-w-[140px]">
              <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {uniqueCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select value={priFilter} onValueChange={setPriFilter}>
            <SelectTrigger className="h-9 text-sm w-auto min-w-[130px]">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {uniquePriorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Confidence */}
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="h-9 text-sm w-auto min-w-[160px]">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              {CONF_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
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
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
              >
                {f.label}
                <button onClick={f.clear} className="hover:text-primary/70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loadingQueue ? (
            'Loading…'
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{filtered.length}</span>
              {filtered.length !== tickets.length && ` of ${tickets.length}`} ticket
              {filtered.length !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>

      {/* ── Ticket list ── */}
      {loadingQueue ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-medium text-lg">
              {tickets.length > 0 ? 'No tickets match your filters' : 'Queue is empty'}
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {tickets.length > 0
                ? 'Try adjusting or clearing the active filters.'
                : 'The AI is classifying tickets with high confidence — nothing to review right now.'}
            </p>
            {activeFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                <X className="h-3.5 w-3.5 mr-1.5" /> Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <TicketReviewCard
              key={ticket.id}
              ticket={ticket}
              onApprove={(id) => approveMutation.mutate(id)}
              onView={(id) => navigateTo(`/tickets/${id}`, { from: '/tickets/review-queue' })}
              isApproving={approveMutation.isPending}
              resolveCat={resolveCat}
              resolveUser={resolveUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────────────────

const accentBg: Record<string, string> = {
  amber: 'bg-amber-50  dark:bg-amber-950/30',
  blue: 'bg-blue-50   dark:bg-blue-950/30',
  violet: 'bg-violet-50 dark:bg-violet-950/30',
  green: 'bg-green-50  dark:bg-green-950/30',
  red: 'bg-red-50    dark:bg-red-950/30',
};

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={cn('rounded-xl border p-4 space-y-2', accentBg[accent])}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── TicketReviewCard ────────────────────────────────────────────────────────

interface TicketReviewCardProps {
  ticket: ReviewQueueTicket;
  onApprove: (ticketId: string) => void;
  onView: (ticketId: string) => void;
  isApproving: boolean;
  resolveCat: (id?: string) => string;
  resolveUser: (id?: string) => string;
}

function TicketReviewCard({
  ticket,
  onApprove,
  onView,
  isApproving,
  resolveCat,
  resolveUser,
}: TicketReviewCardProps) {
  const ticketNumber = ticket.ticketSummary?.ticketNumber;
  const displayNumber =
    ticketNumber && !ticketNumber.match(/^[0-9a-f]{20,}$/i)
      ? ticketNumber
      : `#${ticket.ticketId.slice(-6).toUpperCase()}`;

  const conf = ticket.aiCategoryConfidence;
  const confPct = conf != null ? Math.round(conf * 100) : null;

  const queuedAt =
    ticket.addedToQueueAt && !isNaN(new Date(ticket.addedToQueueAt).getTime())
      ? formatDistanceToNow(new Date(ticket.addedToQueueAt), { addSuffix: true })
      : 'recently';

  return (
    <div
      className={cn(
        'rounded-xl border border-l-4 bg-card hover:shadow-sm transition-shadow',
        confidenceBorderClass(conf),
      )}
    >
      <div className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {displayNumber}
              </span>
              {conf != null && (
                <ConfidenceBadge
                  confidence={conf}
                  method={ClassificationMethod.MachineLearning}
                  needsReview
                  size="sm"
                />
              )}
              {ticket.aiPriority && (
                <Badge
                  variant="outline"
                  className={cn('text-xs capitalize border', priorityBadgeClass(ticket.aiPriority))}
                >
                  {ticket.aiPriority}
                </Badge>
              )}
              {ticket.queueStatus && (
                <Badge variant="outline" className="text-xs">
                  {ticket.queueStatus}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-snug line-clamp-1">
              {ticket.ticketSummary?.subject ?? '(No subject)'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3.5 w-3.5" />
            {queuedAt}
          </div>
        </div>

        {/* Review reason */}
        {ticket.reviewReason && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border-l-2 border-amber-300 line-clamp-2">
            {ticket.reviewReason}
          </p>
        )}

        {/* AI suggestion panel */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" /> AI Suggestion
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AISuggestionCell
              icon={<Tag className="h-3.5 w-3.5" />}
              label="Category"
              value={resolveCat(ticket.aiCategory)}
              confidence={ticket.aiCategoryConfidence}
              confClass={confidenceBarClass(ticket.aiCategoryConfidence)}
            />
            <AISuggestionCell
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Priority"
              value={ticket.aiPriority || '—'}
              confidence={ticket.aiPriorityConfidence}
              confClass={confidenceBarClass(ticket.aiPriorityConfidence)}
            />
            <AISuggestionCell
              icon={<User2 className="h-3.5 w-3.5" />}
              label="Assignee"
              value={resolveUser(ticket.aiAssignee)}
              confidence={ticket.aiAssigneeConfidence}
              confClass={confidenceBarClass(ticket.aiAssigneeConfidence)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(ticket.ticketId)}
            className="text-muted-foreground"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View ticket
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="sm"
            onClick={() => onApprove(ticket.ticketId)}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Approve suggestion
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── AISuggestionCell ────────────────────────────────────────────────────────

function AISuggestionCell({
  icon,
  label,
  value,
  confidence,
  confClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  confidence?: number;
  confClass: string;
}) {
  const pct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium leading-snug line-clamp-1" title={value}>
        {value}
      </p>
      {pct != null && (
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', confClass)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
        </div>
      )}
    </div>
  );
}
