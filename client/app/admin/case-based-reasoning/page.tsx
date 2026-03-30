'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCBRStats, isCBRInitialized, buildCBRIndex } from '@/lib/api/ai';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function CaseBasedReasoningPage() {
  const queryClient = useQueryClient();

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['cbr-stats'],
    queryFn: getCBRStats,
    staleTime: 2 * 60 * 1000,
  });

  const { data: initializedResponse, refetch: refetchInitialized } = useQuery({
    queryKey: ['cbr-initialized'],
    queryFn: isCBRInitialized,
    staleTime: 2 * 60 * 1000,
  });

  const stats = statsResponse?.data;
  const initializedRaw = initializedResponse?.data;
  const isInitialized =
    typeof initializedRaw === 'boolean'
      ? initializedRaw
      : (initializedRaw?.isInitialized ??
        (stats?.indexedTickets !== null && stats?.indexedTickets !== undefined && stats.indexedTickets > 0));

  const handleRefresh = () => {
    refetchStats();
    refetchInitialized();
  };

  const buildMutation = useMutation({
    mutationFn: buildCBRIndex,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cbr-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cbr-initialized'] });
      toast.success('CBR index built successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to build CBR index', { description: error.message });
    },
  });

  if (statsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load Case-Based Reasoning data.
            <Button variant="link" className="px-2" onClick={handleRefresh}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categoryEntries = stats?.ticketsByCategory
    ? Object.entries(stats.ticketsByCategory).sort(([, a], [, b]) => (b as number) - (a as number))
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Case-Based Reasoning</h1>
          <p className="text-muted-foreground">
            Manage the CBR index used for similarity-based ticket classification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isFetchingStats}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetchingStats && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={() => buildMutation.mutate()} disabled={buildMutation.isPending}>
            {buildMutation.isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {isInitialized ? 'Rebuild Index' : 'Build Index'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">Status</CardDescription>
              <Brain className="h-4 w-4 text-blue-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isInitialized ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isInitialized ? 'Index ready' : 'Not initialized'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Indexed Tickets
              </CardDescription>
              <Database className="h-4 w-4 text-purple-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.indexedTickets?.toLocaleString() ?? '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                of {stats?.totalHistoricalTickets?.toLocaleString() ?? '—'} historical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Avg. Similarity
              </CardDescription>
              <Target className="h-4 w-4 text-green-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.averageSimilarityScore !== null && stats?.averageSimilarityScore !== undefined
                  ? `${(stats.averageSimilarityScore * 100).toFixed(1)}%`
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Match confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Avg. Search Time
              </CardDescription>
              <Zap className="h-4 w-4 text-yellow-500 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.averageSearchTimeMs !== null && stats?.averageSearchTimeMs !== undefined ? `${stats.averageSearchTimeMs}ms` : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Per classification</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Indexed */}
      {stats?.lastIndexed && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last indexed: {format(new Date(stats.lastIndexed), 'PPpp')}
        </div>
      )}

      {/* Tickets by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Category</CardTitle>
          <CardDescription>Distribution of indexed tickets across categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !isInitialized ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No index built yet</h3>
              <p className="text-muted-foreground mb-4">
                Build the CBR index to enable similarity-based classification
              </p>
              <Button onClick={() => buildMutation.mutate()} disabled={buildMutation.isPending}>
                <Database className="h-4 w-4 mr-2" />
                Build Index
              </Button>
            </div>
          ) : categoryEntries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No category data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryEntries.map(([category, count]) => {
                  const total = stats?.indexedTickets || 1;
                  const pct = (((count as number) / total) * 100).toFixed(1);

                  return (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">
                        {(count as number).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{pct}%</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
