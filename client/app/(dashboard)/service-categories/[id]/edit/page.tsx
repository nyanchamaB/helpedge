"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { CategoryForm } from '@/components/service-request-category/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getServiceRequestCategoryById,
  updateServiceRequestCategory,
  UpdateServiceRequestCategoryDto,
} from '@/lib/api/service-request-category';
import { toast } from 'sonner';

export default function EditCategoryPage() {
  const { activePage, pageParams, navigateTo } = useNavigation();
  const id = pageParams?.id ?? activePage.split('/').filter(Boolean).at(-2) ?? '';

  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    getServiceRequestCategoryById(id).then((res) => {
      if (res.success && res.data) {
        setCategory(res.data);
      } else {
        toast.error('Failed to load category');
        navigateTo('/service-categories');
      }
    }).finally(() => setIsFetching(false));
  }, [id, navigateTo]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      // Build UpdateServiceRequestCategoryDto — exclude isActive (use activate/deactivate) and requestType (immutable)
      const dto: UpdateServiceRequestCategoryDto = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        requiresApproval: formData.requiresApproval,
        defaultWorkflowId: formData.defaultWorkflowId || undefined,
        fulfillmentRoles: formData.fulfillmentRoles,
        estimatedFulfillmentDays: formData.estimatedFulfillmentDays,
        requiredFields: formData.requiredFields,
        keywords: formData.keywords,
      };
      const res = await updateServiceRequestCategory(id, dto);
      if (res.success) {
        toast.success('Category updated successfully');
        navigateTo('/service-categories');
      } else {
        toast.error(res.error ?? 'Failed to update category');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <p className="text-muted-foreground mt-2">The category you are trying to edit does not exist.</p>
        <Button className="mt-4" onClick={() => navigateTo('/service-categories')}>
          Back to Categories
        </Button>
      </div>
    );
  }

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
