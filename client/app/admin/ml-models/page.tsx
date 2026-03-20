"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Brain,
  CheckCircle,
  AlertCircle,
  Power,
  RefreshCw,
  Sparkles,
  Database,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTfIdfStats,
  isTfIdfInitialized,
  isTfIdfStale,
  buildTfIdfIndex,
  rebuildTfIdfIndex,
} from "@/lib/api/ai";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * ML Model Management Page
 * Authorization: Admin only
 * Manages the TF-IDF index used for ticket classification
 */
export default function MLModelManagementPage() {
  const queryClient = useQueryClient();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["tfidf-stats"],
    queryFn: getTfIdfStats,
    staleTime: 2 * 60 * 1000,
  });

  const { data: initializedResponse, refetch: refetchInitialized } = useQuery({
    queryKey: ["tfidf-initialized"],
    queryFn: isTfIdfInitialized,
    staleTime: 2 * 60 * 1000,
  });

  const { data: staleResponse, refetch: refetchStale } = useQuery({
    queryKey: ["tfidf-stale"],
    queryFn: isTfIdfStale,
    staleTime: 2 * 60 * 1000,
  });

  const stats = statsResponse?.data;
  // API may return a plain boolean or { isInitialized: boolean }
  const initializedRaw = initializedResponse?.data;
  const isInitialized =
    typeof initializedRaw === "boolean"
      ? initializedRaw
      : (initializedRaw?.isInitialized ??
        (stats?.totalDocuments != null && stats.totalDocuments > 0));
  const staleRaw = staleResponse?.data;
  const isStale =
    typeof staleRaw === "boolean"
      ? staleRaw
      : (staleRaw?.isStale ?? stats?.isStale ?? false);

  const handleRefreshAll = () => {
    refetchStats();
    refetchInitialized();
    refetchStale();
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["tfidf-stats"] });
    queryClient.invalidateQueries({ queryKey: ["tfidf-initialized"] });
    queryClient.invalidateQueries({ queryKey: ["tfidf-stale"] });
  };

  const buildMutation = useMutation({
    mutationFn: buildTfIdfIndex,
    onSuccess: () => {
      invalidateAll();
      toast.success("TF-IDF index built successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to build index", { description: error.message });
    },
  });

  const rebuildMutation = useMutation({
    mutationFn: rebuildTfIdfIndex,
    onSuccess: () => {
      invalidateAll();
      toast.success("TF-IDF index rebuilt successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to rebuild index", { description: error.message });
    },
  });

  const isBusy = buildMutation.isPending || rebuildMutation.isPending;

  if (statsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load model data. Please try again.
            <Button variant="link" className="px-2" onClick={handleRefreshAll}>
              Retry
            </Button>
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
          <h1 className="text-3xl font-bold">TF-IDF classification index</h1>
          <p className="text-muted-foreground">
            Manage the TF-IDF classification index used for ticket routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isFetchingStats}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isFetchingStats && "animate-spin")}
            />
            Refresh
          </Button>
          {isInitialized ? (
            <Button onClick={() => rebuildMutation.mutate()} disabled={isBusy}>
              {rebuildMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Rebuild Index
            </Button>
          ) : (
            <Button onClick={() => buildMutation.mutate()} disabled={isBusy}>
              {buildMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              Build Index
            </Button>
          )}
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
              <CardDescription className="text-xs font-medium uppercase">
                Index Status
              </CardDescription>
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
                {isInitialized ? "Ready" : "Not initialized"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Total Terms
              </CardDescription>
              <FileText className="h-4 w-4 text-purple-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalTerms?.toLocaleString() ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Vocabulary size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Documents Indexed
              </CardDescription>
              <Database className="h-4 w-4 text-green-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalDocuments?.toLocaleString() ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Training tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Freshness
              </CardDescription>
              <Sparkles
                className={cn(
                  "h-4 w-4 absolute top-4 right-4",
                  isStale ? "text-yellow-500" : "text-green-600",
                )}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isStale ? (
                  <Clock className="h-8 w-8 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isStale ? "Rebuild recommended" : "Up to date"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stale Banner */}
      {isStale && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Index rebuild recommended.</strong> New tickets have been
            added since the last build.
            <Button
              variant="link"
              className="px-2"
              onClick={() => rebuildMutation.mutate()}
              disabled={isBusy}
            >
              Rebuild Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Model Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classification Index</CardTitle>
          <CardDescription>
            Current TF-IDF model used for ticket classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="space-y-4">
              {[...Array(1)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !isInitialized ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No index built yet</h3>
              <p className="text-muted-foreground mb-4">
                Build the TF-IDF index to enable AI-powered ticket
                classification
              </p>
              <Button onClick={() => buildMutation.mutate()} disabled={isBusy}>
                <Power className="h-4 w-4 mr-2" />
                Build Index
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Last Built</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Avg Doc Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium font-mono">
                      TF-IDF v1 (current)
                    </TableCell>
                    <TableCell>
                      {stats?.lastUpdated
                        ? format(new Date(stats.lastUpdated), "PPpp")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {stats?.totalTerms?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell>
                      {stats?.totalDocuments?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell>
                      {stats?.averageDocumentFrequency != null
                        ? stats.averageDocumentFrequency.toFixed(4)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {isStale ? (
                        <Badge
                          variant="secondary"
                          className="text-yellow-700 bg-yellow-100"
                        >
                          Stale
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600">
                          <Power className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailsModalOpen(true)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rebuildMutation.mutate()}
                          disabled={isBusy}
                        >
                          <RefreshCw
                            className={cn(
                              "h-4 w-4 mr-1",
                              rebuildMutation.isPending && "animate-spin",
                            )}
                          />
                          Rebuild
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>TF-IDF Index Details</DialogTitle>
            <DialogDescription>
              Current classification model statistics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Terms</p>
                <p className="text-2xl font-bold">
                  {stats?.totalTerms?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">
                  {stats?.totalDocuments?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Avg Document Frequency</p>
                <p className="text-2xl font-bold">
                  {stats?.averageDocumentFrequency != null
                    ? stats.averageDocumentFrequency.toFixed(4)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm mt-1">
                  {stats?.lastUpdated
                    ? format(new Date(stats.lastUpdated), "PPpp")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Initialized</p>
                <Badge
                  className={isInitialized ? "bg-green-600" : "bg-red-600"}
                >
                  {isInitialized ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Index Freshness</p>
                <Badge variant={isStale ? "secondary" : "default"}>
                  {isStale ? "Stale" : "Fresh"}
                </Badge>
              </div>
            </div>
            {Array.isArray(stats?.mostCommonTerms) &&
              stats.mostCommonTerms.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Most Common Terms</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.mostCommonTerms
                      .slice(0, 20)
                      .map((term: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
