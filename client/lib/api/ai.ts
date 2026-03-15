/**
 * API Client for AI Classification and Explainability Endpoints
 * Handles all AI-related API calls for the HelpEdge application
 */

import { apiRequest } from './client';
import type {
  TicketAIDetails,
  AIPerformanceMetrics,
  CategoryPerformance,
  ConfusionMatrix,
  AIPerformanceLog,
  OverrideRequest,
  OverrideRecord,
  ReviewQueueTicket,
  ReviewQueueStats,
  MLModel,
  MLModelStats,
  RetrainingRequest,
  RetrainingResult,
  TrainingData,
  TrainingDataStats,
  BulkTrainingDataRequest,
  AIAnalyticsFilter,
} from '@/lib/types/ai';
import type { ApiResponse } from '@/lib/api/client';

// ============================================
// Ticket AI Details & Classification
// ============================================

/**
 * Get full AI classification details for a specific ticket
 */
export async function getTicketAIDetails(
  ticketId: string
): Promise<ApiResponse<TicketAIDetails>> {
  return apiRequest<TicketAIDetails>(`/api/Tickets/${ticketId}/ai-details`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Override AI classification for a ticket with correct values
 */
export async function overrideTicketClassification(
  ticketId: string,
  request: OverrideRequest
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Tickets/${ticketId}/override`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    includeAuth: true,
  });
}

/**
 * Get override history for a specific ticket
 */
export async function getTicketOverrides(
  ticketId: string
): Promise<ApiResponse<OverrideRecord[]>> {
  return apiRequest<OverrideRecord[]>(`/api/Tickets/${ticketId}/overrides`, {
    method: 'GET',
    includeAuth: true,
  });
}

// ============================================
// Review Queue
// ============================================

/**
 * Get tickets in the review queue (low confidence classifications)
 */
export async function getReviewQueue(): Promise<ApiResponse<ReviewQueueTicket[]>> {
  return apiRequest<ReviewQueueTicket[]>('/api/Tickets/review-queue', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get review queue statistics
 */
export async function getReviewQueueStats(): Promise<ApiResponse<ReviewQueueStats>> {
  return apiRequest<ReviewQueueStats>('/api/Tickets/review-queue/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Approve AI classification for a ticket (confirm AI suggestion)
 */
export async function approveTicketClassification(
  ticketId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Tickets/${ticketId}/approve`, {
    method: 'POST',
    includeAuth: true,
  });
}

// ============================================
// Analytics & Performance
// ============================================

/**
 * Get overall AI performance metrics
 */
export async function getAIPerformanceMetrics(
  filter?: AIAnalyticsFilter
): Promise<ApiResponse<AIPerformanceMetrics>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);
  if (filter?.method) params.append('method', filter.method);

  const url = `/api/Analytics/ai-performance${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<AIPerformanceMetrics>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get AI performance metrics by category
 */
export async function getAIPerformanceByCategory(
  filter?: AIAnalyticsFilter
): Promise<ApiResponse<CategoryPerformance[]>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const url = `/api/Analytics/ai-performance/by-category${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<CategoryPerformance[]>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get confusion matrix for category predictions
 */
export async function getConfusionMatrix(
  filter?: AIAnalyticsFilter
): Promise<ApiResponse<ConfusionMatrix>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const url = `/api/Analytics/ai-performance/confusion-matrix${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<ConfusionMatrix>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get AI performance logs (individual classification records)
 */
export async function getAIPerformanceLogs(
  filter?: AIAnalyticsFilter & { page?: number; pageSize?: number }
): Promise<ApiResponse<AIPerformanceLog[]>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);
  if (filter?.method) params.append('method', filter.method);
  if (filter?.page) params.append('page', filter.page.toString());
  if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());

  const url = `/api/Analytics/ai-performance/logs${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<AIPerformanceLog[]>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get overall AI accuracy
 */
export async function getAIAccuracy(
  filter?: AIAnalyticsFilter
): Promise<ApiResponse<{ accuracy: number }>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const url = `/api/Analytics/ai-performance/accuracy${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<{ accuracy: number }>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get AI automation rate (percentage not needing review)
 */
export async function getAIAutomationRate(
  filter?: AIAnalyticsFilter
): Promise<ApiResponse<{ automationRate: number }>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);

  const url = `/api/Analytics/ai-performance/automation-rate${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<{ automationRate: number }>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

// ============================================
// ML Model Management
// ============================================

/**
 * Get all ML models
 */
export async function getMLModels(): Promise<ApiResponse<MLModel[]>> {
  return apiRequest<MLModel[]>('/api/admin/MLModels', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get active ML model
 */
export async function getActiveMLModel(): Promise<ApiResponse<MLModel>> {
  return apiRequest<MLModel>('/api/admin/MLModels/active', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get ML model by ID
 */
export async function getMLModelById(modelId: string): Promise<ApiResponse<MLModel>> {
  return apiRequest<MLModel>(`/api/admin/MLModels/${modelId}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get ML model statistics
 */
export async function getMLModelStats(): Promise<ApiResponse<MLModelStats>> {
  return apiRequest<MLModelStats>('/api/admin/MLModels/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Check if model retraining is eligible
 */
export async function checkRetrainingEligibility(): Promise<
  ApiResponse<{ isEligible: boolean; reason?: string }>
> {
  return apiRequest<{ isEligible: boolean; reason?: string }>(
    '/api/admin/MLModels/retraining/eligibility',
    {
      method: 'GET',
      includeAuth: true,
    }
  );
}

/**
 * Trigger manual ML model retraining
 */
export async function triggerModelRetraining(
  request?: RetrainingRequest
): Promise<ApiResponse<RetrainingResult>> {
  return apiRequest<RetrainingResult>('/api/admin/MLModels/retrain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request || {}),
    includeAuth: true,
  });
}

/**
 * Activate a specific ML model version
 */
export async function activateMLModel(
  modelId: string,
  notes?: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/admin/MLModels/${modelId}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
    includeAuth: true,
  });
}

/**
 * Delete an ML model
 */
export async function deleteMLModel(modelId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/admin/MLModels/${modelId}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

/**
 * Clean up old ML models (keeps only last 5)
 */
export async function cleanupOldModels(): Promise<
  ApiResponse<{ deletedCount: number }>
> {
  return apiRequest<{ deletedCount: number }>('/api/admin/MLModels/cleanup', {
    method: 'POST',
    includeAuth: true,
  });
}

// ============================================
// Training Data Management
// ============================================

/**
 * Get all training data
 */
export async function getTrainingData(params?: {
  category?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<TrainingData[]>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append('category', params.category);
  if (params?.verified !== undefined)
    searchParams.append('verified', params.verified.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const url = `/api/admin/TrainingData${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return apiRequest<TrainingData[]>(url, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get training data statistics
 */
export async function getTrainingDataStats(): Promise<ApiResponse<TrainingDataStats>> {
  return apiRequest<TrainingDataStats>('/api/admin/TrainingData/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get training data by category
 */
export async function getTrainingDataByCategory(
  category: string
): Promise<ApiResponse<TrainingData[]>> {
  return apiRequest<TrainingData[]>(`/api/admin/TrainingData/by-category/${category}`, {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Add bulk training data
 */
export async function addBulkTrainingData(
  request: BulkTrainingDataRequest
): Promise<ApiResponse<{ addedCount: number }>> {
  return apiRequest<{ addedCount: number }>('/api/admin/TrainingData/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    includeAuth: true,
  });
}

/**
 * Delete training data by ID
 */
export async function deleteTrainingData(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/admin/TrainingData/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

// ============================================
// TF-IDF Management (Advanced)
// ============================================

/**
 * Build TF-IDF index
 */
export async function buildTfIdfIndex(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/admin/TfIdf/build', {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Rebuild TF-IDF index from scratch
 */
export async function rebuildTfIdfIndex(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/admin/TfIdf/rebuild', {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Get TF-IDF statistics
 */
export async function getTfIdfStats(): Promise<
  ApiResponse<{
    documentCount: number;
    vocabularySize: number;
    lastBuildDate?: string;
  }>
> {
  return apiRequest<{
    documentCount: number;
    vocabularySize: number;
    lastBuildDate?: string;
  }>('/api/admin/TfIdf/stats', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Check if TF-IDF index is initialized
 */
export async function isTfIdfInitialized(): Promise<
  ApiResponse<{ isInitialized: boolean }>
> {
  return apiRequest<{ isInitialized: boolean }>('/api/admin/TfIdf/initialized', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Check if TF-IDF index is stale (needs rebuild)
 */
export async function isTfIdfStale(): Promise<ApiResponse<{ isStale: boolean }>> {
  return apiRequest<{ isStale: boolean }>('/api/admin/TfIdf/is-stale', {
    method: 'GET',
    includeAuth: true,
  });
}

// ============================================
// Notifications
// ============================================

/**
 * Get all AI notifications for current user
 */
export async function getAINotifications(): Promise<
  ApiResponse<import('@/lib/types/ai').AINotification[]>
> {
  return apiRequest<import('@/lib/types/ai').AINotification[]>('/api/Notifications/ai', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return apiRequest<{ count: number }>('/api/Notifications/unread-count', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Notifications/${notificationId}/read`, {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/Notifications/mark-all-read', {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/Notifications/${notificationId}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}
