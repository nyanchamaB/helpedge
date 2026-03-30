/**
 * Categories API Service
 * Handles all category-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// Category Interface (full CategoryDto from backend)
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keywords?: string[];
  assignableRoles?: string[];
  assignableUserIds?: string[];
  supportTier?: 'L1' | 'L2';
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  keywords?: string[];
  assignableRoles?: string[];
  assignableUserIds?: string[];
  supportTier?: 'L1' | 'L2';
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CategoryMatchRequest {
  text: string;
}

/** Get all ticket categories (any authenticated user) */
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  return apiRequest<Category[]>('/api/Categories', {
    method: 'GET',
    includeAuth: true,
  });
}

/** Get only active ticket categories (any authenticated user) */
export async function getActiveCategories(): Promise<ApiResponse<Category[]>> {
  return apiRequest<Category[]>('/api/Categories/active', {
    method: 'GET',
    includeAuth: true,
  });
}

/** Get a single category by ID (any authenticated user) */
export async function getCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
  return apiRequest<Category>(`/api/Categories/${categoryId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/** Create a new category (Admin, ITManager) */
export async function createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
  const response = await apiRequest<Category>('/api/Categories', {
    method: 'POST',
    body: data,
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to create category');}

  return response;
}

/** Update an existing category (Admin, ITManager) */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest,
): Promise<ApiResponse<Category>> {
  const response = await apiRequest<Category>(`/api/Categories/${id}`, {
    method: 'PUT',
    body: data,
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to update category');}

  return response;
}

/** Delete a category permanently (Admin only) */
export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  const response = await apiRequest<void>(`/api/Categories/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to delete category');}

  return response;
}

/** Activate a deactivated category (Admin, ITManager) */
export async function activateCategory(id: string): Promise<ApiResponse<void>> {
  const response = await apiRequest<void>(`/api/Categories/${id}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to activate category');}

  return response;
}

/** Deactivate a category (Admin, ITManager) */
export async function deactivateCategory(id: string): Promise<ApiResponse<void>> {
  const response = await apiRequest<void>(`/api/Categories/${id}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to deactivate category');}

  return response;
}

/** Match free text to the best-fitting category (any authenticated user) */
export async function matchTextToCategory(text: string): Promise<ApiResponse<Category>> {
  const response = await apiRequest<Category>('/api/Categories/match', {
    method: 'POST',
    body: { text } as CategoryMatchRequest,
    includeAuth: true,
  });

  if (!response.success) {throw new Error(response.error ?? 'Failed to match category');}

  return response;
}
