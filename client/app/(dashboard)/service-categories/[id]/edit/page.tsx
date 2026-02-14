"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CategoryForm } from '@/components/service-request-category/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  getServiceRequestCategoryById, 
  updateServiceRequestCategory 
} from '@/lib/api/service-request-category';
import { toast } from 'sonner';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getServiceRequestCategoryById(id);
        setCategory(data);
      } catch (error) {
        toast.error('Failed to load category');
        router.push('/service-request-categories');
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updateServiceRequestCategory(id, data);
      toast.success('Category updated successfully');
      router.push('/service-request-categories');
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
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Category not found</h2>
          <p className="text-gray-500 mt-2">
            The category you&apos;re trying to edit doesn&apos;t exist.
          </p>
          <Link href="/service-request-categories">
            <Button className="mt-4">Back to Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/service-request-categories">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Category</CardTitle>
          <p className="text-gray-500">
            Update service request category details
          </p>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initialData={category}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isLoading}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
}