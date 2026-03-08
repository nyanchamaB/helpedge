/**
 * Tickets API Service
 * Handles all ticket-related API requests
 */

import { apiRequest, ApiResponse } from './client';

// Ticket Status Enum (matches backend)
export enum TicketStatus {
  Open = 0,
  InProgress = 1,
  Resolved = 2,
  Closed = 3,
  OnHold = 4,
}

// Ticket Priority Enum (matches backend)
export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// Triage Status Enum (matches backend)
export enum TriageStatus {
  Pending = 0,            // Not yet triaged - awaiting Team Lead review
  Confirmed = 1,          // AI suggestions confirmed by Team Lead
  Modified = 2,           // AI suggestions modified by Team Lead
  Skipped = 3,            // Triage skipped (manual assignment)
  AutoAssigned = 4,       // AI auto-assigned with high confidence (no human review needed)
  AssignedWithReview = 5, // AI assigned but flagged for human review
}

// String literal types matching backend responses
export type TicketStatusString = 'Open' | 'InProgress' | 'Resolved' | 'Closed' | 'OnHold';
export type TicketPriorityString = 'Low' | 'Medium' | 'High' | 'Critical';
export type TriageStatusString = 'Pending' | 'Confirmed' | 'Modified' | 'Skipped' | 'AutoAssigned' | 'AssignedWithReview';

// Ticket Interfaces
export interface TicketComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  isInternal: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatusString;
  priority: TicketPriorityString;
  categoryId?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  emailMessageId?: string | null;
  emailSender?: string | null;
  emailRecipients?: string[];
  emailReceivedAt?: string | null;
  aiAssignmentReason?: string | null;
  aiConfidenceScore?: number | null;
  aiSuggestedCategoryId?: string | null;
  aiSuggestedAssigneeId?: string | null;
  aiSuggestedPriority?: TicketPriorityString | null;
  aiCategoryConfidence?: number | null;
  aiAssigneeConfidence?: number | null;
  aiPriorityConfidence?: number | null;
  triageStatus?: TriageStatusString;
  triagedById?: string | null;
  triagedAt?: string | null;
  categoryLocked?: boolean;
  isEscalated?: boolean;
  comments?: TicketComment[];
  tags?: string[];
}

export interface EscalateTicketRequest {
  reason: string;
  targetUserId?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  createdById: string;
  priority: TicketPriority;
  categoryId?: string;
}

export interface CreateTicketFromEmailRequest {
  subject: string;
  description: string;
  createdById: string;
  emailMessageId: string;
  emailSender: string;
  emailRecipients: string[];
  priority?: TicketPriority;
  categoryId?: string;
}

export interface UpdateTicketPriorityRequest {
  priority: TicketPriority;
}

export interface AddCommentRequest {
  content: string;
  authorId: string;
  isInternal: boolean;
}

// Triage modification request
export interface TriageModifyRequest {
  categoryId?: string;
  assigneeId?: string;
  priority?: TicketPriorityString;
}

/**
 * Get all tickets
 * @returns Array of all tickets
 */
