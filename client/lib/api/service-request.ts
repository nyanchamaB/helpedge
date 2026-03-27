import { apiRequest, ApiResponse } from "./client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ServiceRequestStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'InProgress'
  | 'Fulfilled'
  | 'OnHold'
  | 'Closed'
  | 'Rejected'
  | 'Cancelled';

export type ServiceRequestType =
  | 'Access'
  | 'Equipment'
  | 'Software'
  | 'DataChange'
  | 'Workspace'
  | 'Account'
  | 'PermissionChange';

export type ServiceRequestPriority = 'Critical' | 'High' | 'Normal' | 'Low';

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  subject: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  requestType: ServiceRequestType;
  categoryId?: string | null;
  categoryName?: string | null;
  justification?: string | null;
  // Requester
  requesterId?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  // Beneficiary (on behalf of)
  onBehalfOfId?: string | null;
  onBehalfOfName?: string | null;
  // Assignment
  assignedToId?: string | null;
  assignedToName?: string | null;
  assignedAt?: string | null;
  // Approval
  approvalWorkflowId?: string | null;
  currentApprovalStepId?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  approvalHistory?: unknown[];
  // Fulfillment
  fulfilledById?: string | null;
  fulfilledByName?: string | null;
  fulfillmentNotes?: string | null;
  actualCost?: number | null;
  // Dates
  createdAt: string;
  updatedAt?: string | null;
  submittedAt?: string | null;
  requiredByDate?: string | null;
  fulfilledAt?: string | null;
  closedAt?: string | null;
  cancelledAt?: string | null;
  // Extras
  estimatedCost?: number | null;
  tags?: string[];
  requestDetails?: Record<string, unknown> | null;
  isOverdue?: boolean;
  commentCount?: number;
  attachmentCount?: number;
  relatedTicketId?: string | null;
  comments?: ServiceRequestComment[];
  // AI analysis (populated on CREATE and APPROVE by ISRAIService)
  aiConfidenceScore?: number | null;
  aiSuggestedPriority?: ServiceRequestPriority | null;
  aiSuggestedCategoryId?: string | null;
  aiSuggestedAssigneeId?: string | null;
  aiAssignmentReason?: string | null;
}

export interface ServiceRequestComment {
  id: string;
  content: string;
  authorId: string;
  authorName?: string | null;
  createdAt: string;
  isInternal: boolean;
}

export interface ServiceRequestApprovalHistory {
  id: string;
  status: ServiceRequestStatus;
  changedAt: string;
  changedById?: string | null;
  changedByName?: string | null;
  notes?: string | null;
}

export type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected' | 'Delegated' | 'Skipped';

export interface ApprovalStepStatusDto {
  stepId?: string | null;
  stepName?: string | null;
  order: number;
  status: ApprovalDecision;
  approverName?: string | null;
  decidedAt?: string | null;
  comments?: string | null;
  isCurrent: boolean;
}

export interface ApprovalStatusDto {
  requestId?: string | null;
  requestNumber?: string | null;
  status: ServiceRequestStatus;
  currentStepName?: string | null;
  totalSteps: number;
  completedSteps: number;
  steps?: ApprovalStepStatusDto[] | null;
}

