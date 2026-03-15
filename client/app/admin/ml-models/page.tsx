"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Brain,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Play,
  Eye,
  Power,
  RefreshCw,
  Sparkles,
  Database,
  TrendingUp,
  Clock,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMLModels,
  getMLModelStats,
  checkRetrainingEligibility,
  triggerModelRetraining,
  activateMLModel,
  deleteMLModel,
  cleanupOldModels,
} from '@/lib/api/ai';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MLModel, RetrainingRequest } from '@/lib/types/ai';

/**
 * ML Model Management Page
 * Authorization: Admin only
 * Manage ML model versions, training, activation, and cleanup
 */
export default function MLModelManagementPage() {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainModalOpen, setTrainModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<MLModel | null>(null);

  // Training form state
  const [useVerifiedOnly, setUseVerifiedOnly] = useState(false);
  const [trainingNotes, setTrainingNotes] = useState('');

  // Fetch all models
  const {
    data: modelsResponse,
    isLoading: isLoadingModels,
    error: modelsError,
    refetch: refetchModels,
  } = useQuery({
    queryKey: ['ml-models'],
    queryFn: getMLModels,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch model stats
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['ml-model-stats'],
    queryFn: getMLModelStats,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch retraining eligibility
  const {
    data: eligibilityResponse,
    isLoading: isLoadingEligibility,
    refetch: refetchEligibility,
  } = useQuery({
    queryKey: ['retraining-eligibility'],
    queryFn: checkRetrainingEligibility,
    staleTime: 2 * 60 * 1000,
  });

  const models = modelsResponse?.data || [];
  const stats = statsResponse?.data;
  const eligibility = eligibilityResponse?.data;

  // Activate model mutation
  const activateMutation = useMutation({
    mutationFn: ({ modelId, notes }: { modelId: string; notes?: string }) =>
      activateMLModel(modelId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      queryClient.invalidateQueries({ queryKey: ['ml-model-stats'] });
      toast.success('Model activated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to activate model', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Delete model mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMLModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      queryClient.invalidateQueries({ queryKey: ['ml-model-stats'] });
      toast.success('Model deleted successfully');
      setDeleteModalOpen(false);
      setModelToDelete(null);
    },
    onError: (error: Error) => {
      toast.error('Failed to delete model', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Train new model mutation
  const trainMutation = useMutation({
    mutationFn: (request: RetrainingRequest) => triggerModelRetraining(request),
    onSuccess: (response) => {
      if (response.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['ml-models'] });
        queryClient.invalidateQueries({ queryKey: ['ml-model-stats'] });
        queryClient.invalidateQueries({ queryKey: ['retraining-eligibility'] });
        toast.success('Model training completed!', {
          description: response.data.wasActivated
            ? 'New model activated automatically'
            : 'Model trained but not activated',
        });
        setTrainModalOpen(false);
        setTrainingNotes('');
        setUseVerifiedOnly(false);
      } else {
        toast.error('Model training failed', {
          description: response.data?.message || 'Unknown error',
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to start training', {
        description: error.message || 'Please try again',
      });
    },
  });

  // Cleanup old models mutation
  const cleanupMutation = useMutation({
    mutationFn: cleanupOldModels,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      toast.success(
        `Cleaned up ${response.data?.deletedCount || 0} old model(s)`
      );
    },
    onError: (error: Error) => {
      toast.error('Failed to cleanup models', {
        description: error.message || 'Please try again',
      });
    },
  });

  const handleViewDetails = (model: MLModel) => {
    setSelectedModel(model);
    setDetailsModalOpen(true);
  };

  const handleActivate = (model: MLModel) => {
    activateMutation.mutate({
      modelId: model.id,
      notes: `Manually activated on ${format(new Date(), 'PPpp')}`,
    });
  };

  const handleDeleteClick = (model: MLModel) => {
    setModelToDelete(model);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      deleteMutation.mutate(modelToDelete.id);
    }
  };

  const handleTrainNewModel = () => {
    const request: RetrainingRequest = {
      useVerifiedDataOnly: useVerifiedOnly,
      notes: trainingNotes || undefined,
    };
    trainMutation.mutate(request);
  };

  const handleRefreshAll = () => {
    refetchModels();
    refetchStats();
    refetchEligibility();
  };

  if (modelsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load ML models. Please try again.
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
          <h1 className="text-3xl font-bold">ML Model Management</h1>
          <p className="text-muted-foreground">
            Manage machine learning model versions, training, and deployment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isLoadingModels}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 mr-2',
                isLoadingModels && 'animate-spin'
              )}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Old Models
          </Button>
          <Button onClick={() => setTrainModalOpen(true)}>
            <Play className="h-4 w-4 mr-2" />
            Train New Model
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
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Total Models
              </CardDescription>
              <Brain className="h-4 w-4 text-blue-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalModels || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Versions available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Active Model Accuracy
              </CardDescription>
              <Target className="h-4 w-4 text-green-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.activeModel
                  ? `${(stats.activeModel.accuracy * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.activeModel?.version || 'No active model'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Training Data
              </CardDescription>
              <Database className="h-4 w-4 text-purple-600 absolute top-4 right-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.trainingDataCount?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Examples available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase">
                Retraining Status
              </CardDescription>
              <Sparkles
                className={cn(
                  'h-4 w-4 absolute top-4 right-4',
                  eligibility?.isEligible ? 'text-green-600' : 'text-gray-400'
                )}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {eligibility?.isEligible ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {eligibility?.isEligible ? 'Ready to train' : 'Not yet ready'}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Retraining Eligibility Banner */}
      {eligibility?.isEligible && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Model retraining recommended!</strong> {eligibility.reason}
            <Button
              variant="link"
              className="px-2"
              onClick={() => setTrainModalOpen(true)}
            >
              Train Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Versions</CardTitle>
          <CardDescription>
            Manage and activate different model versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingModels ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No models yet</h3>
              <p className="text-muted-foreground mb-4">
                Train your first model to get started
              </p>
              <Button onClick={() => setTrainModalOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Train First Model
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Training Date</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Examples</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium font-mono">
                        {model.version}
                      </TableCell>
                      <TableCell>
                        {model.trainingDate ? format(new Date(model.trainingDate), 'PPpp') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (model.accuracy || 0) >= 0.8
                              ? 'default'
                              : (model.accuracy || 0) >= 0.6
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {((model.accuracy || 0) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {model.trainingExamplesCount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        {model.isActive ? (
                          <Badge className="bg-green-600">
                            <Power className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(model)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!model.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleActivate(model)}
                              disabled={activateMutation.isPending}
                              title="Activate model"
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          {!model.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(model)}
                              disabled={deleteMutation.isPending}
                              title="Delete model"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
            <DialogDescription>
              Version: {selectedModel?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Accuracy</p>
                  <p className="text-2xl font-bold">
                    {((selectedModel?.accuracy || 0) * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Training Examples</p>
                  <p className="text-2xl font-bold">
                    {selectedModel?.trainingExamplesCount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Test Examples</p>
                  <p className="text-2xl font-bold">
                    {selectedModel?.testExamplesCount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={selectedModel?.isActive ? 'bg-green-600' : ''}>
                    {selectedModel?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {selectedModel.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedModel.notes}
                  </p>
                </div>
              )}
            </div>
          )}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete model version{' '}
              <strong>{modelToDelete?.version}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
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

      {/* Train New Model Modal */}
      <Dialog open={trainModalOpen} onOpenChange={setTrainModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Train New Model</DialogTitle>
            <DialogDescription>
              Configure training options for a new ML model version
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {stats && (
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  You have <strong>{stats?.trainingDataCount || 0}</strong> training
                  examples available
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-only"
                checked={useVerifiedOnly}
                onCheckedChange={(checked) =>
                  setUseVerifiedOnly(checked as boolean)
                }
              />
              <label
                htmlFor="verified-only"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use verified data only (higher quality)
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about this training run..."
                value={trainingNotes}
                onChange={(e) => setTrainingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTrainModalOpen(false)}
              disabled={trainMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTrainNewModel}
              disabled={trainMutation.isPending}
            >
              {trainMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
