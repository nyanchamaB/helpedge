// API service for Cron Settings management
// Handles all cron settings related API calls

import { apiRequest, ApiResponse } from './client';

export interface CronSettings {
  settingName: string;
  autoFetchEnabled: boolean;
  intervalMinutes: number;
  lastFetchAt?: string;
  lastFetchStatus?: string;
  lastFetchEmailCount?: number;
}

export interface UpdateCronSettingsDto {
  autoFetchEnabled: boolean;
  intervalMinutes: number;
}

/**
 * Get current cron settings
 * GET /api/CronSettings
 */
export async function getCronSettings(): Promise<ApiResponse<CronSettings>> {
  return apiRequest<CronSettings>('/api/CronSettings', {
    method: 'GET',
    includeAuth: true,
  });
}

/**
 * Update cron settings (both autoFetchEnabled and intervalMinutes)
 * PUT /api/CronSettings
 */
export async function updateCronSettings(
  settings: UpdateCronSettingsDto
): Promise<ApiResponse<CronSettings>> {
  return apiRequest<CronSettings>('/api/CronSettings', {
    method: 'PUT',
    body: settings,
    includeAuth: true,
  });
}

/**
 * Enable auto-fetch
 * POST /api/CronSettings/enable
 */
export async function enableAutoFetch(): Promise<ApiResponse<CronSettings>> {
  return apiRequest<CronSettings>('/api/CronSettings/enable', {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Disable auto-fetch
 * POST /api/CronSettings/disable
 */
export async function disableAutoFetch(): Promise<ApiResponse<CronSettings>> {
  return apiRequest<CronSettings>('/api/CronSettings/disable', {
    method: 'POST',
    includeAuth: true,
  });
}

/**
 * Update interval only
 * PATCH /api/CronSettings/interval
 */
export async function updateInterval(
  intervalMinutes: number
): Promise<ApiResponse<CronSettings>> {
  return apiRequest<CronSettings>('/api/CronSettings/interval', {
    method: 'PATCH',
    body: { intervalMinutes },
    includeAuth: true,
  });
}

// Predefined interval options for the UI
export const INTERVAL_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
] as const;