export interface ServiceRequestStats {
  totalRequests: number;
  draftCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  inProgressCount: number;
  fulfilledCount: number;
  closedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  overdueCount: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateServiceRequestDto {
  subject: string;
  description: string;
  requestType: ServiceRequestType;
  categoryId?: string;
  justification?: string;
  priority?: ServiceRequestPriority;
  requiredByDate?: string;
  onBehalfOfId?: string;
  requestDetails?: Record<string, unknown>;
  estimatedCost?: number;
  tags?: string[];
}

export interface UpdateServiceRequestDto {
  subject?: string;
  description?: string;
  requestType?: ServiceRequestType;
  categoryId?: string;
  justification?: string;
  priority?: ServiceRequestPriority;
  requiredByDate?: string;
  requestDetails?: Record<string, unknown>;
  estimatedCost?: number;
  tags?: string[];
}

export interface ApproveRequestDto {
  comments?: string;
}

export interface RejectRequestDto {
  reason: string;
}

export interface DelegateApprovalDto {
  delegateToUserId: string;
  notes?: string;
}

export interface AssignServiceRequestDto {
  assignToUserId: string;
}

export interface FulfillServiceRequestDto {
  notes?: string;
  actualCost?: number;
}

export interface AddSRCommentDto {
  content: string;
  isInternal?: boolean;
}

export interface CancelServiceRequestDto {
  reason: string;
}

// ─── READ / Query Endpoints ───────────────────────────────────────────────────

export async function getServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestById(id: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestByNumber(requestNumber: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/number/${requestNumber}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getMyServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/my', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestsForMe(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/for-me', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getAssignedServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/assigned/me', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestsPendingApprovalForMe(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/pending-approval/me', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getOverdueServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/overdue', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestsByStatus(status: ServiceRequestStatus): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-status/${status}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestsByType(type: ServiceRequestType): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-type/${type}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestsByCategory(categoryId: string): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-category/${categoryId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestApprovalStatus(id: string): Promise<ApiResponse<ServiceRequestApprovalHistory[]>> {
  return apiRequest<ServiceRequestApprovalHistory[]>(`/api/service-requests/${id}/approval-status`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getApprovalStatus(id: string): Promise<ApiResponse<ApprovalStatusDto>> {
  return apiRequest<ApprovalStatusDto>(`/api/service-requests/${id}/approval-status`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestComments(id: string, includeInternal = false): Promise<ApiResponse<ServiceRequestComment[]>> {
  return apiRequest<ServiceRequestComment[]>(
    `/api/service-requests/${id}/comments${includeInternal ? '?includeInternal=true' : ''}`,
    { method: 'GET', includeAuth: true }
  );
}

export async function getServiceRequestStats(): Promise<ApiResponse<ServiceRequestStats>> {
  return apiRequest<ServiceRequestStats>('/api/service-requests/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getMyServiceRequestStats(): Promise<ApiResponse<ServiceRequestStats>> {
  return apiRequest<ServiceRequestStats>('/api/service-requests/stats/my', {
    method: 'GET',
    includeAuth: true,
  });
}

// ─── STAGE 1 — Create & Edit (Draft) ─────────────────────────────────────────

export async function createServiceRequest(data: CreateServiceRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>('/api/service-requests', {
    method: 'POST',
    body: data,
    includeAuth: true,
  });
}

export async function updateServiceRequest(id: string, data: UpdateServiceRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}`, {
    method: 'PUT',
    body: data,
    includeAuth: true,
  });
}

export async function deleteServiceRequest(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/service-requests/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

// ─── STAGE 2 — Submit for Approval ───────────────────────────────────────────

export async function submitServiceRequest(id: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/submit`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

// ─── STAGE 3 — Approval Decision ─────────────────────────────────────────────

export async function approveServiceRequest(id: string, data?: ApproveRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/approve`, {
    method: 'PATCH',
    body: data ?? {},
    includeAuth: true,
  });
}

export async function rejectServiceRequest(id: string, data: RejectRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/reject`, {
    method: 'PATCH',
    body: data,
    includeAuth: true,
  });
}

export async function delegateServiceRequestApproval(id: string, data: DelegateApprovalDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/delegate`, {
    method: 'PATCH',
    body: data,
    includeAuth: true,
  });
}

// ─── STAGE 4 — Assignment ─────────────────────────────────────────────────────

export async function assignServiceRequest(id: string, data: AssignServiceRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/assign`, {
    method: 'PATCH',
    body: data,
    includeAuth: true,
  });
}

// ─── STAGE 5 — Fulfillment ────────────────────────────────────────────────────

export async function startServiceRequest(id: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/start`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

export async function fulfillServiceRequest(id: string, data?: FulfillServiceRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/fulfill`, {
    method: 'PATCH',
    body: data,
    includeAuth: true,
  });
}

// ─── STAGE 6 — Close / Cancel ─────────────────────────────────────────────────

export async function closeServiceRequest(id: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/close`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

export async function cancelServiceRequest(id: string, data: CancelServiceRequestDto): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}/cancel`, {
    method: 'PATCH',
    body: data,
    includeAuth: true,
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addServiceRequestComment(id: string, data: AddSRCommentDto): Promise<ApiResponse<ServiceRequestComment>> {
  return apiRequest<ServiceRequestComment>(`/api/service-requests/${id}/comments`, {
    method: 'POST',
    body: data,
    includeAuth: true,
  });
}

// ─── Helper Display Functions ─────────────────────────────────────────────────

export function getSRStatusLabel(status: ServiceRequestStatus): string {
  switch (status) {
    case 'Draft': return 'Draft';
    case 'PendingApproval': return 'Pending Approval';
    case 'Approved': return 'Approved';
    case 'InProgress': return 'In Progress';
    case 'Fulfilled': return 'Fulfilled';
    case 'OnHold': return 'On Hold';
    case 'Closed': return 'Closed';
    case 'Rejected': return 'Rejected';
    case 'Cancelled': return 'Cancelled';
    default: return status;
  }
}

export function getSRStatusStyle(status: ServiceRequestStatus): string {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'PendingApproval': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'InProgress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Fulfilled': return 'bg-green-100 text-green-800 border-green-200';
    case 'OnHold': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Closed': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getSRPriorityStyle(priority: ServiceRequestPriority): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Normal': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Low': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function getSRTypeLabel(type: ServiceRequestType): string {
  switch (type) {
    case 'Access': return 'Access';
    case 'Equipment': return 'Equipment';
    case 'Software': return 'Software';
    case 'DataChange': return 'Data Change';
    case 'Workspace': return 'Workspace';
    case 'Account': return 'Account';
    case 'PermissionChange': return 'Permission Change';
    default: return type;
  }
}

export const SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
  'Draft', 'PendingApproval', 'Approved', 'InProgress',
  'Fulfilled', 'OnHold', 'Closed', 'Rejected', 'Cancelled',
];

export const SERVICE_REQUEST_TYPES: ServiceRequestType[] = [
  'Access', 'Equipment', 'Software', 'DataChange',
  'Workspace', 'Account', 'PermissionChange',
];

export const SERVICE_REQUEST_PRIORITIES: ServiceRequestPriority[] = [
  'Critical', 'High', 'Normal', 'Low',
];

// Status flow order for progress tracker
export const SR_STATUS_FLOW: ServiceRequestStatus[] = [
  'Draft', 'PendingApproval', 'Approved', 'InProgress', 'Fulfilled', 'Closed',
];
