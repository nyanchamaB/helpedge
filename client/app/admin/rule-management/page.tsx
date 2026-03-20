"use client";

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  RefreshCw,
  Tag,
  BarChart2,
  Percent,
  Handshake,
  List,
} from 'lucide-react';
import { getRulePriorityKeywords, getRuleCategoryKeywords, getOrchestratorStats } from '@/lib/api/ai';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Safely convert anything to a renderable string */
function toStr(v: any): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

/**
 * Extract priority rows from rules API response.
 * Response: { rules: { critical: [{keyword, weight}], high: [...], low: [...] }, thresholds, totalKeywords }
 */
function extractPriorityRows(raw: any): { priority: string; keywords: { keyword: string; weight: number }[] }[] {
  if (!raw || typeof raw !== 'object') return [];
  const source = raw.rules && typeof raw.rules === 'object' ? raw.rules : raw;
  return Object.entries(source)
    .filter(([, val]) => Array.isArray(val))
    .map(([key, val]) => ({
      priority: key,
      keywords: (val as any[]).map((kw: any) => ({
        keyword: typeof kw === 'string' ? kw : (kw.keyword ?? kw.name ?? ''),
        weight: typeof kw === 'object' ? (kw.weight ?? 1) : 1,
      })).filter((k) => k.keyword),
    }));
}

/**
 * Extract category rows from category keywords API response.
 * Response: { totalCategories, totalKeywords, categories: [{id, name, keywords: string[], assignableRoles}] }
 */
function extractCategoryRows(raw: any): { id: string; name: string; keywords: string[] }[] {
  if (!raw || typeof raw !== 'object') return [];
  const cats = raw.categories;
  if (!Array.isArray(cats)) return [];
  return cats.map((c: any) => ({
    id: c.id ?? c.name,
    name: c.name ?? '—',
    keywords: Array.isArray(c.keywords) ? c.keywords.map(toStr).filter(Boolean) : [],
  }));
}

export default function RuleManagementPage() {
  const {
    data: priorityResponse,
    isLoading: isLoadingPriority,
    isFetching: isFetchingPriority,
    error: priorityError,
    refetch: refetchPriority,
  } = useQuery({
    queryKey: ['rule-priority-keywords'],
    queryFn: getRulePriorityKeywords,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: categoryResponse,
    isLoading: isLoadingCategory,
    isFetching: isFetchingCategory,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ['rule-category-keywords'],
    queryFn: getRuleCategoryKeywords,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['orchestrator-stats'],
    queryFn: getOrchestratorStats,
    staleTime: 2 * 60 * 1000,
  });

  const priorityRows = extractPriorityRows(priorityResponse?.data);
  const categoryRows = extractCategoryRows(categoryResponse?.data);
  const categoryMeta = categoryResponse?.data as any;
  const stats = statsResponse?.data;

  const handleRefresh = () => {
    refetchPriority();
    refetchCategory();
    refetchStats();
  };

  const isLoading = isLoadingPriority || isLoadingCategory || isLoadingStats;
  const isFetching = isFetchingPriority || isFetchingCategory || isFetchingStats;

  if (priorityError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load rule data.
            <Button variant="link" className="px-2" onClick={handleRefresh}>Retry</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Rule Management</h1>
          <p className="text-muted-foreground">
            Keyword rules and orchestrator statistics for AI classification
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats persistence notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Orchestrator stats are persisted to the database and survive API restarts. Counts reflect all classifications across sessions.
        </AlertDescription>
      </Alert>

      {/* Orchestrator Stats */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">Total Classifications</CardDescription>
              <BarChart2 className="h-4 w-4 text-blue-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalClassifications?.toLocaleString() ?? '—'}</div>
              <p className="text-xs text-muted-foreground mt-2">Since last restart</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">Manual Review Rate</CardDescription>
              <Percent className="h-4 w-4 text-yellow-500 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.manualReviewRate != null ? `${(stats.manualReviewRate * 100).toFixed(1)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sent to human review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">Agreement Rate</CardDescription>
              <Handshake className="h-4 w-4 text-green-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.agreementRate != null ? `${(stats.agreementRate * 100).toFixed(1)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Methods in agreement</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Method breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classifications by Method</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.countByMethod ?? {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.countByMethod).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <Badge variant="outline">{method}</Badge>
                      <span className="text-sm font-medium">{(count as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avg. Confidence by Method</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.averageConfidenceByMethod ?? {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.averageConfidenceByMethod).map(([method, conf]) => (
                    <div key={method} className="flex items-center justify-between">
                      <Badge variant="outline">{method}</Badge>
                      <span className="text-sm font-medium">{((conf as number) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
              {stats.averageProcessingTimeMs != null && (
                <p className="text-xs text-muted-foreground mt-4">
                  Avg. processing time: <strong>{stats.averageProcessingTimeMs.toFixed(1)}ms</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Priority Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Priority Keywords
          </CardTitle>
          <CardDescription>
            Keyword rules used to determine ticket priority
            {priorityResponse?.data?.totalKeywords != null && (
              <span className="ml-2 text-foreground font-medium">
                ({priorityResponse.data.totalKeywords} total keywords)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPriority ? (
            <Skeleton className="h-32 w-full" />
          ) : priorityRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No priority keyword rules found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Priority</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className="w-36 text-right">
                    <span>Threshold</span>
                    {(priorityResponse?.data as any)?.thresholdUnit && (
                      <span className="block text-xs font-normal text-muted-foreground normal-case">
                        {(priorityResponse.data as any).thresholdUnit}
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityRows.map((row) => (
                  <TableRow key={row.priority}>
                    <TableCell><Badge>{row.priority}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.keywords.length > 0
                          ? row.keywords.map((kw, i) => (
                              <Badge key={`${kw.keyword}-${i}`} variant="outline" className="text-xs">
                                {kw.keyword}
                                <span className="ml-1 opacity-50">{kw.weight.toFixed(2)}</span>
                              </Badge>
                            ))
                          : <span className="text-xs text-muted-foreground">No keywords</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {(priorityResponse?.data as any)?.thresholds?.[row.priority] ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {(priorityResponse?.data as any)?.thresholdExplanation && (
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Threshold:</strong> {(priorityResponse.data as any).thresholdExplanation}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Category Keywords
          </CardTitle>
          <CardDescription>Categories configured for keyword-based classification</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCategory ? (
            <Skeleton className="h-32 w-full" />
          ) : !categoryMeta ? (
            <p className="text-sm text-muted-foreground py-4">No category keyword data available</p>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span><strong className="text-foreground">{categoryMeta.totalCategories ?? 0}</strong> categories</span>
                <span><strong className="text-foreground">{categoryMeta.totalKeywords ?? 0}</strong> total keywords</span>
              </div>
              {categoryRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No keywords seeded yet — add keywords via the category editor or seed data.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Category</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead className="w-24 text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {row.keywords.length > 0
                              ? row.keywords.map((kw, i) => (
                                  <Badge key={`${kw}-${i}`} variant="outline" className="text-xs">{kw}</Badge>
                                ))
                              : <span className="text-xs text-muted-foreground">No keywords</span>
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {row.keywords.length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
