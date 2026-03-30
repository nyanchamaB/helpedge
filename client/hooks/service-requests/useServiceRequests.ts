'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getServiceRequests,
  getServiceRequestById,
  getMyServiceRequests,
  getServiceRequestsForMe,
  getAssignedServiceRequests,
  getServiceRequestsPendingApprovalForMe,
  getOverdueServiceRequests,
  getServiceRequestsByStatus,
  getServiceRequestsByType,
  getServiceRequestsByCategory,
  getServiceRequestApprovalStatus,
  getApprovalStatus,
  getServiceRequestComments,
  getServiceRequestStats,
  getMyServiceRequestStats,
  ServiceRequestStatus,
  ServiceRequestType,
} from '@/lib/api/service-request';

const STALE_TIME = 30_000; // 30 s

export function useAllServiceRequests() {
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      const res = await getServiceRequests();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useServiceRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['service-requests', id],
    queryFn: async () => {
      const res = await getServiceRequestById(id!);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load request');}

      return res.data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useMyServiceRequests() {
  return useQuery({
    queryKey: ['service-requests', 'my'],
    queryFn: async () => {
      const res = await getMyServiceRequests();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestsForMe() {
  return useQuery({
    queryKey: ['service-requests', 'for-me'],
    queryFn: async () => {
      const res = await getServiceRequestsForMe();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useAssignedServiceRequests() {
  return useQuery({
    queryKey: ['service-requests', 'assigned'],
    queryFn: async () => {
      const res = await getAssignedServiceRequests();

      if (!res.success || !res.data)
        {throw new Error(res.error ?? 'Failed to load assigned requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function usePendingApprovalForMe() {
  return useQuery({
    queryKey: ['service-requests', 'pending-approval'],
    queryFn: async () => {
      const res = await getServiceRequestsPendingApprovalForMe();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useOverdueServiceRequests() {
  return useQuery({
    queryKey: ['service-requests', 'overdue'],
    queryFn: async () => {
      const res = await getOverdueServiceRequests();

      if (!res.success || !res.data)
        {throw new Error(res.error ?? 'Failed to load overdue requests');}

      return res.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestsByStatus(status: ServiceRequestStatus | undefined) {
  return useQuery({
    queryKey: ['service-requests', 'by-status', status],
    queryFn: async () => {
      const res = await getServiceRequestsByStatus(status!);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    enabled: !!status,
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestsByType(type: ServiceRequestType | undefined) {
  return useQuery({
    queryKey: ['service-requests', 'by-type', type],
    queryFn: async () => {
      const res = await getServiceRequestsByType(type!);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    enabled: !!type,
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['service-requests', 'by-category', categoryId],
    queryFn: async () => {
      const res = await getServiceRequestsByCategory(categoryId!);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load requests');}

      return res.data;
    },
    enabled: !!categoryId,
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestApprovalHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['service-requests', id, 'approval-history'],
    queryFn: async () => {
      const res = await getServiceRequestApprovalStatus(id!);

      if (!res.success) {throw new Error(res.error ?? 'Failed to load approval history');}

      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useApprovalStatus(id: string | undefined) {
  return useQuery({
    queryKey: ['service-requests', id, 'approval-status'],
    queryFn: async () => {
      const res = await getApprovalStatus(id!);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load approval status');}

      return res.data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestComments(id: string | undefined, includeInternal = false) {
  return useQuery({
    queryKey: ['service-requests', id, 'comments', includeInternal],
    queryFn: async () => {
      const res = await getServiceRequestComments(id!, includeInternal);

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load comments');}

      return res.data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useServiceRequestStats() {
  return useQuery({
    queryKey: ['service-requests', 'stats'],
    queryFn: async () => {
      const res = await getServiceRequestStats();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load stats');}

      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useMyServiceRequestStats() {
  return useQuery({
    queryKey: ['service-requests', 'stats', 'my'],
    queryFn: async () => {
      const res = await getMyServiceRequestStats();

      if (!res.success || !res.data) {throw new Error(res.error ?? 'Failed to load stats');}

      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useInvalidateServiceRequests() {
  const qc = useQueryClient();

  return () => qc.invalidateQueries({ queryKey: ['service-requests'] });
}
