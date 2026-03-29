'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  submitServiceRequest,
  approveServiceRequest,
  rejectServiceRequest,
  delegateServiceRequestApproval,
  assignServiceRequest,
  startServiceRequest,
  fulfillServiceRequest,
  closeServiceRequest,
  cancelServiceRequest,
  addServiceRequestComment,
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
  ApproveRequestDto,
  RejectRequestDto,
  DelegateApprovalDto,
  AssignServiceRequestDto,
  FulfillServiceRequestDto,
  AddSRCommentDto,
  CancelServiceRequestDto,
} from '@/lib/api/service-request';

function invalidateSR(qc: ReturnType<typeof useQueryClient>, id?: string) {
  qc.invalidateQueries({ queryKey: ['service-requests'] });
  if (id) {qc.invalidateQueries({ queryKey: ['service-requests', id] });}
}

export function useCreateServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestDto) => createServiceRequest(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Service request created');
        invalidateSR(qc);
      } else {
        toast.error(res.error ?? 'Failed to create request');
      }
    },
    onError: () => toast.error('Failed to create request'),
  });
}

export function useUpdateServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequestDto }) =>
      updateServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success) {
        toast.success('Request updated');
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to update request');
      }
    },
    onError: () => toast.error('Failed to update request'),
  });
}

export function useDeleteServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteServiceRequest(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Request deleted');
        invalidateSR(qc);
      } else {
        toast.error(res.error ?? 'Failed to delete request');
      }
    },
    onError: () => toast.error('Failed to delete request'),
  });
}

export function useSubmitServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submitServiceRequest(id),
    onSuccess: (res, id) => {
      if (res.success && res.data) {
        toast.success('Request submitted for approval');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        // 500 usually means no approval workflow is configured for this request type
        const msg =
          res.status === 500
            ? 'Submission failed: no approval workflow is configured for this request type. Contact your administrator.'
            : (res.error ?? 'Failed to submit request');

        toast.error(msg);
      }
    },
    onError: () => toast.error('Failed to submit request'),
  });
}

export function useApproveServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveRequestDto }) =>
      approveServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Request approved');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to approve request');
      }
    },
    onError: () => toast.error('Failed to approve request'),
  });
}

export function useRejectServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectRequestDto }) =>
      rejectServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Request rejected');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to reject request');
      }
    },
    onError: () => toast.error('Failed to reject request'),
  });
}

export function useDelegateServiceRequestApproval() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DelegateApprovalDto }) =>
      delegateServiceRequestApproval(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Approval delegated');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to delegate approval');
      }
    },
    onError: () => toast.error('Failed to delegate approval'),
  });
}

export function useAssignServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignServiceRequestDto }) =>
      assignServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Request assigned');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to assign request');
      }
    },
    onError: () => toast.error('Failed to assign request'),
  });
}

export function useStartServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => startServiceRequest(id),
    onSuccess: (res, id) => {
      if (res.success && res.data) {
        toast.success('Request started');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to start request');
      }
    },
    onError: () => toast.error('Failed to start request'),
  });
}

export function useFulfillServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: FulfillServiceRequestDto }) =>
      fulfillServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Request marked as fulfilled');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to fulfill request');
      }
    },
    onError: () => toast.error('Failed to fulfill request'),
  });
}

export function useCloseServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeServiceRequest(id),
    onSuccess: (res, id) => {
      if (res.success && res.data) {
        toast.success('Request closed');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to close request');
      }
    },
    onError: () => toast.error('Failed to close request'),
  });
}

export function useCancelServiceRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelServiceRequestDto }) =>
      cancelServiceRequest(id, data),
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        toast.success('Request cancelled');
        qc.setQueryData(['service-requests', id], res.data);
        invalidateSR(qc, id);
      } else {
        toast.error(res.error ?? 'Failed to cancel request');
      }
    },
    onError: () => toast.error('Failed to cancel request'),
  });
}

export function useAddServiceRequestComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSRCommentDto }) =>
      addServiceRequestComment(id, data),
    onSuccess: (res, { id }) => {
      if (res.success) {
        toast.success('Comment added');
        qc.invalidateQueries({ queryKey: ['service-requests', id, 'comments'] });
        qc.invalidateQueries({ queryKey: ['service-requests', id] });
      } else {
        toast.error(res.error ?? 'Failed to add comment');
      }
    },
    onError: () => toast.error('Failed to add comment'),
  });
}
