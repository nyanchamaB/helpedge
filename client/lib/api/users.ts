/**
 * Users API Service
 * Handles all user-related API requests
 */

import { apiRequest, ApiResponse } from './client';
import { UserRole as UserRoleType } from './auth';

// User Role String Type (matches backend response)
export type UserRoleString =
  | 'Admin'
  | 'ITManager'
  | 'TeamLead'
  | 'SystemAdmin'
  | 'ServiceDeskAgent'
  | 'Technician'
  | 'SecurityAdmin'
  | 'EndUser';

// User Interface - matches GET /api/Users response
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRoleString;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  managerId?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  officeLocation?: string;
  isActive: boolean;
  lastLoginAt?: string;
  externalId?: string;
  externalSource?: string;
  avatarUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export type UserProfile = User;

// Helper to get user display name
export function getUserDisplayName(user: User): string {
  return user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.email;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRoleString;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  officeLocation?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRoleString;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  officeLocation?: string;
  timeZone?: string;
  preferredLanguage?: string;
}

export interface UpdateUserPasswordRequest {
  password: string;
}

/**
 * Get current authenticated user's profile
 * @returns Current user's full profile
 */
export async function getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/api/Users/me', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get all users
 * Admin and ITManager can see all users, TeamLead sees team members only.
 * Authorization: Admin, ITManager, TeamLead
 * @returns Array of users (filtered by role permissions)
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
 * Get role display string
 */
export function getRoleDisplayString(role: UserRoleString): string {
  switch (role) {
    case 'Admin': return 'Administrator';
    case 'ITManager': return 'IT Manager';
    case 'TeamLead': return 'Team Lead';
    case 'SystemAdmin': return 'System Administrator';
    case 'ServiceDeskAgent': return 'Service Desk Agent';
    case 'Technician': return 'Technician';
    case 'SecurityAdmin': return 'Security Administrator';
    case 'EndUser': return 'End User';
    default: return role;
  }
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRoleString): string {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ITManager':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'TeamLead':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SystemAdmin':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'ServiceDeskAgent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Technician':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'SecurityAdmin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'EndUser':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Check if user has management role
 */
export function isManagementRole(role: UserRoleString): boolean {
  return ['Admin', 'ITManager', 'TeamLead'].includes(role);
}

/**
 * Check if user has support role (can handle tickets)
 */
export function isSupportRole(role: UserRoleString): boolean {
  return ['ServiceDeskAgent', 'Technician', 'SecurityAdmin', 'SystemAdmin'].includes(role);
}

/**
 * Check if user can view all users
 */
export function canViewAllUsers(role: UserRoleString): boolean {
  return ['Admin', 'ITManager', 'TeamLead'].includes(role);
}

// ============================================
// User Preferences
// ============================================

/**
 * Get current user's AI preferences
 */
export async function getUserAIPreferences(): Promise<
  ApiResponse<import('@/lib/types/ai').AIUserPreferences>
> {
  return apiRequest<import('@/lib/types/ai').AIUserPreferences>(
    '/api/Users/me/preferences/ai',
    {
      method: 'GET',
      includeAuth: true,
    }
  );
}

/**
 * Update current user's AI preferences
 */
export async function updateUserAIPreferences(
  preferences: import('@/lib/types/ai').AIUserPreferences
): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/Users/me/preferences/ai', {
    method: 'PUT',
    body: preferences,
    includeAuth: true,
  });
}
