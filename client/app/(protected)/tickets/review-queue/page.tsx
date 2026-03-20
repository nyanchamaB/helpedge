"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { getReviewQueue, getReviewQueueStats, approveTicketClassification } from '@/lib/api/ai';
import { getAllCategories } from '@/lib/api/categories';
import { getAssignableStaff } from '@/lib/api/users';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewQueueTicket } from '@/lib/types/ai';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Review Queue Page - Shows tickets with low AI confidence that need manual review
 */
export default function ReviewQueuePage() {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch review queue
  const {
    data: reviewQueueData,
    isLoading: isLoadingQueue,
    isFetching: isFetchingQueue,
    error: queueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ['review-queue'],
    queryFn: getReviewQueue,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['review-queue-stats'],
    queryFn: getReviewQueueStats,
    staleTime: 2 * 60 * 1000,
  });

  // Lookup data for resolving IDs → names
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

  const categoryMap = useMemo(() => {
    const m: Record<string, string> = {};
    (categoriesData?.data ?? []).forEach((c: any) => { m[c.id] = c.name; });
    return m;
  }, [categoriesData]);

  const userMap = useMemo(() => {
    const m: Record<string, string> = {};
    (staffData?.data ?? []).forEach((u: any) => { m[u.id] = u.fullName || `${u.firstName} ${u.lastName}`.trim(); });
    return m;
  }, [staffData]);

  const resolveCat = (id?: string) => id ? (categoryMap[id] ?? id) : '—';
  const resolveUser = (id?: string) => id ? (userMap[id] ?? id) : '—';

  // Approve mutation — passes the actual ticket ID (ticketId), not the queue entry ID (id)
  const approveMutation = useMutation({
    mutationFn: (ticketId: string) => approveTicketClassification(ticketId),
    onSuccess: (_, ticketId) => {
      // Immediately remove the ticket from local cache for instant feedback
      queryClient.setQueryData(['review-queue'], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((t: ReviewQueueTicket) => t.ticketId !== ticketId) };
      });
      // Then background-refetch both to sync server state
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['review-queue-stats'] });
      toast.success('AI classification approved', {
        description: 'Ticket has been assigned based on AI suggestion and removed from the queue.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to approve classification', {
        description: error.message,
      });
    },
  });

  // Filter out orphaned queue entries whose ticket was deleted (ticketSummary is null)
  const tickets: ReviewQueueTicket[] = (Array.isArray(reviewQueueData?.data) ? reviewQueueData.data : [])
    .filter((t: ReviewQueueTicket) => t.ticketSummary != null);
  const stats = statsData?.data;

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (categoryFilter !== 'all' && ticket.aiCategory !== categoryFilter) return false;
    if (priorityFilter !== 'all' && ticket.aiPriority !== priorityFilter) return false;
    return true;
  });

  // Extract unique categories and priorities for filters (resolved names)
  const uniqueCategories = Array.from(new Set(tickets.map((t) => t.aiCategory).filter(Boolean)));
  const uniquePriorities = Array.from(new Set(tickets.map((t) => t.aiPriority).filter(Boolean)));

  const oldestAgeMinutes = stats?.oldestPendingEntryDate
    ? Math.round((Date.now() - new Date(stats.oldestPendingEntryDate).getTime()) / 60000)
    : null;

  // Approval passes the actual ticket ID so POST /api/Tickets/{ticketId}/approve is called correctly
  const handleApprove = (ticketId: string) => {
    approveMutation.mutate(ticketId);
  };

  const handleViewTicket = (ticketId: string) => {
    navigateTo(`/tickets/${ticketId}`);
  };

  if (queueError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load review queue</h3>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Button onClick={() => refetchQueue()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">AI Review Queue</h1>
          <p className="text-muted-foreground">
            Tickets with low AI confidence requiring manual review
          </p>
        </div>
        <Button onClick={() => refetchQueue()} variant="outline" disabled={isFetchingQueue}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isFetchingQueue && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total in Queue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingCount ?? '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCount != null ? `${stats.totalCount} total processed` : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Review Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.averageReviewTimeMinutes != null
                  ? `${Math.round(stats.averageReviewTimeMinutes)}m`
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                Per ticket
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Oldest Ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {oldestAgeMinutes != null ? oldestAgeMinutes : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">minutes waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Status</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.pendingCount === 0 ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    All clear! AI is performing well 🎉
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <p className="text-sm text-yellow-600 mt-1 font-medium">
                    Needs attention
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {uniquePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority!}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(categoryFilter !== 'all' || priorityFilter !== 'all') && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets Requiring Review ({filteredTickets.length})
          </CardTitle>
          <CardDescription>
            Review and approve or override AI classifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQueue ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets need review</h3>
              <p className="text-muted-foreground">
                {tickets.length > 0
                  ? 'Try adjusting your filters'
                  : 'The AI is performing well with high confidence classifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <TicketReviewCard
                  key={ticket.id}
                  ticket={ticket}
                  onApprove={handleApprove}
                  onView={handleViewTicket}
                  isApproving={approveMutation.isPending}
                  resolveCat={resolveCat}
                  resolveUser={resolveUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Ticket Review Card Component
interface TicketReviewCardProps {
  ticket: ReviewQueueTicket;
  onApprove: (ticketId: string) => void;
  onView: (ticketId: string) => void;
  isApproving: boolean;
  resolveCat: (id?: string) => string;
  resolveUser: (id?: string) => string;
}

function TicketReviewCard({ ticket, onApprove, onView, isApproving, resolveCat, resolveUser }: TicketReviewCardProps) {
  const ticketNumber = ticket.ticketSummary?.ticketNumber;
  const displayNumber = ticketNumber && !ticketNumber.match(/^[0-9a-f]{20,}$/i)
    ? ticketNumber
    : `#${ticket.ticketId.slice(-6).toUpperCase()}`;

  return (
    <div className="rounded-lg border p-4 space-y-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">
              {displayNumber}
            </span>
            {ticket.aiCategoryConfidence !== undefined && (
              <ConfidenceBadge
                confidence={ticket.aiCategoryConfidence}
                method="tfidf"
                needsReview
                size="sm"
              />
            )}
            {ticket.queueStatus && (
              <Badge variant="outline" className="text-xs">
                {ticket.queueStatus}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-1">
            {ticket.ticketSummary?.subject ?? '(No subject)'}
          </h3>
          {ticket.reviewReason && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.reviewReason}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {ticket.addedToQueueAt && !isNaN(new Date(ticket.addedToQueueAt).getTime())
                ? `Queued ${formatDistanceToNow(new Date(ticket.addedToQueueAt), { addSuffix: true })}`
                : 'Queued recently'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">AI Suggestion:</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Category: </span>
            <span className="font-medium">{resolveCat(ticket.aiCategory)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Priority: </span>
            <span className="font-medium">{ticket.aiPriority || '—'}</span>
          </div>
          {ticket.aiAssignee && (
            <div>
              <span className="text-muted-foreground">Assignee: </span>
              <span className="font-medium">{resolveUser(ticket.aiAssignee)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onView(ticket.ticketId)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button
          size="sm"
          onClick={() => onApprove(ticket.ticketId)}
          disabled={isApproving}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve AI Suggestion
        </Button>
      </div>
    </div>
  );
}
