'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  getResolverKpis,
  getDashboardStats,
  getTeamStats,
  getTicketStatusCounts,
  getCategoryTicketCounts,
  type ResolverKpis,
  type DashboardStats,
  type TeamStats,
  type TicketStatusCounts,
  type CategoryTicketCount,
} from '@/lib/api/dashboard';
import { getActiveCategories, type Category } from '@/lib/api/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;

function fmt(mins: number | null | undefined): string {
  if (mins == null) {return '—';}
  if (mins < 60) {return `${Math.round(mins)}m`;}
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);

  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function SummaryCard({
  title,
  value,
  icon,
  sub,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-red-200 bg-red-50/40 dark:bg-red-950/20' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={highlight ? 'text-red-500' : 'text-muted-foreground'}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function TeamPerformancePage() {
  const { navigateTo, pageParams } = useNavigation();

  const [resolverKpis, setResolverKpis] = useState<ResolverKpis[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<CategoryTicketCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<keyof ResolverKpis>('unacknowledgedCount');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    const [kpisRes, dashRes, teamRes, statusRes, categoryCountRes, categoriesRes] =
      await Promise.all([
        getResolverKpis(),
        getDashboardStats(),
        getTeamStats(),
        getTicketStatusCounts(),
        getCategoryTicketCounts(),
        getActiveCategories(),
      ]);

    if (kpisRes.success && kpisRes.data) {setResolverKpis(kpisRes.data);}
    if (dashRes.success && dashRes.data) {setDashStats(dashRes.data);}
    if (teamRes.success && teamRes.data) {setTeamStats(teamRes.data);}
    if (statusRes.success && statusRes.data) {setStatusCounts(statusRes.data);}
    if (categoryCountRes.success && categoryCountRes.data) {setCategoryCounts(categoryCountRes.data);}
    if (categoriesRes.success && categoriesRes.data) {setCategories(categoriesRes.data);}
    setIsLoading(false);
  }

  const categoryRows = useMemo(() => {
    const nameMap = new Map(categories.map((c) => [c.id, c.name]));

    return categoryCounts
      .map((c) => ({ ...c, name: nameMap.get(c.categoryId) ?? `…${c.categoryId.slice(-4)}` }))
      .sort((a, b) => b.count - a.count);
  }, [categoryCounts, categories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return resolverKpis.filter(
      (r) => !q || (r.resolverName ?? r.resolverId).toLowerCase().includes(q),
    );
  }, [resolverKpis, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? 0;
      const bv = b[sortCol] ?? 0;
      const cmp =
        typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);

      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totalSlaBreaches = resolverKpis.reduce((s, r) => s + r.slaBreaching, 0);
  const totalUnacked = resolverKpis.reduce((s, r) => s + r.unacknowledgedCount, 0);
  const totalResolved = resolverKpis.reduce((s, r) => s + r.resolvedCount, 0);
  const avgTtr = resolverKpis.length
    ? resolverKpis.reduce((s, r) => s + (r.avgTtrMinutes ?? 0), 0) / resolverKpis.length
    : null;

  function toggleSort(col: keyof ResolverKpis) {
    if (sortCol === col) {setSortAsc((v) => !v);}
    else {
      setSortCol(col);
      setSortAsc(false);
    }
    setPage(0);
  }

  function SortTh({
    col,
    children,
    className,
  }: {
    col: keyof ResolverKpis;
    children: React.ReactNode;
    className?: string;
  }) {
    const active = sortCol === col;

    return (
      <th
        className={cn(
          'pb-2 font-medium cursor-pointer select-none hover:text-foreground transition-colors',
          className,
        )}
        onClick={() => toggleSort(col)}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          {active && <span className="text-[10px]">{sortAsc ? '▲' : '▼'}</span>}
        </span>
      </th>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Team Performance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Full resolver KPIs, ticket distribution and team metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(pageParams?.from ?? '/manager/dashboard')}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Operations Center
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Team Members"
          value={isLoading ? '—' : (teamStats?.totalUsers ?? 0)}
          icon={<Users className="h-4 w-4" />}
          sub="Active resolvers"
        />
        <SummaryCard
          title="Total Resolved"
          value={isLoading ? '—' : totalResolved}
          icon={<CheckCircle className="h-4 w-4" />}
          sub="Across all resolvers"
        />
        <SummaryCard
          title="Unacknowledged"
          value={isLoading ? '—' : totalUnacked}
          icon={<Clock className="h-4 w-4" />}
          sub="Assigned but not opened"
          highlight={totalUnacked > 0}
        />
        <SummaryCard
          title="SLA Breaches"
          value={isLoading ? '—' : totalSlaBreaches}
          icon={<AlertTriangle className="h-4 w-4" />}
          sub={avgTtr != null ? `Avg TTR: ${fmt(avgTtr)}` : 'Across all resolvers'}
          highlight={totalSlaBreaches > 0}
        />
      </div>

      {/* Main grid: KPI table + right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI table */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Resolver KPIs</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {filtered.length} resolver{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search resolver…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {search ? 'No resolvers match your search.' : 'No resolver data available.'}
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b">
                          <SortTh col="resolverName" className="text-left">
                            Resolver
                          </SortTh>
                          <SortTh col="totalAssigned" className="text-right">
                            Assigned
                          </SortTh>
                          <SortTh col="inProgressCount" className="text-right">
                            Active
                          </SortTh>
                          <SortTh col="resolvedCount" className="text-right">
                            Resolved
                          </SortTh>
                          <SortTh col="unacknowledgedCount" className="text-right">
                            Unacked
                          </SortTh>
                          <SortTh col="avgTtaMinutes" className="text-right">
                            <span className="flex items-center justify-end gap-1">
                              <Timer className="h-3 w-3" /> Avg TTA
                            </span>
                          </SortTh>
                          <SortTh col="avgTtrMinutes" className="text-right">
                            <span className="flex items-center justify-end gap-1">
                              <Timer className="h-3 w-3" /> Avg TTR
                            </span>
                          </SortTh>
                          <SortTh col="slaBreaching" className="text-right">
                            SLA
                          </SortTh>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((r) => (
                          <tr
                            key={r.resolverId}
                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2.5 font-medium">
                              {r.resolverName ?? r.resolverId.slice(-8)}
                            </td>
                            <td className="py-2.5 text-right">{r.totalAssigned}</td>
                            <td className="py-2.5 text-right">{r.inProgressCount}</td>
                            <td className="py-2.5 text-right text-green-600 font-medium">
                              {r.resolvedCount}
                            </td>
                            <td className="py-2.5 text-right">
                              {r.unacknowledgedCount > 0 ? (
                                <Badge variant="destructive" className="text-xs">
                                  {r.unacknowledgedCount}
                                </Badge>
                              ) : (
                                <span className="text-xs text-green-500">0</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right text-muted-foreground">
                              {fmt(r.avgTtaMinutes)}
                            </td>
                            <td className="py-2.5 text-right text-muted-foreground">
                              {fmt(r.avgTtrMinutes)}
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
                        Showing {page * PAGE_SIZE + 1}–
                        {Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          disabled={page === 0}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {page + 1} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          disabled={page >= totalPages - 1}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Ticket status distribution */}
          {statusCounts && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Status Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm">
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

          {/* Category breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-5 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : categoryRows.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data</p>
              ) : (
                <div className="space-y-2.5">
                  {categoryRows.map((c) => {
                    const max = Math.max(...categoryRows.map((x) => x.count), 1);

                    return (
                      <div key={c.categoryId}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground truncate max-w-[160px]">
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

          {/* Team totals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Team Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Total Tickets', value: dashStats?.totalTickets ?? 0 },
                  { label: 'Open', value: dashStats?.openTickets ?? 0 },
                  { label: 'In Progress', value: dashStats?.inProgressTickets ?? 0 },
                  { label: 'Resolved', value: dashStats?.resolvedTickets ?? 0 },
                  { label: 'Today', value: dashStats?.todayTickets ?? 0 },
                  { label: 'Total Users', value: dashStats?.totalUsers ?? 0 },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-0.5 border-b last:border-0"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{isLoading ? '—' : value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
