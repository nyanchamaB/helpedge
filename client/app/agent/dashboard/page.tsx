'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  getMyAssignedTickets,
  getUnassignedTickets,
  getTicketsPendingTriage,
  Ticket,
} from '@/lib/api/tickets';
import { getReviewQueueStats } from '@/lib/api/ai';
import { getMyStats, type MyStats } from '@/lib/api/dashboard';
import {
  getAssignedServiceRequests,
  getServiceRequestsPendingApprovalForMe,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRTypeLabel,
  type ServiceRequest,
} from '@/lib/api/service-request';
import { TicketQueueList, QueueItem } from '@/components/agent/TicketQueueList';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import type { ReviewQueueStats } from '@/lib/types/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Inbox,
  AlertCircle,
  User,
  Clock,
  Bell,
  RefreshCw,
  ClipboardCheck,
  Eye,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PAGE_LOAD_TIME = Date.now();

const SLA_WARN_HOURS: Record<string, number> = {
  Critical: 1,
  High: 4,
  Medium: 8,
  Low: 24,
};

function isSlaWarning(ticket: Ticket): boolean {
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {return false;}
  const hours = (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  const threshold = SLA_WARN_HOURS[ticket.priority] ?? 24;

  return hours > threshold * 0.75;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [unassigned, setUnassigned] = useState<Ticket[]>([]);
  const [pendingTriageCount, setPendingTriageCount] = useState(0);
  const [reviewStats, setReviewStats] = useState<ReviewQueueStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [assignedSRs, setAssignedSRs] = useState<ServiceRequest[]>([]);
  const [pendingApprovalSRs, setPendingApprovalSRs] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    const [
      myRes,
      unassignedRes,
      triageRes,
      reviewRes,
      statsRes,
      assignedSRsRes,
      pendingApprovalRes,
    ] = await Promise.all([
      getMyAssignedTickets(),
      getUnassignedTickets(),
      getTicketsPendingTriage(),
      getReviewQueueStats(),
      getMyStats(),
      getAssignedServiceRequests(),
      getServiceRequestsPendingApprovalForMe(),
    ]);

    if (myRes.success && myRes.data) {setMyTickets(myRes.data);}
    if (unassignedRes.success && unassignedRes.data) {setUnassigned(unassignedRes.data);}
    if (triageRes.success && triageRes.data) {setPendingTriageCount(triageRes.data.length);}
    if (reviewRes.success && reviewRes.data) {setReviewStats(reviewRes.data);}
    if (statsRes.success && statsRes.data) {setMyStats(statsRes.data);}
    if (assignedSRsRes.success && assignedSRsRes.data) {setAssignedSRs(assignedSRsRes.data);}
    if (pendingApprovalRes.success && pendingApprovalRes.data)
      {setPendingApprovalSRs(pendingApprovalRes.data);}
    setIsLoading(false);
  };

  useEffect(() => {
    async function run() { await fetchAll(); }
    void run();
  }, []);

  const queues = useMemo(() => {
    const waiting = myTickets.filter((t) => t.status === 'OnHold' || t.status === 'AwaitingInfo');
    const recentNew = unassigned.filter((t) => {
      const hoursAgo = (PAGE_LOAD_TIME - new Date(t.createdAt).getTime()) / 3_600_000;

      return hoursAgo < 24;
    });

    return { waiting, recentNew };
  }, [myTickets, unassigned]);

  const slaWarnings = useMemo(() => myTickets.filter(isSlaWarning), [myTickets]);

  const userReplies = useMemo(() => {
    if (!user?.id) {return [];}

    return myTickets.filter((t) =>
      (t.comments ?? []).some((c) => !c.isInternal && c.authorId !== user.id),
    );
  }, [myTickets, user]);

  const queueItems: QueueItem[] = [
    {
      id: 'new',
      label: 'New Tickets',
      icon: Inbox,
      count: queues.recentNew.length,
      description: 'Received in last 24h',
      colorClasses: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        border: 'border-blue-200',
      },
      onClick: () => navigateTo('/agent/tickets', { queue: 'unassigned' }),
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      icon: AlertCircle,
      count: unassigned.length,
      description: 'Needs an agent',
      colorClasses: {
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
        border: 'border-amber-200',
      },
      onClick: () => navigateTo('/agent/tickets', { queue: 'unassigned' }),
    },
    {
      id: 'mine',
      label: 'My Tickets',
      icon: User,
      count: myTickets.length,
      description: 'Assigned to you',
      colorClasses: {
        bg: 'bg-purple-50',
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600',
        border: 'border-purple-200',
      },
      onClick: () => navigateTo('/agent/tickets', { queue: 'mine' }),
    },
    {
      id: 'waiting',
      label: 'Waiting',
      icon: Clock,
      count: queues.waiting.length,
      description: 'Waiting for user',
      colorClasses: {
        bg: 'bg-gray-50',
        iconBg: 'bg-gray-100',
        iconText: 'text-gray-600',
        border: 'border-gray-200',
      },
      onClick: () => navigateTo('/agent/tickets', { queue: 'waiting' }),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Here is your queue
            overview.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* AI pipeline action badges */}
      {!isLoading && (pendingTriageCount > 0 || (reviewStats?.pendingCount ?? 0) > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingTriageCount > 0 && (
            <button
              onClick={() => navigateTo('/tickets/review-queue')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors"
            >
              <ClipboardCheck className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">
                {pendingTriageCount} Pending Triage
              </span>
            </button>
          )}
          {(reviewStats?.pendingCount ?? 0) > 0 && (
            <button
              onClick={() => navigateTo('/tickets/review-queue')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              <Eye className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {reviewStats!.pendingCount} In Review Queue
              </span>
            </button>
          )}
        </div>
      )}

      {/* Queue cards */}
      <TicketQueueList queues={queueItems} isLoading={isLoading} />

      {/* My performance stats */}
      {!isLoading && myStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Assigned
              </span>
            </div>
            <p className="text-2xl font-bold">{myStats.assignedTickets.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total assigned to me</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                In Progress
              </span>
            </div>
            <p className="text-2xl font-bold">{myStats.assignedTickets.inProgress}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Currently working</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Resolved
              </span>
            </div>
            <p className="text-2xl font-bold">{myStats.assignedTickets.resolved}</p>
            <p className="text-xs text-muted-foreground mt-0.5">All time</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Opened
              </span>
            </div>
            <p className="text-2xl font-bold">{myStats.createdTickets.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tickets I created</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My assigned tickets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Assigned Tickets</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigateTo('/agent/tickets', { queue: 'mine' })}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <TicketsTable
                tickets={myTickets.slice(0, 8)}
                isLoading={isLoading}
                showFilters={false}
                emptyMessage="No tickets assigned to you"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notifications sidebar */}
        <div className="space-y-4">
          {/* SLA Warnings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                SLA Warnings
                {slaWarnings.length > 0 && (
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {slaWarnings.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slaWarnings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">No SLA warnings</p>
              ) : (
                <div className="space-y-2">
                  {slaWarnings.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigateTo(`/tickets/${t.id}`, { from: '/agent/dashboard' })}
                      className="w-full text-left p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">{t.subject}</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {t.priority} · opened {format(new Date(t.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User replies */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                User Replies
                {userReplies.length > 0 && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {userReplies.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReplies.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">No new replies</p>
              ) : (
                <div className="space-y-2">
                  {userReplies.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigateTo(`/tickets/${t.id}`, { from: '/agent/dashboard' })}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">{t.subject}</p>
                      <p className="text-xs text-blue-500 mt-0.5">
                        User replied · {format(new Date(t.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ISR Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Service Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-base">My Service Requests</CardTitle>
              {assignedSRs.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                  {assignedSRs.length}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigateTo('/service-requests/queue', { tab: 'mine' })}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : assignedSRs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No service requests assigned to you
              </p>
            ) : (
              <div className="space-y-2">
                {assignedSRs.slice(0, 6).map((sr) => (
                  <button
                    key={sr.id}
                    onClick={() =>
                      navigateTo(`/service-requests/${sr.id}`, { from: '/agent/dashboard' })
                    }
                    className="w-full text-left p-2.5 rounded-lg border hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{sr.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getSRTypeLabel(sr.requestType)} · {sr.requesterName ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border ${getSRStatusStyle(sr.status)}`}
                        >
                          {getSRStatusLabel(sr.status)}
                        </span>
                        {sr.isOverdue && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                            Overdue
                          </span>
                        )}
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending My Approval */}
        <Card className={pendingApprovalSRs.length > 0 ? 'border-amber-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Eye
                className={cn(
                  'h-4 w-4',
                  pendingApprovalSRs.length > 0 ? 'text-amber-500' : 'text-muted-foreground',
                )}
              />
              <CardTitle className="text-base">Needs My Approval</CardTitle>
              {pendingApprovalSRs.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  {pendingApprovalSRs.length}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigateTo('/service-requests/queue', { tab: 'pending-approval' })}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : pendingApprovalSRs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No requests awaiting your approval
              </p>
            ) : (
              <div className="space-y-2">
                {pendingApprovalSRs.slice(0, 6).map((sr) => (
                  <button
                    key={sr.id}
                    onClick={() =>
                      navigateTo(`/service-requests/${sr.id}`, { from: '/agent/dashboard' })
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-amber-100 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{sr.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getSRTypeLabel(sr.requestType)} · {sr.requesterName ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
