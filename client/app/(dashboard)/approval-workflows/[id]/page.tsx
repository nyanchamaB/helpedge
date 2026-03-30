'use client';
export const dynamic = 'force-dynamic';

import { useNavigation } from '@/contexts/NavigationContext';
import {
  useApprovalWorkflow,
  useDeleteApprovalWorkflow,
  useToggleApprovalWorkflow,
} from '@/hooks/approval-workflows/useApprovalWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  Users,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

const APPROVER_TYPE_LABELS: Record<string, string> = {
  SpecificUser: 'Specific User',
  Role: 'By Role',
  RequestersManager: "Requester's Manager",
  DepartmentHead: 'Department Head',
  CostCenterOwner: 'Cost Center Owner',
  SecurityTeam: 'Security Team',
  ITManagement: 'IT Management',
};

export default function ApprovalWorkflowDetailPage() {
  const { activePage, pageParams, navigateTo } = useNavigation();
  const id = pageParams?.id ?? activePage.split('/').pop() ?? '';
  const { data: workflow, isLoading } = useApprovalWorkflow(id);
  const deleteMutation = useDeleteApprovalWorkflow();
  const toggleMutation = useToggleApprovalWorkflow();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold">Workflow not found</h2>
        <Button className="mt-4" onClick={() => navigateTo('/approval-workflows')}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(workflow.id);
    navigateTo('/approval-workflows');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigateTo('/approval-workflows')}>
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toggleMutation.mutate({ id: workflow.id, isActive: workflow.isActive })}
          >
            {workflow.isActive ? (
              <>
                <ToggleRight className="h-4 w-4 text-green-600" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigateTo(`/approval-workflows/${id}/edit`)}
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete &quot;{workflow.name}&quot;? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <Badge
            variant={workflow.isActive ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {workflow.isActive ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {workflow.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {workflow.description && (
          <p className="text-muted-foreground mt-2">{workflow.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Approval Steps ({workflow.steps?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(workflow.steps ?? [])
                .sort((a, b) => a.order - b.order)
                .map((step, i) => (
                  <div key={step.id ?? i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                        {step.order}
                      </div>
                      {i < (workflow.steps?.length ?? 0) - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{step.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {APPROVER_TYPE_LABELS[step.approverType] ?? step.approverType}
                        </Badge>
                        {step.requireAll && (
                          <Badge variant="outline" className="text-xs">
                            All must approve
                          </Badge>
                        )}
                        {step.canDelegate && (
                          <Badge variant="outline" className="text-xs">
                            Delegatable
                          </Badge>
                        )}
                        {step.autoApproveOnTimeout && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-approve on timeout
                          </Badge>
                        )}
                      </div>
                      {(step.approverRoles ?? []).length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {step.approverRoles.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {step.timeoutHours && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.timeoutHours}h timeout
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escalation Timeout</span>
                <span className="font-medium">{workflow.escalationTimeoutHours}h</span>
              </div>
              {workflow.autoApproveBelow !== null && workflow.autoApproveBelow !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-approve Below</span>
                  <span className="font-medium">${workflow.autoApproveBelow}</span>
                </div>
              )}
              <Separator />
              <div>
                <span className="text-muted-foreground block mb-1.5">Request Types</span>
                <div className="flex flex-wrap gap-1">
                  {(workflow.requestTypes ?? []).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              {(workflow.categoryIds ?? []).length > 0 && (
                <div>
                  <span className="text-muted-foreground block mb-1.5">Specific Categories</span>
                  <span className="text-xs">{workflow.categoryIds.length} category(ies)</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created</span>
                <span>{format(new Date(workflow.createdAt), 'PP')}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Updated</span>
                <span>{format(new Date(workflow.updatedAt), 'PP')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
