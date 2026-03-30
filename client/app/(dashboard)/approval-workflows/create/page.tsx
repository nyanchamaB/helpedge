'use client';
export const dynamic = 'force-dynamic';

// import { useNavigation } from '@/contexts/NavigationContext';
import { useRouter } from 'next/navigation';
import { useCreateApprovalWorkflow } from '@/hooks/approval-workflows/useApprovalWorkflows';
import { WorkflowForm } from '@/components/approval-workflows/WorkflowForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CreateApprovalWorkflowDto } from '@/lib/api/approval-workflow';

export default function CreateApprovalWorkflowPage() {
  const router = useRouter();
  const createMutation = useCreateApprovalWorkflow();

  const handleSubmit = async (data: CreateApprovalWorkflowDto) => {
    const result = await createMutation.mutateAsync(data);

    if (result.success) {
      router.push('/approval-workflows');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push('/approval-workflows')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Approval Workflow</CardTitle>
          <p className="text-muted-foreground">
            Define a multi-step approval chain for service requests
          </p>
        </CardHeader>
        <CardContent>
          <WorkflowForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/approval-workflows')}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
