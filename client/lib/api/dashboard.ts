/**
 * Dashboard API Service
 * Handles all dashboard-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// Dashboard Stats Interfaces
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets?: number; // Backend uses this field
  resolvedTickets: number;
  closedTickets?: number;
  totalUsers: number;
  activeUsers?: number;
  totalCategories?: number;
  todayTickets?: number; // Backend includes this
  avgResolutionTime?: number;
}

export interface TicketStatusCounts {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

// Backend response format (actual from API)
export interface BackendStatusCounts {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets?: number;
}

export interface CategoryTicketCount {
  categoryId: string;
  categoryName: string;
  ticketCount: number;
}

/**
 * Get overall dashboard statistics
 * @returns Dashboard stats including ticket counts, user counts, etc.
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return apiRequest<DashboardStats>('/api/Dashboard/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get ticket counts grouped by status
 * @returns Counts of tickets in each status
 */
export async function getTicketStatusCounts(): Promise<ApiResponse<TicketStatusCounts>> {
  return apiRequest<TicketStatusCounts>('/api/Dashboard/ticket-status-counts', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get ticket counts grouped by category
 * @returns Array of categories with their ticket counts
 */
export async function getCategoryTicketCounts(): Promise<ApiResponse<CategoryTicketCount[]>> {
  return apiRequest<CategoryTicketCount[]>('/api/Dashboard/category-ticket-counts', {
    method: 'GET',
    includeAuth: true,
  });
}
