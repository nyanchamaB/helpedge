'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAllServiceRequests,
  useAssignedServiceRequests,
  usePendingApprovalForMe,
  useOverdueServiceRequests,
} from '@/hooks/service-requests/useServiceRequests';
import {
  ServiceRequest,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_TYPES,
} from '@/lib/api/service-request';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  DataTableAction,
} from '@/components/data-table';
import { Inbox, RefreshCw, Eye, ClipboardCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type QueueTab = 'unassigned' | 'mine' | 'pending-approval' | 'overdue';

const TABS: { key: QueueTab; label: string; description: string }[] = [
  { key: 'unassigned', label: 'Unassigned', description: 'Approved requests not yet assigned' },
  { key: 'mine', label: 'My Queue', description: 'Requests assigned to me' },
  {
    key: 'pending-approval',
    label: 'Needs My Approval',
    description: 'Requests awaiting my approval',
  },
  { key: 'overdue', label: 'Overdue', description: 'Requests past their required-by date' },
];

function formatDate(d?: string | null) {
  if (!d) {return '—';}
  try {
    return format(new Date(d), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

const accentMap: Record<QueueTab, { bg: string; icon: string }> = {
  unassigned: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-600 dark:text-blue-400' },
  mine: { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'text-violet-600 dark:text-violet-400' },
  'pending-approval': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  overdue: { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400' },
};

const tabIcons: Record<QueueTab, React.ElementType> = {
  unassigned: Inbox,
  mine: UserCheck,
  'pending-approval': ClipboardCheck,
  overdue: AlertTriangle,
};

const UNASSIGNED_ROLES = ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'];

export default function ServiceRequestQueuePage() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const canSeeUnassigned = UNASSIGNED_ROLES.includes(user?.role ?? '');
  const [activeTab, setActiveTab] = useState<QueueTab>('mine');

  const allQuery = useAllServiceRequests();
  const mineQuery = useAssignedServiceRequests();
  const pendingQuery = usePendingApprovalForMe();
  const overdueQuery = useOverdueServiceRequests();

  const unassignedData = useMemo(
    () => (allQuery.data ?? []).filter((r) => r.status === 'Approved' && !r.assignedToId),
    [allQuery.data],
  );

  const visibleTabs = canSeeUnassigned ? TABS : TABS.filter((t) => t.key !== 'unassigned');
  const safeTab = canSeeUnassigned ? activeTab : activeTab === 'unassigned' ? 'mine' : activeTab;

  const tabCounts = useMemo<Record<QueueTab, number | null>>(
    () => ({
      unassigned: allQuery.data ? unassignedData.length : null,
      mine: mineQuery.data ? mineQuery.data.length : null,
      'pending-approval': pendingQuery.data ? pendingQuery.data.length : null,
      overdue: overdueQuery.data ? overdueQuery.data.length : null,
    }),
    [unassignedData, mineQuery.data, pendingQuery.data, overdueQuery.data, allQuery.data],
  );

  const tableData = useMemo(() => {
    if (safeTab === 'mine') {return mineQuery.data ?? [];}
    if (safeTab === 'pending-approval') {return pendingQuery.data ?? [];}
    if (safeTab === 'overdue') {return overdueQuery.data ?? [];}

    return unassignedData;
  }, [safeTab, unassignedData, mineQuery.data, pendingQuery.data, overdueQuery.data]);

  const isLoading =
    (safeTab === 'unassigned' && allQuery.isLoading) ||
    (safeTab === 'mine' && mineQuery.isLoading) ||
    (safeTab === 'pending-approval' && pendingQuery.isLoading) ||
    (safeTab === 'overdue' && overdueQuery.isLoading);

  function handleRefresh() {
    allQuery.refetch();
    mineQuery.refetch();
    pendingQuery.refetch();
    overdueQuery.refetch();
  }

  const activeTabInfo = visibleTabs.find((t) => t.key === safeTab) ?? visibleTabs[0]!;

  // ── Columns ──
  const columns: DataTableColumn<ServiceRequest>[] = [
    {
      key: 'requestNumber',
      label: 'Request #',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-sm text-muted-foreground whitespace-nowrap">
          {r.requestNumber}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (r) => (
        <div className="max-w-[260px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{r.subject}</p>
            {r.isOverdue && (
              <Badge variant="destructive" className="shrink-0 text-xs">
                Overdue
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{getSRTypeLabel(r.requestType)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
            getSRStatusStyle(r.status),
          )}
        >
          {getSRStatusLabel(r.status)}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (r) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
            getSRPriorityStyle(r.priority),
          )}
        >
          {r.priority}
        </span>
      ),
    },
    {
      key: 'requesterName',
      label: 'Requester',
      sortable: true,
      render: (r) => <span className="text-sm">{r.requesterName ?? '—'}</span>,
    },
    {
      key: 'assignedToName',
      label: 'Assigned To',
      sortable: true,
      render: (r) => <span className="text-sm">{r.assignedToName ?? '—'}</span>,
    },
    {
      key: 'requiredByDate',
      label: 'Required By',
      sortable: true,
      render: (r) => (
        <span
          className={cn('text-sm whitespace-nowrap', r.isOverdue && 'text-red-600 font-medium')}
        >
          {formatDate(r.requiredByDate)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (r) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
  ];

  // ── Filters ──
  const filters: DataTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: SERVICE_REQUEST_STATUSES.map((s) => ({ value: s, label: getSRStatusLabel(s) })),
    },
    {
      key: 'requestType',
      label: 'Type',
      options: SERVICE_REQUEST_TYPES.map((t) => ({ value: t, label: getSRTypeLabel(t) })),
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Critical', label: 'Critical' },
      ],
    },
  ];

  // ── Actions ──
  const actions: DataTableAction<ServiceRequest>[] = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (r) => navigateTo(`/service-requests/${r.id}`, { from: '/service-requests/queue' }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Request Queue</h1>
            <p className="text-sm text-muted-foreground">{activeTabInfo.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div
        className={`grid grid-cols-2 gap-3 ${canSeeUnassigned ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}
      >
        {visibleTabs.map((tab) => {
          const count = tabCounts[tab.key];
          const Icon = tabIcons[tab.key];
          const accent = accentMap[tab.key];
          const isActive = safeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as QueueTab)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all w-full',
                accent.bg,
                isActive ? 'ring-2 ring-primary/40 border-transparent' : 'hover:shadow-sm',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', accent.icon)} />
              <div>
                <p className="text-xl font-bold leading-none">
                  {count ?? <span className="text-muted-foreground text-sm">—</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{tab.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {visibleTabs.map((tab) => {
          const count = tabCounts[tab.key];
          const isActive = safeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as QueueTab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {count !== null && count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[18px] h-[18px] px-1',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : count > 0
                        ? tab.key === 'overdue'
                          ? 'bg-red-100 text-red-600'
                          : tab.key === 'pending-approval'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-muted text-muted-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable<ServiceRequest>
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search by subject, request #, or requester…"
        searchKeys={['subject', 'requestNumber', 'requesterName']}
        filters={filters}
        defaultSortField="createdAt"
        defaultSortDirection="desc"
        actions={actions}
        pagination={true}
        onRowClick={(r) =>
          navigateTo(`/service-requests/${r.id}`, { from: '/service-requests/queue' })
        }
        getItemId={(r) => r.id}
        emptyState={{
          icon: <Inbox className="h-8 w-8 text-muted-foreground/40" />,
          title: 'Queue is empty',
          description: 'No requests match your current filters',
        }}
      />
    </div>
  );
}
