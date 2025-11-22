/**
 * Dashboard API Service
 * Handles all dashboard-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// Dashboard Stats Interfaces
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets?: number;
  resolvedTickets: number;
  closedTickets?: number;
  totalUsers: number;
  activeUsers?: number;
  totalCategories?: number;
  todayTickets?: number;
  avgResolutionTime?: number;
}

export interface TicketStatusCounts {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  onHold?: number;
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

// Personal stats for current user
export interface MyStats {
  createdTickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  assignedTickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

// Team stats for managers
export interface TeamStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  statusBreakdown: TicketStatusCounts;
}

// SLA stats for SystemAdmin
export interface SLAStats {
  assignedTickets: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    inProgress: number;
    onHold: number;
  };
  slaBreaching: number;
  slaNearBreach: number;
}

// My tickets dashboard for EndUser
export interface MyTicketsDashboard {
  statusCounts: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  recentTickets: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Health check response
export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface DetailedHealthStatus {
  status: string;
  timestamp?: string;
  mongodb?: {
    status: string;
    collections?: string[];
  };
  configuration?: {
    jwtConfigured: boolean;
    corsConfigured: boolean;
  };
}

/**
 * Get overall dashboard statistics
 * Available to: Admin, ITManager, TeamLead, ServiceDeskAgent, Technician, SecurityAdmin
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return apiRequest<DashboardStats>('/api/Dashboard/stats', {
    method: 'GET',
  });
}

/**
 * Get ticket counts grouped by status
 * Available to: Any Authenticated user
 */
export async function getTicketStatusCounts(): Promise<ApiResponse<TicketStatusCounts>> {
  return apiRequest<TicketStatusCounts>('/api/Dashboard/ticket-status-counts', {
    method: 'GET',
  });
}

/**
 * Get ticket counts grouped by category
 * Available to: Admin, ITManager, TeamLead, ServiceDeskAgent, Technician, SecurityAdmin
 */
export async function getCategoryTicketCounts(): Promise<ApiResponse<CategoryTicketCount[]>> {
  return apiRequest<CategoryTicketCount[]>('/api/Dashboard/category-ticket-counts', {
    method: 'GET',
  });
}

/**
 * Get personal statistics for the current user
 * Available to: Any Authenticated user
 */
export async function getMyStats(): Promise<ApiResponse<MyStats>> {
  return apiRequest<MyStats>('/api/Dashboard/my-stats', {
    method: 'GET',
  });
}

/**
 * Get team statistics
 * Available to: Admin, ITManager, TeamLead
 */
export async function getTeamStats(): Promise<ApiResponse<TeamStats>> {
  return apiRequest<TeamStats>('/api/Dashboard/team-stats', {
    method: 'GET',
  });
}

/**
 * Get SLA dashboard for SystemAdmin
 * Available to: SystemAdmin
 */
export async function getMySLA(): Promise<ApiResponse<SLAStats>> {
  return apiRequest<SLAStats>('/api/Dashboard/my-sla', {
    method: 'GET',
  });
}

/**
 * Get personal ticket overview for the current user
 * Available to: Any Authenticated user
 */
export async function getMyTicketsDashboard(): Promise<ApiResponse<MyTicketsDashboard>> {
  return apiRequest<MyTicketsDashboard>('/api/Dashboard/my-tickets', {
    method: 'GET',
  });
}

/**
 * Basic health check
 * Available to: Public
 */
export async function getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
  return apiRequest<HealthStatus>('/api/Health', {
    method: 'GET',
    includeAuth: false,
  });
}

/**
 * Check MongoDB connection status
 * Available to: Public
 */
export async function getMongoDBHealth(): Promise<ApiResponse<HealthStatus>> {
  return apiRequest<HealthStatus>('/api/Health/mongodb', {
    method: 'GET',
    includeAuth: false,
  });
}

/**
 * Comprehensive health check with all service statuses
 * Available to: Public
 */
export async function getDetailedHealth(): Promise<ApiResponse<DetailedHealthStatus>> {
  return apiRequest<DetailedHealthStatus>('/api/Health/detailed', {
    method: 'GET',
    includeAuth: false,
  });
}
