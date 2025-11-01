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
}

// Ticket Priority Enum (matches backend)
export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

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
  status: TicketStatus;
  priority: TicketPriority;
  categoryId?: string;
  assignedToId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  emailMessageId?: string;
  emailSender?: string;
  emailRecipients?: string[];
  emailReceivedAt?: string;
  aiAssignmentReason?: string;
  aiConfidenceScore?: number;
  comments?: TicketComment[];
  tags?: string[];
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  createdById: string;
  priority: TicketPriority;
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

// Helper functions to convert between frontend and backend formats

/**
 * Convert status enum to readable string
 */
export function getStatusString(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.Open:
      return 'open';
    case TicketStatus.InProgress:
      return 'in-progress';
    case TicketStatus.Resolved:
      return 'resolved';
    case TicketStatus.Closed:
      return 'closed';
    default:
      return 'unknown';
  }
}

/**
 * Convert priority enum to readable string
 */
export function getPriorityString(priority: TicketPriority): string {
  switch (priority) {
    case TicketPriority.Low:
      return 'low';
    case TicketPriority.Medium:
      return 'medium';
    case TicketPriority.High:
      return 'high';
    case TicketPriority.Urgent:
      return 'urgent';
    default:
      return 'unknown';
  }
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case TicketPriority.Low:
      return 'text-gray-600';
    case TicketPriority.Medium:
      return 'text-yellow-600';
    case TicketPriority.High:
      return 'text-orange-600';
    case TicketPriority.Urgent:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.Open:
      return 'text-blue-600';
    case TicketStatus.InProgress:
      return 'text-yellow-600';
    case TicketStatus.Resolved:
      return 'text-green-600';
    case TicketStatus.Closed:
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}
