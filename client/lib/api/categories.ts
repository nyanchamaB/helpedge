/**
 * Categories API Service
 * Handles all category-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// Category Interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all ticket categories
 * @returns Array of all categories
 */
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  return apiRequest<Category[]>('/api/Categories', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get a single category by ID
 * @param categoryId - The category ID
 * @returns Single category object
 */
export async function getCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
  return apiRequest<Category>(`/api/Categories/${categoryId}`, {
    method: 'GET',
    includeAuth: true,
  });
}
