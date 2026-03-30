/**
 * Breadcrumb Configuration
 * Maps routes to custom labels and icons for the breadcrumb navigation
 */

import {
  Home,
  Ticket,
  ClipboardList,
  UserCheck,
  Users,
  TrendingUp,
  Server,
  Shield,
  Brain,
  BookOpen,
  Settings,
  Bell,
  User,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

export interface BreadcrumbConfig {
  label: string;
  icon?: LucideIcon;
  dynamic?: boolean;
  hideInBreadcrumb?: boolean;
}

export type BreadcrumbConfigMap = Record<string, BreadcrumbConfig>;

/**
 * Route configuration for breadcrumbs
 * Keys should match the route path segments
 * Dynamic segments use [id] or [slug] notation
 */
export const breadcrumbConfig: BreadcrumbConfigMap = {
  // Root
  '/dashboard': {
    label: 'Dashboard',
    icon: Home,
  },

  // Tickets
  '/tickets': {
    label: 'Tickets',
    icon: Ticket,
  },
  '/tickets/create-ticket': {
    label: 'Create Ticket',
  },
  '/tickets/assigned': {
    label: 'Assigned to Me',
  },
  '/tickets/my-tickets': {
    label: 'My Tickets',
  },
  '/tickets/queue': {
    label: 'Queue',
  },
  '/tickets/[id]': {
    label: 'Ticket Details',
    dynamic: true,
  },
  '/tickets/[id]/edit': {
    label: 'Edit',
  },
  '/tickets/review-queue': {
    label: 'Review Queue',
  },

  // Service Requests
  '/service-requests': {
    label: 'Service Requests',
    icon: ClipboardList,
  },
  '/service-requests/create-request': {
    label: 'Create Request',
  },
  '/service-requests/my-requests': {
    label: 'My Requests',
  },
  '/service-requests/[id]': {
    label: 'Request Details',
    dynamic: true,
  },

  // Service Categories
  '/service-categories': {
    label: 'Service Categories',
    icon: UserCheck,
  },
  '/service-categories/create-category': {
    label: 'Create Category',
  },
  '/service-categories/[id]': {
    label: 'Category Details',
    dynamic: true,
  },

  // Team
  '/team': {
    label: 'Team',
    icon: Users,
  },
  '/team/members': {
    label: 'Members',
  },
  '/team/workload': {
    label: 'Workload',
  },
  '/team/performance': {
    label: 'Performance',
  },
  '/team/members/[id]': {
    label: 'Member Details',
    dynamic: true,
  },

  // Reports
  '/reports': {
    label: 'Reports',
    icon: TrendingUp,
  },
  '/reports/my-performance': {
    label: 'My Performance',
  },
  '/reports/sla': {
    label: 'SLA Report',
  },
  '/reports/analytics': {
    label: 'Analytics',
  },

  // Systems
  '/systems': {
    label: 'Systems',
    icon: Server,
  },
  '/systems/infrastructure': {
    label: 'Infrastructure',
  },
  '/systems/health': {
    label: 'Health Status',
  },
  '/systems/sla': {
    label: 'SLA Dashboard',
  },

  // Security
  '/security': {
    label: 'Security',
    icon: Shield,
  },
  '/security/access-requests': {
    label: 'Access Requests',
  },
  '/security/audit': {
    label: 'Audit Log',
  },
  '/security/permissions': {
    label: 'Permissions',
  },

  // AI & ML Admin
  '/admin': {
    label: 'AI & ML Admin',
    icon: Brain,
  },
  '/admin/ai-analytics': {
    label: 'AI Analytics',
  },
  '/admin/ml-models': {
    label: 'ML Models',
  },
  '/admin/training-data': {
    label: 'Training Data',
  },

  // Knowledge Base
  '/knowledge-base': {
    label: 'Knowledge Base',
    icon: BookOpen,
  },

  // Settings
  '/settings': {
    label: 'Settings',
    icon: Settings,
  },
  '/settings/profile': {
    label: 'Profile',
    icon: User,
  },
  '/settings/team': {
    label: 'Team Settings',
  },
  '/settings/system': {
    label: 'System Settings',
  },
  '/settings/cron-settings': {
    label: 'Cron Settings',
    icon: Calendar,
  },
  '/settings/preferences': {
    label: 'Profile & Preferences',
    icon: User,
  },
  '/settings/notifications': {
    label: 'Notifications',
    icon: Bell,
  },

  // Help
  '/help': {
    label: 'Help',
  },
};

/**
 * Get breadcrumb configuration for a given route path
 */
export function getBreadcrumbConfig(path: string): BreadcrumbConfig | undefined {
  // Direct match first
  if (breadcrumbConfig[path]) {
    return breadcrumbConfig[path];
  }

  // Try to match dynamic routes
  // Replace segments that look like IDs with [id]
  const dynamicPath = path
    .split('/')
    .map((segment) => {
      // Check if segment is a MongoDB ObjectId (24 chars hex) or UUID
      if (
        /^[a-f0-9]{24}$/i.test(segment) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      ) {
        return '[id]';
      }

      return segment;
    })
    .join('/');

  return breadcrumbConfig[dynamicPath];
}

/**
 * Check if a route segment is dynamic (contains [id], [slug], etc.)
 */
export function isDynamicSegment(segment: string): boolean {
  return /^\[.+\]$/.test(segment);
}

/**
 * Get a human-readable label from a route segment
 * Converts kebab-case and snake_case to Title Case
 */
export function segmentToLabel(segment: string): string {
  if (!segment) {return '';}

  // Handle dynamic segments
  if (isDynamicSegment(segment)) {
    return segment.replace(/\[|\]/g, '');
  }

  // Convert kebab-case or snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
