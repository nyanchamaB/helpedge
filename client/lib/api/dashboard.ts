/**
 * Dashboard API Service
 * Handles all dashboard-related API requests
 *
 * NOTE: Interface shapes verified against backend responses 2026-03-27.
 * Fields marked TODO(backend) require backend additions before they populate.
 */

import { apiRequest, ApiResponse } from './client';

// ─── Org-wide stats ───────────────────────────────────────────────────────────
// GET /api/Dashboard/stats
// Roles: Admin, ITManager, TeamLead, ServiceDeskAgent, Technician, SecurityAdmin
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  todayTickets: number;
}

// ─── Status counts ────────────────────────────────────────────────────────────
// GET /api/Dashboard/ticket-status-counts
// Backend returns: Array<{ status: string; count: number }>
// Normalized to named-field object for ease of use in UI.
export interface TicketStatusCounts {
  open: number;
  inProgress: number;
  onHold: number;
  awaitingInfo: number;
  resolved: number;
  closed: number;
}

// ─── Category counts ──────────────────────────────────────────────────────────
// GET /api/Dashboard/category-ticket-counts
// Note: categoryName is NOT returned — only categoryId.
// Join with getActiveCategories() to get names.
export interface CategoryTicketCount {
  categoryId: string;
  count: number;
}

// ─── Personal stats ───────────────────────────────────────────────────────────
// GET /api/Dashboard/my-stats
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
    onHold: number; // backend has onHold, not closed
    resolved: number;
  };
}

// ─── Team stats ───────────────────────────────────────────────────────────────
// GET /api/Dashboard/team-stats
// statusBreakdown is same array format as ticket-status-counts
export interface TeamStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  todayTickets: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

// ─── SLA stats ────────────────────────────────────────────────────────────────
// GET /api/Dashboard/my-sla
// Roles: Admin, ITManager, TeamLead, ServiceDeskAgent, Technician, SystemAdmin
export interface SLAStats {
  totalAssigned: number; // was "assignedTickets" in old interface — fixed
  openCount: number;
  resolvedTotal: number;
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
  avgTtaMinutes: number | null;
  avgTtrMinutes: number | null;
  unacknowledgedCount: number;
  slaBreaching: number;
  slaNearBreach: number;
}

// ─── Resolver KPIs ────────────────────────────────────────────────────────────
// GET /api/Dashboard/resolver-kpis
// Roles: Admin, ITManager, TeamLead
// Sorted by unacknowledgedCount desc.
export interface ResolverKpis {
  resolverId: string;
  resolverName: string;
  totalAssigned: number;
  inProgressCount: number;
  resolvedCount: number;
  unacknowledgedCount: number;
  avgTtaMinutes: number | null;
  avgTtrMinutes: number | null;
  slaBreaching: number;
}

// ─── My tickets (EndUser dashboard) ──────────────────────────────────────────
// GET /api/Dashboard/my-tickets
// Note: AwaitingInfo and OnHold tickets exist but are not counted in named fields.
export interface MyTicketsDashboard {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
}

// ─── Health ───────────────────────────────────────────────────────────────────
export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface DetailedHealthStatus {
  service?: string;
  timestamp?: string;
  version?: string;
  environment?: string;
  checks?: {
    mongodb?: {
      status: string;
      collections?: string[];
    };
    configuration?: {
      jwtConfigured: boolean;
      corsConfigured: boolean;
    };
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return apiRequest<DashboardStats>('/api/Dashboard/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Backend returns Array<{ status: string; count: number }>.
 * Normalized to a named-field object here so UI code stays readable.
 */
export async function getTicketStatusCounts(): Promise<ApiResponse<TicketStatusCounts>> {
  const res = await apiRequest<Array<{ status: string; count: number }>>(
    '/api/Dashboard/ticket-status-counts',
    { method: 'GET', includeAuth: true },
  );

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error,
      status: res.status,
    } as ApiResponse<TicketStatusCounts>;
  }
  const counts: TicketStatusCounts = {
    open: 0,
    inProgress: 0,
    onHold: 0,
    awaitingInfo: 0,
    resolved: 0,
    closed: 0,
  };

  for (const item of res.data) {
    switch (item.status) {
      case 'Open':
        counts.open = item.count;
        break;
      case 'InProgress':
        counts.inProgress = item.count;
        break;
      case 'OnHold':
        counts.onHold = item.count;
        break;
      case 'AwaitingInfo':
        counts.awaitingInfo = item.count;
        break;
      case 'Resolved':
        counts.resolved = item.count;
        break;
      case 'Closed':
        counts.closed = item.count;
        break;
    }
  }

  return { success: true, data: counts, status: res.status };
}

/**
 * Returns category IDs and counts only — no names.
 * Join with getActiveCategories() from lib/api/categories.ts to get display names.
 */
export async function getCategoryTicketCounts(): Promise<ApiResponse<CategoryTicketCount[]>> {
  return apiRequest<CategoryTicketCount[]>('/api/Dashboard/category-ticket-counts', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getMyStats(): Promise<ApiResponse<MyStats>> {
  return apiRequest<MyStats>('/api/Dashboard/my-stats', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getTeamStats(): Promise<ApiResponse<TeamStats>> {
  return apiRequest<TeamStats>('/api/Dashboard/team-stats', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getMySLA(): Promise<ApiResponse<SLAStats>> {
  return apiRequest<SLAStats>('/api/Dashboard/my-sla', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getMyTicketsDashboard(): Promise<ApiResponse<MyTicketsDashboard>> {
  return apiRequest<MyTicketsDashboard>('/api/Dashboard/my-tickets', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getResolverKpis(): Promise<ApiResponse<ResolverKpis[]>> {
  return apiRequest<ResolverKpis[]>('/api/Dashboard/resolver-kpis', {
    method: 'GET',
    includeAuth: true,
  });
}

export async function getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
  return apiRequest<HealthStatus>('/api/Health', {
    method: 'GET',
    includeAuth: false,
  });
}

export async function getMongoDBHealth(): Promise<ApiResponse<HealthStatus>> {
  return apiRequest<HealthStatus>('/api/Health/mongodb', {
    method: 'GET',
    includeAuth: false,
  });
}

export async function getDetailedHealth(): Promise<ApiResponse<DetailedHealthStatus>> {
  return apiRequest<DetailedHealthStatus>('/api/Health/detailed', {
    method: 'GET',
    includeAuth: false,
  });
}
