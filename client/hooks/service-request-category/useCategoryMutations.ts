import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createServiceRequestCategory,
  updateServiceRequestCategory,
  deleteServiceRequestCategory,
  activateServiceRequestCategory,
  deactivateServiceRequestCategory,
  ServiceRequestCategory
} from '@/lib/api/service-request-category';
import { toast } from 'sonner';


export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createServiceRequestCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceRequestCategory> }) =>
      updateServiceRequestCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
      queryClient.invalidateQueries({ queryKey: ['service-request-categories', variables.id] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteServiceRequestCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? activateServiceRequestCategory(id) : deactivateServiceRequestCategory(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
      queryClient.invalidateQueries({ queryKey: ['service-request-categories', variables.id] });
      toast.success(`Category ${variables.activate ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category status');
    },
  });
};

export const useBulkOperations = () => {
  const queryClient = useQueryClient();
  const toggleStatus = useToggleCategoryStatus();
  const deleteMutation = useDeleteCategory();
  
  return {
    bulkActivate: async (ids: string[]) => {
      const promises = ids.map(id => 
        toggleStatus.mutateAsync({ id, activate: true })
      );
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
    },
    
    bulkDeactivate: async (ids: string[]) => {
      const promises = ids.map(id => 
        toggleStatus.mutateAsync({ id, activate: false })
      );
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
    },
    
    bulkDelete: async (ids: string[]) => {
      const promises = ids.map(id => 
        deleteMutation.mutateAsync(id)
      );
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
    },
    
    isPending: toggleStatus.isPending || deleteMutation.isPending,
  };
};