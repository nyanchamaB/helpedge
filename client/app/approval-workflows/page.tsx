"use client";
export const dynamic = 'force-dynamic';

import { useNavigation } from '@/contexts/NavigationContext';
import { useApprovalWorkflows, useDeleteApprovalWorkflow, useToggleApprovalWorkflow } from '@/hooks/approval-workflows/useApprovalWorkflows';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronRight, Clock, Layers } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SERVICE_REQUEST_TYPES } from '@/lib/api/service-request';

export default function ApprovalWorkflowsPage() {
  const { navigateTo } = useNavigation();
  const { data: workflows = [], isLoading } = useApprovalWorkflows();
  const deleteMutation = useDeleteApprovalWorkflow();
  const toggleMutation = useToggleApprovalWorkflow();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Workflows</h1>
          <p className="text-muted-foreground text-sm mt-1">Define multi-step approval chains for service requests</p>
        </div>
        <Button onClick={() => navigateTo('/approval-workflows/create')} className="gap-2">
          <Plus className="h-4 w-4" /> New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No workflows yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Create approval workflows to manage service request approvals</p>
          <Button onClick={() => navigateTo('/approval-workflows/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create First Workflow
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <Card key={wf.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo(`/approval-workflows/${wf.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{wf.name}</span>
                      <Badge variant={wf.isActive ? 'default' : 'secondary'}>
                        {wf.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {wf.description && <p className="text-sm text-muted-foreground mt-1 truncate">{wf.description}</p>}

                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {wf.steps?.length ?? 0} step{(wf.steps?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {wf.escalationTimeoutHours}h escalation
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(wf.requestTypes ?? []).map(type => (
                        <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: wf.id, isActive: wf.isActive })}>
                      {wf.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateTo(`/approval-workflows/${wf.id}/edit`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{wf.name}&quot;? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(wf.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
