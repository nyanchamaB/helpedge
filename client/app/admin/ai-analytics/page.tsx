"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  AlertCircle,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  getAIPerformanceMetrics,
  getAIPerformanceByCategory,
  getConfusionMatrix,
} from '@/lib/api/ai';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AIAnalyticsFilter } from '@/lib/types/ai';

/**
 * AI Analytics Dashboard
 * Authorization: Admin, ITManager
 * Shows comprehensive AI performance metrics, trends, and analysis
 */
export default function AIAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  // Calculate date filter
  const dateFilter = useMemo((): AIAnalyticsFilter => {
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(dateRange));

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [dateRange]);

  // Fetch overall performance metrics
  const {
    data: metricsResponse,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['ai-performance-metrics', dateFilter],
    queryFn: () => getAIPerformanceMetrics(dateFilter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch category performance
  const {
    data: categoryResponse,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useQuery({
    queryKey: ['ai-performance-category', dateFilter],
    queryFn: () => getAIPerformanceByCategory(dateFilter),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch confusion matrix
  const {
    data: confusionResponse,
    isLoading: isLoadingConfusion,
    error: confusionError,
  } = useQuery({
    queryKey: ['ai-confusion-matrix', dateFilter],
    queryFn: () => getConfusionMatrix(dateFilter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = metricsResponse?.data;
  const categoryPerformance = categoryResponse?.data || [];
  const confusionMatrix = confusionResponse?.data;

  // Handle refresh all
  const handleRefreshAll = () => {
    refetchMetrics();
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!metrics) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Classifications', metrics.totalClassifications || 0],
      ['Overall Accuracy', `${((metrics.overallAccuracy || 0) * 100).toFixed(2)}%`],
      ['Category Accuracy', `${((metrics.categoryAccuracy || 0) * 100).toFixed(2)}%`],
      ['Priority Accuracy', `${((metrics.priorityAccuracy || 0) * 100).toFixed(2)}%`],
      ['Automation Rate', `${((metrics.automationRate || 0) * 100).toFixed(2)}%`],
      ['Override Rate', `${((metrics.overrideRate || 0) * 100).toFixed(2)}%`],
      ['Approval Rate', `${((metrics.approvalRate || 0) * 100).toFixed(2)}%`],
      ['Avg Confidence', `${((metrics.averageConfidence || 0) * 100).toFixed(2)}%`],
      ['Avg Processing Time', `${(metrics.averageProcessingTimeMs || 0).toFixed(2)}ms`],
      ['Date Range', `${dateRange} days`],
    ];

    const csv = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (metricsError || categoryError || confusionError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load AI analytics. Please try again.
            <Button
              variant="link"
              className="px-2"
              onClick={handleRefreshAll}
            >
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
          <h1 className="text-3xl font-bold">AI Performance Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive metrics and insights into AI classification performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isLoadingMetrics}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isLoadingMetrics && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} disabled={!metrics}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Date Range</CardTitle>
            </div>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as '7' | '30' | '90')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Cards */}
      {isLoadingMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Row 1: Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Accuracy */}
            <MetricCard
              title="Overall Accuracy"
              value={`${((metrics?.overallAccuracy || 0) * 100).toFixed(1)}%`}
              description={`${metrics?.classificationsWithOutcome || 0} evaluated`}
              icon={Target}
              trend={(metrics?.overallAccuracy || 0) >= 0.75 ? 'up' : 'down'}
              trendValue={`${((metrics?.overallAccuracy || 0) * 100).toFixed(1)}%`}
              colorClass={
                (metrics?.overallAccuracy || 0) >= 0.8
                  ? 'text-green-600'
                  : (metrics?.overallAccuracy || 0) >= 0.6
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }
            />

            {/* Automation Rate */}
            <MetricCard
              title="Automation Rate"
              value={`${((metrics?.automationRate || 0) * 100).toFixed(1)}%`}
              description="Not needing review"
              icon={Activity}
              trend={(metrics?.automationRate || 0) >= 0.7 ? 'up' : 'down'}
              trendValue={`${((metrics?.automationRate || 0) * 100).toFixed(1)}%`}
              colorClass={
                (metrics?.automationRate || 0) >= 0.7
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }
            />

            {/* Average Confidence */}
            <MetricCard
              title="Avg Confidence"
              value={`${((metrics?.averageConfidence || 0) * 100).toFixed(1)}%`}
              description="Across all classifications"
              icon={Target}
              colorClass="text-blue-600"
            />

            {/* Override Rate */}
            <MetricCard
              title="Override Rate"
              value={`${((metrics?.overrideRate || 0) * 100).toFixed(1)}%`}
              description="Classifications corrected"
              icon={AlertCircle}
              trend={(metrics?.overrideRate || 0) <= 0.2 ? 'up' : 'down'}
              trendValue={`${((metrics?.overrideRate || 0) * 100).toFixed(1)}%`}
              colorClass={
                (metrics?.overrideRate || 0) <= 0.2
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }
            />
          </div>

          {/* Row 2: Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Accuracy */}
            <MetricCard
              title="Category Accuracy"
              value={`${((metrics?.categoryAccuracy || 0) * 100).toFixed(1)}%`}
              description="Category predictions"
              icon={Target}
              colorClass="text-purple-600"
            />

            {/* Priority Accuracy */}
            <MetricCard
              title="Priority Accuracy"
              value={`${((metrics?.priorityAccuracy || 0) * 100).toFixed(1)}%`}
              description="Priority predictions"
              icon={Target}
              colorClass="text-orange-600"
            />

            {/* Processing Time */}
            <MetricCard
              title="Avg Processing Time"
              value={`${(metrics?.averageProcessingTimeMs || 0).toFixed(0)}ms`}
              description="Per classification"
              icon={Clock}
              colorClass={
                (metrics?.averageProcessingTimeMs || 0) < 500
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }
            />

            {/* Total Classifications */}
            <MetricCard
              title="Total Classifications"
              value={metrics?.totalClassifications?.toLocaleString() || '0'}
              description={`In last ${dateRange} days`}
              icon={Activity}
              colorClass="text-gray-600"
            />
          </div>
        </>
      ) : null}

      {/* Category Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>
            Accuracy and prediction count for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCategory ? (
            <Skeleton className="h-96 w-full" />
          ) : categoryPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalPredictions"
                  fill="#8884d8"
                  name="Total Predictions"
                />
                <Bar
                  yAxisId="right"
                  dataKey="accuracy"
                  fill="#82ca9d"
                  name="Accuracy"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No category performance data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confusion Matrix */}
      {confusionMatrix && confusionMatrix.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>
              Shows how often categories are confused with each other
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted font-medium text-sm">
                      Predicted →<br />Actual ↓
                    </th>
                    {confusionMatrix.categories.map((cat: string) => (
                      <th
                        key={cat}
                        className="border p-2 bg-muted font-medium text-sm max-w-[100px] truncate"
                        title={cat}
                      >
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {confusionMatrix.categories.map((actualCat: string, i: number) => (
                    <tr key={actualCat}>
                      <td className="border p-2 bg-muted font-medium text-sm max-w-[100px] truncate" title={actualCat}>
                        {actualCat}
                      </td>
                      {confusionMatrix.matrix[i].map((count: number, j: number) => (
                        <td
                          key={j}
                          className={cn(
                            'border p-2 text-center text-sm',
                            count > 0 &&
                              i === j &&
                              'bg-green-100 dark:bg-green-900 font-semibold',
                            count > 0 &&
                              i !== j &&
                              'bg-red-100 dark:bg-red-900'
                          )}
                        >
                          {count}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Overall Accuracy: {(confusionMatrix.accuracy * 100).toFixed(2)}%
              {' • '}
              Total Predictions: {confusionMatrix.totalPredictions.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  colorClass?: string;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  colorClass = 'text-blue-600',
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase">
            {title}
          </CardDescription>
          <Icon className={cn('h-4 w-4', colorClass)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
