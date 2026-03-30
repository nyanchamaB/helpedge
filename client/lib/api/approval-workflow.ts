import { apiRequest, ApiResponse } from './client';
import { ServiceRequestType } from './service-request';

export type ApproverType =
  | 'SpecificUser'
  | 'Role'
  | 'RequestersManager'
  | 'DepartmentHead'
  | 'CostCenterOwner'
  | 'SecurityTeam'
  | 'ITManagement';

export interface ApprovalStep {
  id?: string;
  name: string;
  order: number;
  approverType: ApproverType;
  approverRoles: string[];
  specificApproverIds: string[];
  requireAll: boolean;
  canDelegate: boolean;
  timeoutHours?: number | null;
  autoApproveOnTimeout: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  requestTypes: ServiceRequestType[];
  categoryIds: string[];
  steps: ApprovalStep[];
  autoApproveBelow?: number | null;
  escalationTimeoutHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalWorkflowDto {
  name: string;
  description?: string;
  requestTypes: ServiceRequestType[];
  categoryIds: string[];
  steps: Omit<ApprovalStep, 'id'>[];
  autoApproveBelow?: number | null;
  escalationTimeoutHours: number;
}

export type UpdateApprovalWorkflowDto = CreateApprovalWorkflowDto;

export async function getApprovalWorkflows(): Promise<ApiResponse<ApprovalWorkflow[]>> {
  return apiRequest<ApprovalWorkflow[]>('/api/approval-workflows', { includeAuth: true });
}

export async function getActiveApprovalWorkflows(): Promise<ApiResponse<ApprovalWorkflow[]>> {
  return apiRequest<ApprovalWorkflow[]>('/api/approval-workflows/active', { includeAuth: true });
}

export async function getApprovalWorkflowById(id: string): Promise<ApiResponse<ApprovalWorkflow>> {
  return apiRequest<ApprovalWorkflow>(`/api/approval-workflows/${id}`, { includeAuth: true });
}

export async function getWorkflowForRequest(
  type: ServiceRequestType,
  categoryId?: string,
): Promise<ApiResponse<ApprovalWorkflow>> {
  const params = new URLSearchParams({ type });

  if (categoryId) {params.append('categoryId', categoryId);}

  return apiRequest<ApprovalWorkflow>(`/api/approval-workflows/for-request?${params}`, {
    includeAuth: true,
  });
}

export async function createApprovalWorkflow(
  data: CreateApprovalWorkflowDto,
): Promise<ApiResponse<ApprovalWorkflow>> {
  return apiRequest<ApprovalWorkflow>('/api/approval-workflows', {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify(data),
  });
}

export async function updateApprovalWorkflow(
  id: string,
  data: UpdateApprovalWorkflowDto,
): Promise<ApiResponse<ApprovalWorkflow>> {
  return apiRequest<ApprovalWorkflow>(`/api/approval-workflows/${id}`, {
    method: 'PUT',
    includeAuth: true,
    body: JSON.stringify(data),
  });
}

export async function deleteApprovalWorkflow(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/api/approval-workflows/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

export async function activateApprovalWorkflow(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/api/approval-workflows/${id}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

export async function deactivateApprovalWorkflow(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/api/approval-workflows/${id}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}
