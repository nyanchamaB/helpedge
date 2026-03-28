"use client";
export const dynamic = 'force-dynamic';

import { useNavigation } from '@/contexts/NavigationContext';
import { useApprovalWorkflow, useUpdateApprovalWorkflow } from '@/hooks/approval-workflows/useApprovalWorkflows';
import { WorkflowForm } from '@/components/approval-workflows/WorkflowForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { CreateApprovalWorkflowDto } from '@/lib/api/approval-workflow';
import { useRouter } from 'next/navigation';

export default function EditApprovalWorkflowPage() {
  const { activePage, pageParams} = useNavigation();
  const id = pageParams?.id ?? activePage.split('/').filter(Boolean).at(-2) ?? '';
  const router = useRouter();
  const { data: workflow, isLoading } = useApprovalWorkflow(id);
  const updateMutation = useUpdateApprovalWorkflow(id);
  const handleSubmit = async (data: CreateApprovalWorkflowDto) => {
  const result = await updateMutation.mutateAsync(data);
    if (result.success) {
      router.push(`/approval-workflows/${id}`);
    }
  };
  if (isLoading) {
    return <div className="container mx-auto py-8 flex justify-center"><Spinner size="lg" /></div>;
  }
  if (!workflow) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold">Workflow not found</h2>
        <Button className="mt-4" onClick={() => router.push('/approval-workflows')}>Back to Workflows</Button>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" className="gap-2" onClick={() => router.push(`/approval-workflows/${id}`)}>
          <ArrowLeft className="h-4 w-4" /> Back to Workflow
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Workflow</CardTitle>
          <p className="text-muted-foreground">{workflow.name}</p>
        </CardHeader>
        <CardContent>
          <WorkflowForm
            initialData={workflow}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/approval-workflows/${id}`)}
            isLoading={updateMutation.isPending}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
}
