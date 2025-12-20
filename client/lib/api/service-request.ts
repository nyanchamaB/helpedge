import { apiRequest, ApiResponse } from "./client";
export interface ServiceRequest {
  id: string;
  requestNumber: string;
  subject: string;
  status: 'Draft' | 'Pending' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requestType: string;
  categoryName: string;
  description: string;
  requesterName: string;
  assignedToName: string;
  submittedAt: string;
  createdAt: string;
  requiredByDate: string;
}

interface ServiceRequestCreateData {   //this is incomplete data for creating a service request
    subject: ServiceRequest['subject'];
    description: ServiceRequest['description'];
    requestType: ServiceRequest['requestType'];
    categoryId: string;
    justification?: string;
    priority?: ServiceRequest['priority'];
    requiredByDate?: string;
    onBehalfOfId?: string;
    onBehalfOfName: string;
    requestDetails?: {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
    }[];
    estimtedCost?: number;
    tags?: string[];
}

// Fetch all service requests
export async function getServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests', {
    method: 'GET',
    includeAuth: true,
  });
}
// Fetch a single service request by ID
export async function getServiceRequestById(id: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/${id}`, {
    method: 'GET',
    includeAuth: true,
  });
}
//fetch service requests created by the logged in user
export async function getMyServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/my', {
    method: 'GET',
    includeAuth: true,
    });
}

// fetch service requests where the current user is either the requester or on behalf of the beneficiary
export async function getServiceRequestsForUser(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/for-me', {
    method: 'GET',
    includeAuth: true,
  });
}

// fetch service requests assigned to the current user
export async function getAssignedServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/assigned/me', {
    method: 'GET',
    includeAuth: true,
  });
}
// fetch service requests  of pending approval by the current user
export async function getServiceRequestsPendingApproval(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/pending-approval/me', {
    method: 'GET',
    includeAuth: true,
  });
}
// fetch service requests that have exceeded their required by date
export async function getOverdueServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>('/api/service-requests/overdue', {
    method: 'GET',
    includeAuth: true,
  });
}
// fetch service requests that have exceeded their SLA targets
export async function getSLAExceededServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
return apiRequest<ServiceRequest[]>('/api/service-requests/overdue', {
    method: 'GET',
    includeAuth: true,
  });
}
// fetch service request by status
export async function getServiceRequestsByStatus(status: string): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-status/${status}`, {
    method: 'GET',
    includeAuth: true,
  });
}
//fetch service requests by category
export async function getServiceRequestsByCategory(categoryId: string): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-category/${categoryId}`, {
    method: 'GET',
    includeAuth: true,
    });
}
// fetch service requests by request number
export async function getServiceRequestByNumber(requestNumber: string): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>(`/api/service-requests/number/${requestNumber}`, {
    method: 'GET',
    includeAuth: true,
    });
}
// fetch a service request's status 
export async function getServiceRequestStatusHistory(id: string): Promise<ApiResponse<{ status: string; changedAt: string; changedBy: string; }[]>> {
  return apiRequest<{ status: string; changedAt: string; changedBy: string; }[]>(`/api/service-requests/${id}/approval-status`, {
    method: 'GET',
    includeAuth: true,
  });
}

{/*
//fetch service requests comments
export async function getServiceRequestComments(requestId: string): Promise<ApiResponse<ServiceRequestComment[]>> {
    return apiRequest<ServiceRequestComment[]>(`/api/service-requests/${requestId}/comments`, {
    method: 'GET',
    includeAuth: true,
  });
}
//fetch service requests stats
export async function getServiceRequestsStats(): Promise<ApiResponse<ServiceRequestStats>> {
  return apiRequest<ServiceRequestStats>('/api/service-requests/stats', {
    method: 'GET',
    includeAuth: true,
  });
}
//fetch service requests my stats
export async function getMyServiceRequestsStats(): Promise<ApiResponse<ServiceRequestStats>> {
  return apiRequest<ServiceRequestStats>('/api/service-requests/my/stats', {
    method: 'GET',
    includeAuth: true,
  });
}
*/}
//fetch service requests by type
export async function getServiceRequestsByType(type: string): Promise<ApiResponse<ServiceRequest[]>> {
  return apiRequest<ServiceRequest[]>(`/api/service-requests/by-type/${type}`, {
    method: 'GET',
    includeAuth: true,
  });
}

// Create a new service request
export async function createServiceRequest(data: ServiceRequestCreateData): Promise<ApiResponse<ServiceRequest>> {
  return apiRequest<ServiceRequest>('/api/service-requests', {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify(data),
  });
}

