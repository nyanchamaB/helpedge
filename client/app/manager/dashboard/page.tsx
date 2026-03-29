'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  getDashboardStats,
  getTeamStats,
  getResolverKpis,
  getTicketStatusCounts,
  getCategoryTicketCounts,
  type DashboardStats,
  type TeamStats,
  type ResolverKpis,
  type TicketStatusCounts,
  type CategoryTicketCount,
} from '@/lib/api/dashboard';
import { getUnassignedTickets, type Ticket } from '@/lib/api/tickets';
import { getServiceRequestStats, type ServiceRequestStats } from '@/lib/api/service-request';
import { getReviewQueueStats } from '@/lib/api/ai';
import { getActiveCategories, type Category } from '@/lib/api/categories';
import type { ReviewQueueStats } from '@/lib/types/ai';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  RefreshCw,
  Ticket as TicketIcon,
  Users,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  BarChart2,
  Layers,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatMinutes(mins: number | null | undefined): string {
  if (mins == null) {return '—';}
  if (mins < 60) {return `${Math.round(mins)}m`;}
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);

  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StatCard({
  title,
  value,
  icon,
  description,
  iconColor = 'text-blue-500',
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  iconColor?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-red-200 bg-red-50/40 dark:bg-red-950/20' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={iconColor}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function ManagerDashboard() {
  const { navigateTo } = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [resolverKpis, setResolverKpis] = useState<ResolverKpis[]>([]);
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<CategoryTicketCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unassigned, setUnassigned] = useState<Ticket[]>([]);
  const [srStats, setSrStats] = useState<ServiceRequestStats | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewQueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiPage, setKpiPage] = useState(0);
  const KPI_PAGE_SIZE = 15;

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    const [
      statsRes,
      teamRes,
      kpisRes,
      statusRes,
      categoryCountRes,
      categoriesRes,
      unassignedRes,
      srStatsRes,
      reviewRes,
    ] = await Promise.all([
      getDashboardStats(),
      getTeamStats(),
      getResolverKpis(),
      getTicketStatusCounts(),
      getCategoryTicketCounts(),
      getActiveCategories(),
      getUnassignedTickets(),
      getServiceRequestStats(),
      getReviewQueueStats(),
    ]);

    if (statsRes.success && statsRes.data) {setStats(statsRes.data);}
    if (teamRes.success && teamRes.data) {setTeamStats(teamRes.data);}
    if (kpisRes.success && kpisRes.data) {setResolverKpis(kpisRes.data);}
    if (statusRes.success && statusRes.data) {setStatusCounts(statusRes.data);}
    if (categoryCountRes.success && categoryCountRes.data) {setCategoryCounts(categoryCountRes.data);}
    if (categoriesRes.success && categoriesRes.data) {setCategories(categoriesRes.data);}
    if (unassignedRes.success && unassignedRes.data) {setUnassigned(unassignedRes.data);}
    if (srStatsRes.success && srStatsRes.data) {setSrStats(srStatsRes.data);}
    if (reviewRes.success && reviewRes.data) {setReviewStats(reviewRes.data);}
    setIsLoading(false);
  }

  // Join category counts with category names
  const categoryRows = useMemo(() => {
    const nameMap = new Map(categories.map((c) => [c.id, c.name]));

    return categoryCounts
      .map((c) => ({
        ...c,
        name: nameMap.get(c.categoryId) ?? `Category ${c.categoryId.slice(-4)}`,
      }))
      .sort((a, b) => b.count - a.count);
  }, [categoryCounts, categories]);

  const totalSlaBreaches = resolverKpis.reduce((sum, r) => sum + r.slaBreaching, 0);
  const totalUnacked = resolverKpis.reduce((sum, r) => sum + r.unacknowledgedCount, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Operations Center</h1>
          <p className="text-muted-foreground mt-1">
            Monitor team workload, SLA health, and ticket operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateTo('/tickets')}>
            All Tickets
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Ticket stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={isLoading ? '—' : (stats?.totalTickets ?? 0)}
          icon={<TicketIcon className="h-4 w-4" />}
          iconColor="text-blue-500"
          description="All time"
        />
        <StatCard
          title="Open"
          value={isLoading ? '—' : (statusCounts?.open ?? stats?.openTickets ?? 0)}
          icon={<Clock className="h-4 w-4" />}
          iconColor="text-amber-500"
          description="Needs attention"
        />
        <StatCard
          title="Resolved"
          value={isLoading ? '—' : (statusCounts?.resolved ?? stats?.resolvedTickets ?? 0)}
          icon={<CheckCircle className="h-4 w-4" />}
          iconColor="text-green-500"
          description="All time"
        />
        <StatCard
          title="SLA Breaches"
          value={isLoading ? '—' : totalSlaBreaches}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor={totalSlaBreaches > 0 ? 'text-red-500' : 'text-gray-400'}
          description={totalUnacked > 0 ? `${totalUnacked} unacknowledged` : 'Across all resolvers'}
          highlight={totalSlaBreaches > 0}
        />
      </div>

      {/* Service Request pipeline row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total SRs"
          value={isLoading ? '—' : (srStats?.totalRequests ?? 0)}
          icon={<Layers className="h-4 w-4" />}
          iconColor="text-indigo-500"
          description="Service Requests"
        />
        <StatCard
          title="Pending Approval"
          value={isLoading ? '—' : (srStats?.pendingApprovalCount ?? 0)}
          icon={<Eye className="h-4 w-4" />}
          iconColor="text-orange-500"
          description="Awaiting decision"
          highlight={(srStats?.pendingApprovalCount ?? 0) > 0}
        />
        <StatCard
          title="SR In Progress"
          value={isLoading ? '—' : (srStats?.inProgressCount ?? 0)}
          icon={<Activity className="h-4 w-4" />}
          iconColor="text-blue-500"
          description="Being fulfilled"
        />
        <StatCard
          title="SR Fulfilled"
          value={isLoading ? '—' : (srStats?.fulfilledCount ?? 0)}
          icon={<CheckCircle className="h-4 w-4" />}
          iconColor="text-green-500"
          description="Completed"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolver KPI table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <Users className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Resolver Performance</CardTitle>
              <span className="ml-auto text-xs text-muted-foreground">
                {teamStats?.totalUsers ?? 0} staff · {teamStats?.resolvedTickets ?? 0} resolved
              </span>
              <button
                onClick={() => navigateTo('/team/performance', { from: '/manager/dashboard' })}
                className="text-xs text-blue-500 hover:underline ml-2"
              >
                View all
              </button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : resolverKpis.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No resolver data available
                </p>
              ) : (
                (() => {
                  const totalPages = Math.ceil(resolverKpis.length / KPI_PAGE_SIZE);
                  const pageRows = resolverKpis.slice(
                    kpiPage * KPI_PAGE_SIZE,
                    (kpiPage + 1) * KPI_PAGE_SIZE,
                  );

                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground border-b">
                              <th className="text-left pb-2 font-medium">Resolver</th>
                              <th className="text-right pb-2 font-medium">Assigned</th>
                              <th className="text-right pb-2 font-medium">Active</th>
                              <th className="text-right pb-2 font-medium">Resolved</th>
                              <th className="text-right pb-2 font-medium">
                                <span className="flex items-center justify-end gap-1">
                                  <Timer className="h-3 w-3" /> Avg TTA
                                </span>
                              </th>
                              <th className="text-right pb-2 font-medium">
                                <span className="flex items-center justify-end gap-1">
                                  <Timer className="h-3 w-3" /> Avg TTR
                                </span>
                              </th>
                              <th className="text-right pb-2 font-medium">SLA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageRows.map((r) => (
                              <tr
                                key={r.resolverId}
                                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                              >
                                <td className="py-2.5 font-medium">{r.resolverName}</td>
                                <td className="py-2.5 text-right">{r.totalAssigned}</td>
                                <td className="py-2.5 text-right">{r.inProgressCount}</td>
                                <td className="py-2.5 text-right text-green-600 font-medium">
                                  {r.resolvedCount}
                                </td>
                                <td className="py-2.5 text-right text-muted-foreground">
                                  {formatMinutes(r.avgTtaMinutes)}
                                </td>
                                <td className="py-2.5 text-right text-muted-foreground">
                                  {formatMinutes(r.avgTtrMinutes)}
                                </td>
                                <td className="py-2.5 text-right">
                                  {r.slaBreaching > 0 ? (
                                    <Badge variant="destructive" className="text-xs">
                                      {r.slaBreaching}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-green-500 font-medium">OK</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            {kpiPage * KPI_PAGE_SIZE + 1}–
                            {Math.min((kpiPage + 1) * KPI_PAGE_SIZE, resolverKpis.length)} of{' '}
                            {resolverKpis.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs"
                              disabled={kpiPage === 0}
                              onClick={() => setKpiPage((p) => p - 1)}
                            >
                              Prev
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {kpiPage + 1} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs"
                              disabled={kpiPage >= totalPages - 1}
                              onClick={() => setKpiPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                            <button
                              onClick={() =>
                                navigateTo('/team/performance', { from: '/manager/dashboard' })
                              }
                              className="text-xs text-blue-500 hover:underline ml-1"
                            >
                              View all →
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Category breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <BarChart2 className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-sm">By Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : categoryRows.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No category data</p>
              ) : (
                <div className="space-y-2.5">
                  {categoryRows.slice(0, 7).map((c) => {
                    const max = Math.max(...categoryRows.map((x) => x.count), 1);

                    return (
                      <div key={c.categoryId}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground truncate max-w-[150px]">
                            {c.name}
                          </span>
                          <span className="font-medium ml-2">{c.count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${Math.round((c.count / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Review Queue */}
          <Card className={(reviewStats?.pendingCount ?? 0) > 0 ? 'border-orange-200' : ''}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Eye
                className={cn(
                  'h-4 w-4',
                  (reviewStats?.pendingCount ?? 0) > 0 ? 'text-orange-500' : 'text-gray-400',
                )}
              />
              <CardTitle className="text-sm">
                AI Review Queue
                {(reviewStats?.pendingCount ?? 0) > 0 && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                    {reviewStats!.pendingCount}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reviewStats ? (
                <p className="text-xs text-muted-foreground text-center py-3">No data</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending review</span>
                    <span className="font-medium">{reviewStats.pendingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved</span>
                    <span className="font-medium text-green-600">{reviewStats.approvedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overridden</span>
                    <span className="font-medium">{reviewStats.overriddenCount}</span>
                  </div>
                  {(reviewStats.pendingCount ?? 0) > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-1 text-xs"
                      onClick={() => navigateTo('/tickets/review-queue')}
                    >
                      Review Now
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status distribution */}
          {statusCounts && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Open', value: statusCounts.open, color: 'bg-amber-400' },
                    { label: 'In Progress', value: statusCounts.inProgress, color: 'bg-blue-400' },
                    { label: 'On Hold', value: statusCounts.onHold, color: 'bg-purple-400' },
                    {
                      label: 'Awaiting Info',
                      value: statusCounts.awaitingInfo,
                      color: 'bg-yellow-400',
                    },
                    { label: 'Resolved', value: statusCounts.resolved, color: 'bg-green-400' },
                    { label: 'Closed', value: statusCounts.closed, color: 'bg-gray-400' },
                  ].map(({ label, value, color }) => {
                    const total =
                      statusCounts.open +
                        statusCounts.inProgress +
                        statusCounts.onHold +
                        statusCounts.awaitingInfo +
                        statusCounts.resolved +
                        statusCounts.closed || 1;

                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full`}
                            style={{ width: `${Math.round((value / total) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Unassigned tickets */}
      {!isLoading && unassigned.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">
                Unassigned Tickets
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({unassigned.length})
                </span>
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigateTo('/manager/tickets', { filter: 'unassigned' })}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <TicketsTable
              tickets={unassigned.slice(0, 5)}
              isLoading={false}
              showFilters={false}
              emptyMessage=""
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
