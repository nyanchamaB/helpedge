/**
 * Breadcrumb Utility Functions
 * Helper functions for parsing paths and generating breadcrumb data
 */

import type { LucideIcon } from 'lucide-react';
import { getBreadcrumbConfig, segmentToLabel } from './config';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  isCurrentPage: boolean;
  isDynamic?: boolean;
}

/**
 * Parse a pathname into breadcrumb items
 * @param pathname - The current route pathname (e.g., "/tickets/create-ticket")
 * @param customLabels - Optional custom labels for specific paths
 * @returns Array of breadcrumb items
 */
export function parseBreadcrumbs(
  pathname: string,
  customLabels?: Record<string, string>
): BreadcrumbItem[] {
  // Remove query parameters and trailing slashes
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '');

  // Split into segments and filter empty ones
  const segments = cleanPath.split('/').filter(Boolean);

  // Always start with dashboard
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: getBreadcrumbConfig('/dashboard')?.icon,
      isCurrentPage: segments.length === 0 || segments[0] === 'dashboard',
    },
  ];

  // If we're on /dashboard exactly, return early
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return breadcrumbs;
  }

  // Build breadcrumbs for each segment
  let currentPath = '';
  segments.forEach((segment, index) => {
    // Skip 'dashboard' segment as we already added it
    if (segment === 'dashboard' && index === 0) {
      return;
    }

    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check for custom label first
    let label = customLabels?.[currentPath];

    // Then check config
    if (!label) {
      const config = getBreadcrumbConfig(currentPath);
      label = config?.label;
    }

    // Fallback to segment-based label
    if (!label) {
      label = segmentToLabel(segment);
    }

    const config = getBreadcrumbConfig(currentPath);

    breadcrumbs.push({
      label,
      href: currentPath,
      icon: config?.icon,
      isCurrentPage: isLast,
      isDynamic: config?.dynamic,
    });
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumb items from a pathname with dynamic data
 * @param pathname - The current route pathname
 * @param dynamicData - Object mapping paths to their display names
 * @example
 * generateBreadcrumbs('/tickets/123', { '/tickets/123': 'Printer Not Working' })
 */
export function generateBreadcrumbs(
  pathname: string,
  dynamicData?: Record<string, string>
): BreadcrumbItem[] {
  return parseBreadcrumbs(pathname, dynamicData);
}

/**
 * Get the page title from breadcrumbs (last item's label)
 */
export function getPageTitle(breadcrumbs: BreadcrumbItem[]): string {
  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  return lastItem?.label || 'Dashboard';
}

/**
 * Check if a path should show breadcrumbs
 * Some pages might want to hide breadcrumbs (e.g., login page)
 */
export function shouldShowBreadcrumbs(pathname: string): boolean {
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !hiddenPaths.includes(pathname);
}

/**
 * Collapse breadcrumbs for mobile view
 * Shows first item, ellipsis, and last 2 items
 */
export function collapseBreadcrumbs(
  breadcrumbs: BreadcrumbItem[],
  maxItems: number = 3
): {
  items: BreadcrumbItem[];
  hasEllipsis: boolean;
} {
  if (breadcrumbs.length <= maxItems) {
    return { items: breadcrumbs, hasEllipsis: false };
  }

  // Show first item, ellipsis, and last 2 items
  const collapsed = [
    breadcrumbs[0], // Dashboard
    ...breadcrumbs.slice(-2), // Last 2 items
  ];

  return { items: collapsed, hasEllipsis: true };
}

/**
 * Format a dynamic segment value for display
 * Handles IDs, slugs, and other dynamic values
 */
export function formatDynamicSegment(value: string, defaultLabel?: string): string {
  // If it's a MongoDB ObjectId or UUID, return the default label
  if (
    /^[a-f0-9]{24}$/i.test(value) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  ) {
    return defaultLabel || 'Details';
  }

  // Otherwise, format as title case
  return segmentToLabel(value);
}
