'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryForm } from '@/components/service-request-category/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  createServiceRequestCategory,
  CreateServiceRequestCategoryDto,
} from '@/lib/api/service-request-category';
import { ServiceRequestType } from '@/lib/api/service-request';
import { toast } from 'sonner';

export default function CreateCategoryPage() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!['Admin', 'ITManager'].includes(user?.role ?? '')) {navigateTo('/service-categories');}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const dto: CreateServiceRequestCategoryDto = {
        name: formData.name as string,
        requestType: formData.requestType as ServiceRequestType,
        description: formData.description as string,
        color: formData.color as string,
        icon: formData.icon as string,
        requiresApproval: formData.requiresApproval as boolean,
        defaultWorkflowId: (formData.defaultWorkflowId as string) || undefined,
        fulfillmentRoles: formData.fulfillmentRoles as string[],
        estimatedFulfillmentDays: formData.estimatedFulfillmentDays as number,
        requiredFields: formData.requiredFields as CreateServiceRequestCategoryDto['requiredFields'],
        keywords: formData.keywords as string[],
      };
      const response = await createServiceRequestCategory(dto);

      if (!response.success) {
        toast.error(response.error ?? 'Failed to create category');

        return;
      }
      toast.success('Category created successfully');
      navigateTo('/service-categories');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" className="gap-2" onClick={() => navigateTo('/service-categories')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Service Category</CardTitle>
          <p className="text-muted-foreground">
            Define a new service request category with its settings and required fields
          </p>
        </CardHeader>
        <CardContent>
          <CategoryForm
            onSubmit={handleSubmit}
            onCancel={() => navigateTo('/service-categories')}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
