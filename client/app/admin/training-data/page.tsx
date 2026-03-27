"use client";

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  getTrainingData,
  getTrainingDataStats,
  addBulkTrainingData,
  deleteTrainingData,
} from '@/lib/api/ai';
import { getServiceRequestsCategories } from '@/lib/api/service-request-category';
import type { TrainingData } from '@/lib/types/ai';
import { TrainingDataSource } from '@/lib/types/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Training Data Manager Page
 * Authorization: Admin only
 * Manage ML training data, import bulk data, and monitor data quality
 */
export default function TrainingDataManagerPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<TrainingData | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Fetch training data stats
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['training-data-stats'],
    queryFn: getTrainingDataStats,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch training data with filters
  const filters = useMemo(() => {
    const params: Record<string, string | boolean> = {};
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (verifiedFilter !== 'all') params.verified = verifiedFilter === 'verified';
    return params;
  }, [categoryFilter, verifiedFilter]);

  const {
    data: trainingDataResponse,
    isLoading: isLoadingData,
    error: dataError,
    refetch: refetchData,
  } = useQuery({
    queryKey: ['training-data', filters],
    queryFn: () => getTrainingData(filters),
    staleTime: 60 * 1000,
  });

  // Fetch categories for filtering
  const { data: categoriesResponse } = useQuery({
    queryKey: ['service-categories'],
    queryFn: getServiceRequestsCategories,
    staleTime: 5 * 60 * 1000,
  });

  const stats = statsResponse?.data;
  const trainingData = trainingDataResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filter by source (client-side filter for source)
  const filteredData = useMemo(() => {
    if (sourceFilter === 'all') return trainingData;
    return trainingData.filter((item) => item.source === sourceFilter);
  }, [trainingData, sourceFilter]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrainingData(id),
    onSuccess: () => {
      toast.success('Training data deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['training-data'] });
      queryClient.invalidateQueries({ queryKey: ['training-data-stats'] });
      setDeleteModalOpen(false);
      setSelectedForDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete training data');
    },
  });

  // Bulk add mutation
  const bulkAddMutation = useMutation({
    mutationFn: addBulkTrainingData,
    onSuccess: (response) => {
      const count = response.data?.addedCount || 0;
      toast.success(`Successfully added ${count} training examples`);
      queryClient.invalidateQueries({ queryKey: ['training-data'] });
      queryClient.invalidateQueries({ queryKey: ['training-data-stats'] });
      setAddModalOpen(false);
      setCsvImportOpen(false);
      setCsvText('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add training data');
    },
  });

  // Handle CSV import
  const handleCsvImport = () => {
    if (!csvText.trim()) {
      toast.error('Please enter CSV data');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());

      // Validate headers
      const requiredHeaders = ['description', 'category'];
      const hasRequired = requiredHeaders.every((h) => headers.includes(h));
      if (!hasRequired) {
        toast.error('CSV must have "description" and "category" columns');
        return;
      }

      const examples = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i];
        });

        return {
          description: row.description || '',
          subject: row.subject,
          category: row.category || '',
          priority: row.priority,
          assignee: row.assignee,
        };
      });

      if (examples.length === 0) {
        toast.error('No valid data rows found');
        return;
      }

      bulkAddMutation.mutate({
        examples,
        source: TrainingDataSource.Import,
      });
    } catch (error) {
      toast.error('Failed to parse CSV. Please check format.');
    }
  };

  // Handle manual entry
  const [manualForm, setManualForm] = useState({
    description: '',
    subject: '',
    category: '',
    priority: '',
  });

  const handleManualAdd = () => {
    if (!manualForm.description || !manualForm.category) {
      toast.error('Description and category are required');
      return;
    }

    bulkAddMutation.mutate({
      examples: [
        {
          description: manualForm.description,
          subject: manualForm.subject || undefined,
          category: manualForm.category,
          priority: manualForm.priority || undefined,
        },
      ],
      source: TrainingDataSource.Manual,
    });
  };

  // Handle delete click
  const handleDeleteClick = (item: TrainingData) => {
    setSelectedForDelete(item);
    setDeleteModalOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (selectedForDelete) {
      deleteMutation.mutate(selectedForDelete.id);
    }
  };

  // Handle refresh all
  const handleRefreshAll = () => {
    refetchStats();
    refetchData();
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Description',
      'Subject',
      'Category',
      'Priority',
      'Source',
      'Verified',
      'Created At',
    ];
    const rows = filteredData.map((item) => [
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.subject?.replace(/"/g, '""') || ''}"`,
      item.actualCategory,
      item.actualPriority || '',
      item.source,
      item.isVerified ? 'Yes' : 'No',
      item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Training data exported');
  };

  if (statsError || dataError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load training data. Please try again.
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
          <h1 className="text-3xl font-bold">Training Data Manager</h1>
          <p className="text-muted-foreground">
            Manage ML training data and monitor data quality
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isLoadingStats || isLoadingData}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 mr-2',
                (isLoadingStats || isLoadingData) && 'animate-spin'
              )}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Training Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Count */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase">
                  Total Examples
                </CardDescription>
                <Database className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalCount?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Training data entries
              </p>
            </CardContent>
          </Card>

          {/* Verified Count */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase">
                  Verified
                </CardDescription>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.verifiedCount?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {(stats?.totalCount ?? 0) > 0
                  ? `${(((stats?.verifiedCount ?? 0) / (stats?.totalCount ?? 1)) * 100).toFixed(1)}% verified`
                  : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          {/* Data Quality Score */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase">
                  Balance Score
                </CardDescription>
                <BarChart3
                  className={cn(
                    'h-4 w-4',
                    (stats?.balanceScore || 0) >= 0.7
                      ? 'text-green-600'
                      : (stats?.balanceScore || 0) >= 0.5
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  )}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.balanceScore
                  ? `${(stats.balanceScore * 100).toFixed(0)}%`
                  : 'N/A'}
              </div>
              <Progress
                value={(stats?.balanceScore || 0) * 100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Category distribution
              </p>
            </CardContent>
          </Card>

          {/* Categories Covered */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase">
                  Categories
                </CardDescription>
                <Filter className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.byCategory ? Object.keys(stats.byCategory).length : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Categories with data
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filter Training Data</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Override">Override</SelectItem>
                  <SelectItem value="Approval">Approval</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Import">Import</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Unverified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Training Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Data ({filteredData.length})</CardTitle>
          <CardDescription>
            Manage training examples used for ML model training
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="max-w-md">
                          {item.subject && (
                            <div className="font-medium text-sm mb-1">
                              {item.subject}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.actualCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.actualPriority ? (
                          <Badge
                            variant={
                              item.actualPriority === 'High'
                                ? 'destructive'
                                : item.actualPriority === 'Medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {item.actualPriority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.source}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No training data found. Add training examples to improve AI accuracy.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Training Data Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Training Data</DialogTitle>
            <DialogDescription>
              Add training examples manually or import from CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tab-like buttons */}
            <div className="flex gap-2">
              <Button
                variant={csvImportOpen ? 'outline' : 'default'}
                onClick={() => setCsvImportOpen(false)}
                className="flex-1"
              >
                Manual Entry
              </Button>
              <Button
                variant={csvImportOpen ? 'default' : 'outline'}
                onClick={() => setCsvImportOpen(true)}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                CSV Import
              </Button>
            </div>

            {/* Manual Entry Form */}
            {!csvImportOpen && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter ticket description..."
                    value={manualForm.description}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    placeholder="Enter ticket subject..."
                    value={manualForm.subject}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, subject: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={manualForm.category}
                      onValueChange={(value) =>
                        setManualForm({ ...manualForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (optional)</Label>
                    <Select
                      value={manualForm.priority}
                      onValueChange={(value) =>
                        setManualForm({ ...manualForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Import */}
            {csvImportOpen && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    CSV format: description, category, [subject], [priority]
                    <br />
                    First row should be headers. Required: description, category
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="csv-data">Paste CSV Data</Label>
                  <Textarea
                    id="csv-data"
                    placeholder="description,category,subject,priority
My printer is not working,Hardware,Printer Issue,High
Cannot access email,Software,Email Problem,Medium"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={csvImportOpen ? handleCsvImport : handleManualAdd}
              disabled={bulkAddMutation.isPending}
            >
              {bulkAddMutation.isPending ? 'Adding...' : 'Add Training Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Training Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this training example? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedForDelete && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium">Description:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedForDelete.description}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{selectedForDelete.actualCategory}</Badge>
                <Badge variant="secondary">{selectedForDelete.source}</Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
