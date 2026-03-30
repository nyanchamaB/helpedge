'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMyServiceRequests } from '@/hooks/service-requests/useServiceRequests';
import {
  ServiceRequest,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
  SR_STATUS_FLOW,
} from '@/lib/api/service-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Search, Clock, AlertCircle, ChevronRight } from 'lucide-react';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
    </div>
  );
}

function StatusProgress({ status }: { status: ServiceRequest['status'] }) {
  const isTerminal = ['Rejected', 'Cancelled'].includes(status);

  if (isTerminal) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getSRStatusStyle(status)}`}
      >
        {getSRStatusLabel(status)}
      </span>
    );
  }
  const idx = SR_STATUS_FLOW.indexOf(status as (typeof SR_STATUS_FLOW)[number]);

  return (
    <div className="flex items-center gap-1">
      {SR_STATUS_FLOW.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`h-2 w-2 rounded-full ${i < idx ? 'bg-green-500' : i === idx ? 'bg-primary' : 'bg-muted'}`}
          />
          {i < SR_STATUS_FLOW.length - 1 && (
            <div className={`h-0.5 w-4 ${i < idx ? 'bg-green-500' : 'bg-muted'}`} />
          )}
        </div>
      ))}
      <span className={`ml-1 text-xs px-2 py-0.5 rounded-full border ${getSRStatusStyle(status)}`}>
        {getSRStatusLabel(status)}
      </span>
    </div>
  );
}

function RequestCard({ req, onClick }: { req: ServiceRequest; onClick: () => void }) {
  return (
    <div
      className="rounded-lg border bg-card p-4 hover:shadow-md cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{req.requestNumber}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded border ${getSRPriorityStyle(req.priority)}`}
            >
              {req.priority}
            </span>
            {req.isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          <p className="font-semibold text-sm truncate">{req.subject}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{getSRTypeLabel(req.requestType)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <StatusProgress status={req.status} />
        <p className="text-xs text-muted-foreground">
          {req.submittedAt
            ? `Submitted ${new Date(req.submittedAt).toLocaleDateString()}`
            : `Created ${new Date(req.createdAt).toLocaleDateString()}`}
        </p>
      </div>
      {req.requiredByDate && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Required by {new Date(req.requiredByDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default function MyRequestsPage() {
  const { navigateTo } = useNavigation();
  const { data: requests = [], isLoading } = useMyServiceRequests();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const stats = useMemo(
    () => ({
      totalRequests: requests.length,
      pendingApprovalCount: requests.filter((r) => r.status === 'PendingApproval').length,
      inProgressCount: requests.filter((r) => r.status === 'InProgress').length,
      fulfilledCount: requests.filter((r) => r.status === 'Fulfilled').length,
    }),
    [requests],
  );

  const tabCounts = useMemo(
    () => ({
      all: requests.length,
      active: requests.filter((r) =>
        ['Draft', 'PendingApproval', 'Approved', 'InProgress', 'OnHold'].includes(r.status),
      ).length,
      Draft: requests.filter((r) => r.status === 'Draft').length,
      PendingApproval: requests.filter((r) => r.status === 'PendingApproval').length,
      closed: requests.filter((r) =>
        ['Fulfilled', 'Closed', 'Rejected', 'Cancelled'].includes(r.status),
      ).length,
    }),
    [requests],
  );

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'Draft', label: 'Drafts' },
    { key: 'PendingApproval', label: 'Pending' },
    { key: 'closed', label: 'Closed' },
  ];

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.subject.toLowerCase().includes(search.toLowerCase()) ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase());

      if (filter === 'all') {return matchSearch;}
      if (filter === 'active')
        {return (
          matchSearch &&
          ['Draft', 'PendingApproval', 'Approved', 'InProgress', 'OnHold'].includes(r.status)
        );}
      if (filter === 'closed')
        {return matchSearch && ['Fulfilled', 'Closed', 'Rejected', 'Cancelled'].includes(r.status);}

      return matchSearch && r.status === filter;
    });
  }, [requests, search, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Service Requests</h1>
            <p className="text-sm text-muted-foreground">Track the requests you have submitted</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            navigateTo('/service-requests/create-request', {
              from: '/service-requests/my-requests',
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <StatCard label="Total" value={stats.totalRequests} color="text-foreground" />
            <StatCard
              label="Pending Approval"
              value={stats.pendingApprovalCount}
              color="text-amber-600"
            />
            <StatCard label="In Progress" value={stats.inProgressCount} color="text-yellow-600" />
            <StatCard label="Fulfilled" value={stats.fulfilledCount} color="text-green-600" />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          {filterTabs.map((t) => {
            const count = tabCounts[t.key as keyof typeof tabCounts];
            const isActive = filter === t.key;

            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                {!isLoading && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[16px] h-[16px] px-1 ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : t.key === 'PendingApproval'
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
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <AlertCircle className="h-10 w-10 opacity-30" />
          <p className="text-sm">No requests found</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigateTo('/service-requests/create-request', {
                from: '/service-requests/my-requests',
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Raise a Request
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              onClick={() =>
                navigateTo(`/service-requests/${req.id}`, { from: '/service-requests/my-requests' })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
