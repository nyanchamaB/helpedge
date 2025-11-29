import { apiRequest, ApiResponse } from './client';

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
  createdAt: string;
  updatedAt: string;
}

export const getServiceRequestsCategories = async (): Promise<ApiResponse<ServiceRequestCategory[]>> => apiRequest('/api/service-requests-categories', {
    method: 'GET',
    includeAuth: true,
  });

export const createServiceRequestCategory = async (data: Partial<ServiceRequestCategory>): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest('/api/service-requests-categories', {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify(data),
  });

export const getServiceRequestCategoryById = async (id: string): Promise<ServiceRequestCategory> => {
  const response = await apiRequest(`/api/service-requests-categories/${id}`, {
    method: 'GET',
    includeAuth: true,
  });
  return response.data;
};

export const updateServiceRequestCategory = async (id: string, data: Partial<ServiceRequestCategory>): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest(`/api/service-requests-categories/${id}`, {
    method: 'PUT',
    includeAuth: true,
    body: JSON.stringify(data),
  });

export const deleteServiceRequestCategory = async (id: string): Promise<ApiResponse<null>> => apiRequest(`/api/service-requests-categories/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });

export const activateServiceRequestCategory = async (id: string): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest(`/api/service-requests-categories/${id}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });
  //deactivate
  export const deactivateServiceRequestCategory = async (id: string): Promise<ApiResponse<ServiceRequestCategory>> => apiRequest(`/api/service-requests-categories/${id}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });

  //by type
  export const getServiceRequestsCategoriesByType = async (type: string): Promise<ApiResponse<ServiceRequestCategory[]>> => apiRequest(`/api/service-requests-categories/by-type/${type}`, {
    method: 'GET',
    includeAuth: true,
  });
//get active categories
export const getActiveServiceRequestCategories = async (): Promise<ApiResponse<ServiceRequestCategory[]>> => apiRequest('/api/service-requests-categories/active', {
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
