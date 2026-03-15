import { apiRequest, ApiResponse } from './client';

export type SupportTier = 'L1' | 'L2';

export interface ServiceRequestCategory {
  id: string;
  name: string;
  description: string;
  requestType: 'Access';
  color: string;
  icon: string;
  isActive: boolean;
  requiresApproval: boolean;
  defaultWorkflowId?: string;
  fulfillmentRoles: string[];
  estimatedFulfillmentDays: number;
  requiredFields: {
    name: string;
    label: string;
    type: 'Text' | 'Dropdown' | 'Number' | 'Date';
    isRequired: boolean;
    options?: string[];
    defaultValue?: string;
    validationRegex?: string;
    helpText?: string;
    order: number;
  }[];  
  keywords: string[];
  supportTier?: SupportTier;
  createdAt: string;
  updatedAt: string;
}

export async function getServiceRequestsCategories(): Promise<ApiResponse<ServiceRequestCategory[]>> {
  return apiRequest<ServiceRequestCategory[]>('/api/service-request-categories', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestCategoryById(id: string): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function createServiceRequestCategory(data: Partial<ServiceRequestCategory>): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>('/api/service-request-categories', {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify(data),
  });
}

export async function updateServiceRequestCategory(id: string, data: Partial<ServiceRequestCategory>): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}`, {
    method: 'PUT',
    includeAuth: true,
    body: JSON.stringify(data),
  });
}

export const deleteServiceRequestCategory = async (id: string): Promise<ApiResponse<null>> => apiRequest(`/api/service-request-categories/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });

export const activateServiceRequestCategory = async (id: string): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest(`/api/service-request-categories/${id}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });
  //deactivate
  export const deactivateServiceRequestCategory = async (id: string): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest(`/api/service-request-categories/${id}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });

  //by type
  export const getServiceRequestsCategoriesByType = async (type: string): Promise<ApiResponse<ServiceRequestCategory[]>> => apiRequest(`/api/service-request-categories/by-type/${type}`, {
    method: 'GET',
    includeAuth: true,
  });
//get active categories
export const getActiveServiceRequestCategories = async (): Promise<ApiResponse<ServiceRequestCategory[]>> => apiRequest('/api/service-request-categories/active', {
    method: 'GET',
    includeAuth: true,
  });

//toggle active status
export const toggleServiceRequestCategory = async (id: string,isActive: boolean): Promise<ApiResponse<ServiceRequestCategory>> => {
  if (isActive) {
    return deactivateServiceRequestCategory(id);
  } else {
    return activateServiceRequestCategory(id);
  }
};

