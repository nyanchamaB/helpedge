import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApprovalWorkflows,
  getApprovalWorkflowById,
  getActiveApprovalWorkflows,
  getWorkflowForRequest,
  createApprovalWorkflow,
  updateApprovalWorkflow,
  deleteApprovalWorkflow,
  activateApprovalWorkflow,
  deactivateApprovalWorkflow,
  CreateApprovalWorkflowDto,
} from '@/lib/api/approval-workflow';
import { ServiceRequestType } from '@/lib/api/service-request';

const QK = 'approval-workflows';

function invalidate(qc: ReturnType<typeof useQueryClient>, id?: string) {
  qc.invalidateQueries({ queryKey: [QK] });
  if (id) qc.invalidateQueries({ queryKey: [QK, id] });
}

export function useApprovalWorkflows() {
  return useQuery({
    queryKey: [QK],
    queryFn: async () => {
      const res = await getApprovalWorkflows();
      if (!res.success) throw new Error(res.message || 'Failed to load workflows');
      return res.data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useActiveApprovalWorkflows() {
  return useQuery({
    queryKey: [QK, 'active'],
    queryFn: async () => {
      const res = await getActiveApprovalWorkflows();
      if (!res.success) throw new Error(res.message || 'Failed to load workflows');
      return res.data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useWorkflowForRequest(type?: ServiceRequestType, categoryId?: string) {
  return useQuery({
    queryKey: [QK, 'for-request', type, categoryId],
    queryFn: async () => {
      const res = await getWorkflowForRequest(type!, categoryId);
      if (!res.success) return null;
      return res.data ?? null;
    },
    enabled: !!type,
    staleTime: 60_000,
  });
}

export function useApprovalWorkflow(id?: string) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: async () => {
      const res = await getApprovalWorkflowById(id!);
      if (!res.success) throw new Error(res.message || 'Failed to load workflow');
      return res.data!;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApprovalWorkflowDto) => createApprovalWorkflow(data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.message || 'Failed to create workflow'); return; }
      toast.success('Workflow created');
      invalidate(qc);
    },
    onError: () => toast.error('Failed to create workflow'),
  });
}

export function useUpdateApprovalWorkflow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApprovalWorkflowDto) => updateApprovalWorkflow(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.message || 'Failed to update workflow'); return; }
      toast.success('Workflow updated');
      invalidate(qc, id);
    },
    onError: () => toast.error('Failed to update workflow'),
  });
}

export function useDeleteApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApprovalWorkflow(id),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.message || 'Failed to delete workflow'); return; }
      toast.success('Workflow deleted');
      invalidate(qc);
    },
    onError: () => toast.error('Failed to delete workflow'),
  });
}

export function useToggleApprovalWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateApprovalWorkflow(id) : activateApprovalWorkflow(id),
    onSuccess: (_res, { isActive }) => {
      toast.success(isActive ? 'Workflow deactivated' : 'Workflow activated');
      invalidate(qc);
    },
    onError: () => toast.error('Failed to update workflow status'),
  });
}
