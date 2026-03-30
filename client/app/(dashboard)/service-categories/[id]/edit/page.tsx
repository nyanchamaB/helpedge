'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryForm } from '@/components/service-request-category/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  getServiceRequestCategoryById,
  updateServiceRequestCategory,
  UpdateServiceRequestCategoryDto,
  type ServiceRequestCategory,
} from '@/lib/api/service-request-category';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function EditCategoryPage() {
  const { activePage, pageParams, navigateTo } = useNavigation();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!['Admin', 'ITManager'].includes(user?.role ?? '')) {router.push('/service-categories');}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const id = pageParams?.id ?? activePage.split('/').filter(Boolean).at(-2) ?? '';

  const [category, setCategory] = useState<ServiceRequestCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!id) {return;}
    getServiceRequestCategoryById(id)
      .then((res) => {
        if (res.success && res.data) {
          setCategory(res.data);
        } else {
          toast.error('Failed to load category');
          navigateTo('/service-categories');
        }
      })
      .finally(() => setIsFetching(false));
  }, [id, navigateTo]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      // Build UpdateServiceRequestCategoryDto — exclude isActive (use activate/deactivate) and requestType (immutable)
      const dto: UpdateServiceRequestCategoryDto = {
        name: formData.name as string,
        description: formData.description as string,
        color: formData.color as string,
        icon: formData.icon as string,
        requiresApproval: formData.requiresApproval as boolean,
        defaultWorkflowId: (formData.defaultWorkflowId as string) || undefined,
        fulfillmentRoles: formData.fulfillmentRoles as string[],
        estimatedFulfillmentDays: formData.estimatedFulfillmentDays as number,
        requiredFields: formData.requiredFields as UpdateServiceRequestCategoryDto['requiredFields'],
        keywords: formData.keywords as string[],
      };
      const res = await updateServiceRequestCategory(id, dto);

      if (res.success) {
        toast.success('Category updated successfully');
        navigateTo('/service-categories');
      } else {
        toast.error(res.error ?? 'Failed to update category');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <p className="text-muted-foreground mt-2">
          The category you are trying to edit does not exist.
        </p>
        <Button className="mt-4" onClick={() => router.push('/service-categories')}>
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push('/service-categories')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Category</CardTitle>
          <p className="text-muted-foreground">Update service request category details</p>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initialData={category}
            onSubmit={handleSubmit}
            onCancel={() => navigateTo('/service-categories')}
            isLoading={isLoading}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
}
