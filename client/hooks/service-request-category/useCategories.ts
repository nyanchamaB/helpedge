import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getServiceRequestsCategories,
  getServiceRequestCategoryById,
  getActiveServiceRequestCategories,
  getCategoriesByType,
} from '@/lib/api/service-request-category';
import { ServiceRequestType } from '@/lib/api/service-request';

export const useCategories = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: ['service-request-categories'],
    queryFn: () => getServiceRequestsCategories(),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  });
};

export const useActiveCategories = () => {
  return useQuery({
    queryKey: ['service-request-categories', 'active'],
    queryFn: () => getActiveServiceRequestCategories(),
  });
};

export const useCategoriesByType = (type?: ServiceRequestType) => {
  return useQuery({
    queryKey: ['service-request-categories', 'type', type],
    queryFn: () => getCategoriesByType(type!),
    enabled: !!type,
  });
};

export const useCategory = (id?: string) => {
  return useQuery({
    queryKey: ['service-request-categories', id],
    queryFn: () => id ? getServiceRequestCategoryById(id) : null,
    enabled: !!id,
  });
};

export const useInvalidateCategories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['service-request-categories'] });
  };
};

export const useRefetchCategories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    return queryClient.refetchQueries({ queryKey: ['service-request-categories'] });
  };
};