export async function getAllTickets(): Promise<ApiResponse<Ticket[]>> {
  return apiRequest<Ticket[]>('/api/Tickets', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get a single ticket by ID
 * @param ticketId - The ticket ID
 * @returns Single ticket object
 */
export async function getTicketById(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get ticket by ticket number
 * @param ticketNumber - The ticket number (e.g., "TKT-001")
 * @returns Single ticket object
 */
export async function getTicketByNumber(ticketNumber: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/number/${ticketNumber}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get tickets assigned to a specific user
 * @param assigneeId - The user ID
 * @returns Array of tickets assigned to the user
 */
export async function getTicketsByAssignee(assigneeId: string): Promise<ApiResponse<Ticket[]>> {
  return apiRequest<Ticket[]>(`/api/Tickets/assigned/${assigneeId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get tickets created by a specific user
 * @param creatorId - The user ID
 * @returns Array of tickets created by the user
 */
export async function getTicketsByCreator(creatorId: string): Promise<ApiResponse<Ticket[]>> {
  return apiRequest<Ticket[]>(`/api/Tickets/created/${creatorId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Create a new ticket
 * @param ticket - Ticket creation data
 * @returns Created ticket object
 */
export async function createTicket(ticket: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>('/api/Tickets', {
    method: 'POST',
    body: ticket,
    includeAuth: true,
  });
}

/**
 * Create a new ticket from email
 * Used for manual email-to-ticket creation. AI analysis is automatically applied.
 * Authorization: Admin, ITManager, ServiceDeskAgent
 * @param emailTicket - Email ticket creation data
 * @returns Created ticket object with AI suggestions
 */
export async function createTicketFromEmail(
  emailTicket: CreateTicketFromEmailRequest
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>('/api/Tickets/from-email', {
    method: 'POST',
    body: emailTicket,
    includeAuth: true,
  });
}

/**
 * Assign a ticket to a user
 * @param ticketId - The ticket ID
 * @param assigneeId - The user ID to assign to
 * @returns Updated ticket
 */
export async function assignTicket(
  ticketId: string,
  assigneeId: string
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/assign/${assigneeId}`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Unassign a ticket
 * @param ticketId - The ticket ID
 * @returns Updated ticket
 */
export async function unassignTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/unassign`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Acknowledge a ticket assignment
 * Changes ticket status to InProgress
 * Only the assigned user can acknowledge
 * @param ticketId - The ticket ID
 * @returns Updated ticket
 */
export async function acknowledgeTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/acknowledge`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Update ticket priority
 * @param ticketId - The ticket ID
 * @param priority - New priority level
 * @returns Updated ticket
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: { priority },
    includeAuth: true,
  });
}

/**
 * Mark ticket as resolved
 * @param ticketId - The ticket ID
 * @returns Updated ticket
 */
export async function resolveTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/resolve`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Mark ticket as closed
 * @param ticketId - The ticket ID
 * @returns Updated ticket
 */
export async function closeTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/close`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Reopen a closed ticket
 * @param ticketId - The ticket ID
 * @returns Updated ticket
 */
export async function reopenTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/reopen`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Add a comment to a ticket
 * @param ticketId - The ticket ID
 * @param comment - Comment data
 * @returns Updated ticket with new comment
 */
export async function addTicketComment(
  ticketId: string,
  comment: AddCommentRequest
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/comments`, {
    method: 'POST',
    body: comment,
    includeAuth: true,
  });
}

/**
 * Delete a ticket
 * @param ticketId - The ticket ID
 * @returns Success response
 */
export async function deleteTicket(ticketId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Tickets/${ticketId}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

/**
 * Get tickets pending triage
 * Retrieves tickets that require human review of AI suggestions before assignment
 * Authorization: Admin, ITManager, TeamLead, ServiceDeskAgent
 * @returns Array of tickets pending triage
 */
export async function getTicketsPendingTriage(): Promise<ApiResponse<Ticket[]>> {
  return apiRequest<Ticket[]>('/api/Tickets/pending-triage', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Confirm AI suggestions during triage
 * Confirms and applies the AI-suggested category, priority, and assignee for the ticket
 * This is a 1-click confirmation of AI recommendations
 * Authorization: Admin, ITManager, TeamLead, ServiceDeskAgent
 * @param ticketId - The ticket ID
 * @returns Updated ticket with confirmed AI suggestions
 */
export async function confirmTriageSuggestions(ticketId: string): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/triage/confirm`, {
    method: 'PATCH',
    includeAuth: true,
  });
}

/**
 * Modify AI suggestions during triage
 * Overrides the AI-suggested category, priority, or assignee with different values
 * Use this when AI suggestions need to be corrected
 * Authorization: Admin, ITManager, TeamLead, ServiceDeskAgent
 * @param ticketId - The ticket ID
 * @param modifications - The modified values to apply
 * @returns Updated ticket with modified suggestions
 */
export async function modifyTriageSuggestions(
  ticketId: string,
  modifications: TriageModifyRequest
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/triage/modify`, {
    method: 'PATCH',
    body: modifications,
    includeAuth: true,
  });
}

/**
 * Escalate a ticket
 * @param ticketId - The ticket ID
 * @param body - Escalation reason and optional target user
 * @returns Updated ticket
 */
export async function escalateTicket(
  ticketId: string,
  body: EscalateTicketRequest
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(`/api/Tickets/${ticketId}/escalate`, {
    method: 'PATCH',
    body,
    includeAuth: true,
  });
}

// Helper functions to convert between frontend and backend formats

/**
 * Convert status to readable display string
 */
export function getStatusString(status: TicketStatusString | TicketStatus): string {
  // Handle string values from API
  if (typeof status === 'string') {
    switch (status) {
      case 'Open': return 'Open';
      case 'InProgress': return 'In Progress';
      case 'Resolved': return 'Resolved';
      case 'Closed': return 'Closed';
      case 'OnHold': return 'On Hold';
      default: return status;
    }
  }
  // Handle numeric enum values
  switch (status) {
    case TicketStatus.Open: return 'Open';
    case TicketStatus.InProgress: return 'In Progress';
    case TicketStatus.Resolved: return 'Resolved';
    case TicketStatus.Closed: return 'Closed';
    case TicketStatus.OnHold: return 'On Hold';
    default: return 'Unknown';
  }
}

/**
 * Convert priority to readable display string
 */
export function getPriorityString(priority: TicketPriorityString | TicketPriority): string {
  // Handle string values from API
  if (typeof priority === 'string') {
    return priority; // Already readable
  }
  // Handle numeric enum values
  switch (priority) {
    case TicketPriority.Low: return 'Low';
    case TicketPriority.Medium: return 'Medium';
    case TicketPriority.High: return 'High';
    case TicketPriority.Critical: return 'Critical';
    default: return 'Unknown';
  }
}

/**
 * Convert triage status to readable display string
 */
export function getTriageStatusString(triageStatus: TriageStatusString | TriageStatus): string {
  // Handle string values from API
  if (typeof triageStatus === 'string') {
    return triageStatus; // Already readable
  }
  // Handle numeric enum values
  switch (triageStatus) {
    case TriageStatus.Pending: return 'Pending';
    case TriageStatus.Confirmed: return 'Confirmed';
    case TriageStatus.Modified: return 'Modified';
    case TriageStatus.Skipped: return 'Skipped';
    case TriageStatus.AutoAssigned: return 'Auto Assigned';
    case TriageStatus.AssignedWithReview: return 'Assigned With Review';
    default: return 'Unknown';
  }
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: TicketPriorityString | TicketPriority): string {
  const priorityStr = typeof priority === 'string' ? priority : getPriorityString(priority);
  switch (priorityStr) {
    case 'Low': return 'text-gray-600';
    case 'Medium': return 'text-blue-600';
    case 'High': return 'text-orange-600';
    case 'Critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: TicketStatusString | TicketStatus): string {
  const statusStr = typeof status === 'string' ? status : getStatusString(status);
  switch (statusStr) {
    case 'Open': return 'text-blue-600';
    case 'In Progress': return 'text-yellow-600';
    case 'Resolved': return 'text-green-600';
    case 'Closed': return 'text-gray-600';
    case 'On Hold': return 'text-purple-600';
    default: return 'text-gray-600';
  }
}

/**
 * Get triage status color for UI
 */
export function getTriageStatusColor(triageStatus: TriageStatusString | TriageStatus): string {
  const triageStr = typeof triageStatus === 'string' ? triageStatus : getTriageStatusString(triageStatus);
  switch (triageStr) {
    case 'Pending': return 'text-yellow-600';
    case 'Confirmed': return 'text-green-600';
    case 'Modified': return 'text-blue-600';
    case 'Skipped': return 'text-gray-600';
    case 'Auto Assigned': return 'text-green-600';
    case 'AutoAssigned': return 'text-green-600';
    case 'Assigned With Review': return 'text-amber-600';
    case 'AssignedWithReview': return 'text-amber-600';
    default: return 'text-gray-600';
  }
}
