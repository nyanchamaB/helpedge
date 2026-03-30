import { apiRequest, ApiResponse } from './client';
import { ServiceRequestType } from './service-request';

export type SupportTier = 'L1' | 'L2';

export type FieldType =
  | 'Text'
  | 'TextArea'
  | 'Number'
  | 'Date'
  | 'DateTime'
  | 'Select'
  | 'MultiSelect'
  | 'Checkbox'
  | 'File'
  | 'User'
  | 'Department'
  | 'Application';

export interface FormFieldDto {
  name: string;
  label: string;
  type: FieldType;
  isRequired: boolean;
  options?: string[];
  defaultValue?: string;
  validationRegex?: string;
  helpText?: string;
  order: number;
}

export interface ServiceRequestCategory {
  id: string;
  name: string;
  description: string;
  requestType: ServiceRequestType;
  color: string;
  icon: string;
  isActive: boolean;
  requiresApproval: boolean;
  defaultWorkflowId?: string | null;
  fulfillmentRoles: string[];
  estimatedFulfillmentDays: number;
  requiredFields: FormFieldDto[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

// Create: includes requestType; no isActive (use activate endpoint)
export interface CreateServiceRequestCategoryDto {
  name: string;
  requestType: ServiceRequestType;
  description: string;
  color?: string;
  icon?: string;
  requiresApproval: boolean;
  defaultWorkflowId?: string;
  fulfillmentRoles?: string[];
  estimatedFulfillmentDays: number;
  requiredFields?: FormFieldDto[];
  keywords?: string[];
}

// Update: no requestType (immutable after create); no isActive (use activate endpoint)
export interface UpdateServiceRequestCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  requiresApproval?: boolean;
  defaultWorkflowId?: string;
  fulfillmentRoles?: string[];
  estimatedFulfillmentDays?: number;
  requiredFields?: FormFieldDto[];
  keywords?: string[];
}

export async function getServiceRequestsCategories(): Promise<
  ApiResponse<ServiceRequestCategory[]>
> {
  return apiRequest<ServiceRequestCategory[]>('/api/service-request-categories', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getActiveServiceRequestCategories(): Promise<
  ApiResponse<ServiceRequestCategory[]>
> {
  return apiRequest<ServiceRequestCategory[]>('/api/service-request-categories/active', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getServiceRequestCategoryById(
  id: string,
): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getCategoriesByType(
  type: ServiceRequestType,
): Promise<ApiResponse<ServiceRequestCategory[]>> {
  return apiRequest<ServiceRequestCategory[]>(`/api/service-request-categories/by-type/${type}`, {
    method: 'GET',
    includeAuth: true,
  });
}

export async function createServiceRequestCategory(
  data: CreateServiceRequestCategoryDto,
): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>('/api/service-request-categories', {
    method: 'POST',
    body: data,
    includeAuth: true,
  });
}

export async function updateServiceRequestCategory(
  id: string,
  data: UpdateServiceRequestCategoryDto,
): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}`, {
    method: 'PUT',
    body: data,
    includeAuth: true,
  });
}

export async function deleteServiceRequestCategory(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/service-request-categories/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

export async function activateServiceRequestCategory(
  id: string,
): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

export async function deactivateServiceRequestCategory(
  id: string,
): Promise<ApiResponse<ServiceRequestCategory>> {
  return apiRequest<ServiceRequestCategory>(`/api/service-request-categories/${id}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}
