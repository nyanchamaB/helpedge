'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import RequestCategoryTable from '@/components/service-request-category/RequestCategoryTable';
import {
  ServiceRequestCategory,
  getServiceRequestsCategories,
  deleteServiceRequestCategory,
  activateServiceRequestCategory,
  deactivateServiceRequestCategory,
} from '@/lib/api/service-request-category';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Download, Upload } from 'lucide-react';

const STAFF_ROLES = [
  'Admin',
  'ITManager',
  'TeamLead',
  'SystemAdmin',
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
];

export default function ServiceRequestCategoriesPage() {
  const { navigateTo } = useNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const canWrite = ['Admin', 'ITManager'].includes(user?.role ?? ''); // edit + create
  const canDelete = user?.role === 'Admin'; // delete + multiselect

  useEffect(() => {
    if (!authLoading && user && !STAFF_ROLES.includes(user.role)) {
      navigateTo('/portal/my-tickets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);
  const [categories, setCategories] = useState<ServiceRequestCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await getServiceRequestsCategories();

      setCategories(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleView = (category: ServiceRequestCategory) => {
    navigateTo(`/service-categories/${category.id}`, { from: '/service-categories' });
  };

  const handleEdit = (category: ServiceRequestCategory) => {
    navigateTo(`/service-categories/${category.id}/edit`, { from: '/service-categories' });
  };

  const handleDelete = async (categoryId: string) => {
    // Note: The table now has its own confirmation dialog
    try {
      await deleteServiceRequestCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    }
  };

  const handleCreate = () => {
    navigateTo('/service-categories/create-category');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCategories();
    toast.success('Categories refreshed');
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
    // Implement export logic here
    // You could create a function like exportServiceRequestCategories()
  };

  const handleImport = () => {
    toast.info('Import functionality coming soon!');
    // Implement import logic here
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} categories?`)) {
      try {
        // Note: You might want to create a bulk delete API endpoint
        // For now, we'll delete sequentially
        const promises = ids.map((id) => deleteServiceRequestCategory(id));

        await Promise.all(promises);
        toast.success(`${ids.length} categories deleted successfully`);
        fetchCategories(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete categories');
        console.error(error);
      }
    }
  };

  const handleBulkActivate = async (ids: string[]) => {
    try {
      const promises = ids.map((id) => activateServiceRequestCategory(id));

      await Promise.all(promises);
      toast.success(`${ids.length} categories activated successfully`);
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast.error('Failed to activate categories');
      console.error(error);
    }
  };

  const handleBulkDeactivate = async (ids: string[]) => {
    try {
      const promises = ids.map((id) => deactivateServiceRequestCategory(id));

      await Promise.all(promises);
      toast.success(`${ids.length} categories deactivated successfully`);
      fetchCategories(); // Refresh the list
    } catch (error) {
      toast.error('Failed to deactivate categories');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Service Request Categories</h1>
          <p className="text-muted-foreground">
            Manage and organize different types of service requests
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          {canWrite && (
            <>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={handleImport} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table with all features */}
      <RequestCategoryTable
        categories={categories}
        isLoading={isLoading || isRefreshing}
        onCategoryClick={handleView}
        onEdit={canWrite ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        onCreate={canWrite ? handleCreate : undefined}
        onExport={canWrite ? handleExport : undefined}
        onImport={canWrite ? handleImport : undefined}
        onBulkDelete={canDelete ? handleBulkDelete : undefined}
        onBulkActivate={canWrite ? handleBulkActivate : undefined}
        onBulkDeactivate={canWrite ? handleBulkDeactivate : undefined}
        showFilters={true}
        showActions={canWrite}
        selectable={canDelete}
      />
    </div>
  );
}
