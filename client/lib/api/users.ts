/**
 * Users API Service
 * Handles all user-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// User Role Enum (matches backend and auth.ts)
export enum UserRole {
  Admin = 0,
  Agent = 1,
  EndUser = 2,
}

// User Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: UserRole;
  department?: string;
}

export interface UpdateUserPasswordRequest {
  password: string;
}

/**
 * Get all users
 * @returns Array of all users
 */
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  return apiRequest<User[]>('/api/Users', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get a single user by ID
 * @param userId - The user ID
 * @returns Single user object
 */
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/api/Users/${userId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Create a new user
 * @param user - User creation data
 * @returns Created user object
 */
export async function createUser(user: CreateUserRequest): Promise<ApiResponse<User>> {
  return apiRequest<User>('/api/Users', {
    method: 'POST',
    body: user,
    includeAuth: true,
  });
}

/**
 * Update a user
 * @param userId - The user ID
 * @param updates - Fields to update
 * @returns Updated user object
 */
export async function updateUser(
  userId: string,
  updates: UpdateUserRequest
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/api/Users/${userId}`, {
    method: 'PUT',
    body: updates,
    includeAuth: true,
  });
}

/**
 * Update user password
 * @param userId - The user ID
 * @param password - New password
 * @returns Success response
 */
export async function updateUserPassword(
  userId: string,
  password: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Users/${userId}/password`, {
    method: 'PATCH',
    body: { password },
    includeAuth: true,
  });
}

/**
 * Activate a user
 * @param userId - The user ID
 * @returns Success response
 */
export async function activateUser(userId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Users/${userId}/activate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Deactivate a user
 * @param userId - The user ID
 * @returns Success response
 */
export async function deactivateUser(userId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Users/${userId}/deactivate`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Delete a user
 * @param userId - The user ID
 * @returns Success response
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Users/${userId}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

// Helper functions

/**
 * Convert role enum to readable string
 */
export function getRoleString(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return 'admin';
    case UserRole.Agent:
      return 'agent';
    case UserRole.EndUser:
      return 'end_user';
    default:
      return 'unknown';
  }
}

/**
 * Convert role string to enum
 */
export function parseRoleString(roleStr: string): UserRole {
  switch (roleStr.toLowerCase()) {
    case 'admin':
    case 'superadmin':
      return UserRole.Admin;
    case 'agent':
      return UserRole.Agent;
    case 'end_user':
    case 'enduser':
      return UserRole.EndUser;
    default:
      return UserRole.EndUser;
  }
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return 'bg-purple-100 text-purple-800';
    case UserRole.Agent:
      return 'bg-blue-100 text-blue-800';
    case UserRole.EndUser:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
