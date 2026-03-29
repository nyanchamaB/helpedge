import {
  BookOpen,
  Calendar,
  MessageCircle,
  Settings,
  Users,
  LayoutDashboard,
  HelpCircle,
  Shield,
  Server,
  Activity,
  TrendingUp,
  UserCheck,
  Ticket,
  ClipboardList,
  Brain,
  Database,
  FolderOpen,
  GitBranch,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { UserRole } from '@/lib/api/auth';

// All roles for easy reference
const ALL_ROLES: UserRole[] = [
  'Admin',
  'ITManager',
  'TeamLead',
  'SystemAdmin',
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
  'EndUser',
];

// Staff roles (everyone except EndUser)
const STAFF_ROLES: UserRole[] = [
  'Admin',
  'ITManager',
  'TeamLead',
  'SystemAdmin',
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
];

// Management roles
const MANAGEMENT_ROLES: UserRole[] = ['Admin', 'ITManager', 'TeamLead'];

// Support roles (handle tickets)
const SUPPORT_ROLES: UserRole[] = [
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
  'SystemAdmin',
];

export const navData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      roles: ALL_ROLES,
      items: [
        { title: 'Overview', url: '/dashboard', roles: ALL_ROLES },
        { title: 'Agent Dashboard', url: '/agent/dashboard', roles: ['ServiceDeskAgent'] },
        {
          title: 'My Work Queue',
          url: '/resolver/dashboard',
          roles: ['Technician', 'SystemAdmin', 'SecurityAdmin', 'TeamLead', 'ServiceDeskAgent'],
        },
        {
          title: 'Operations Center',
          url: '/manager/dashboard',
          roles: ['Admin', 'ITManager', 'TeamLead'],
        },
      ],
      //roles: ALL_ROLES,
    },
    {
      title: 'Tickets',
      url: '/tickets',
      icon: Ticket,
      roles: ALL_ROLES,
      items: [
        {
          title: 'Review Queue',
          url: '/tickets/review-queue',
          roles: ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'],
        },
        {
          title: 'All Tickets',
          url: '/tickets',
          roles: ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'],
        },
        {
          title: 'My Work',
          url: '/resolver/tickets',
          roles: ['Technician', 'SystemAdmin', 'SecurityAdmin', 'TeamLead', 'ServiceDeskAgent'],
        },
        { title: 'My Tickets', url: '/portal/my-tickets', roles: ALL_ROLES },
        { title: 'Submit Ticket', url: '/portal/create-ticket', roles: ['EndUser'] },
        { title: 'Email Instructions', url: '/portal/email-ticket', roles: ['EndUser'] },
        { title: 'Quick Submit', url: '/portal/create-ticket', roles: STAFF_ROLES },
        {
          title: 'Proxy Submission',
          url: '/tickets/from-email',
          roles: ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'],
        },
      ],
    },
    {
      title: 'Service Requests',
      url: '/service-requests',
      icon: ClipboardList,
      roles: ALL_ROLES,
      items: [
        {
          title: 'Request Queue',
          url: '/service-requests/queue',
          roles: [
            'ServiceDeskAgent',
            'TeamLead',
            'ITManager',
            'Admin',
            'SystemAdmin',
            'Technician',
            'SecurityAdmin',
          ],
        },
        {
          title: 'All Service Requests',
          url: '/service-requests',
          roles: ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'],
        },
        { title: 'My Requests', url: '/service-requests/my-requests', roles: ALL_ROLES },
        {
          title: 'Raise Service Request',
          url: '/service-requests/create-request',
          roles: ALL_ROLES,
        },
      ],
    },
    {
      title: 'Approval Workflows',
      url: '/approval-workflows',
      icon: GitBranch,
      roles: ['Admin', 'ITManager'] as UserRole[],
      items: [
        {
          title: 'All Workflows',
          url: '/approval-workflows',
          roles: ['Admin', 'ITManager'] as UserRole[],
        },
      ],
    },
    {
      title: 'Categories',
      url: '/admin/categories',
      icon: FolderOpen,
      roles: STAFF_ROLES,
      items: [
        { title: 'Ticket Categories', url: '/admin/categories', roles: STAFF_ROLES },
        { title: 'Service Categories', url: '/service-categories', roles: STAFF_ROLES },
      ],
    },
    {
      title: 'Team',
      url: '/team',
      icon: Users,
      roles: MANAGEMENT_ROLES,
      items: [
        { title: 'Members', url: '/team/members', roles: MANAGEMENT_ROLES },
        { title: 'Workload', url: '/team/workload', roles: ['TeamLead', 'ITManager'] },
        { title: 'Performance', url: '/team/performance', roles: ['Admin', 'ITManager'] },
      ],
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: TrendingUp,
      roles: [...MANAGEMENT_ROLES, 'ServiceDeskAgent', 'Technician'],
      items: [
        { title: 'Overview', url: '/reports', roles: MANAGEMENT_ROLES },
        { title: 'My Performance', url: '/reports/my-performance', roles: SUPPORT_ROLES },
        { title: 'SLA Report', url: '/reports/sla', roles: ['Admin', 'ITManager', 'SystemAdmin'] },
        { title: 'Analytics', url: '/reports/analytics', roles: ['Admin', 'ITManager'] },
      ],
    },
    {
      title: 'Systems',
      url: '/systems',
      icon: Server,
      roles: ['Admin', 'SystemAdmin'],
      items: [
        {
          title: 'Infrastructure',
          url: '/systems/infrastructure',
          roles: ['Admin', 'SystemAdmin'],
        },
        { title: 'Health Status', url: '/systems/health', roles: ['Admin', 'SystemAdmin'] },
        { title: 'SLA Dashboard', url: '/systems/sla', roles: ['SystemAdmin'] },
      ],
    },
    {
      title: 'Security',
      url: '/security',
      icon: Shield,
      roles: ['Admin', 'SecurityAdmin'],
      items: [
        {
          title: 'Access Requests',
          url: '/security/access-requests',
          roles: ['Admin', 'SecurityAdmin'],
        },
        { title: 'Audit Log', url: '/security/audit', roles: ['Admin', 'SecurityAdmin'] },
        { title: 'Permissions', url: '/security/permissions', roles: ['Admin'] },
      ],
    },
    {
      title: 'AI',
      url: '/admin',
      icon: Brain,
      roles: ['Admin', 'ITManager'],
      items: [
        { title: 'AI Analytics', url: '/admin/ai-analytics', roles: ['Admin', 'ITManager'] },
        { title: 'TF-IDF', url: '/admin/tfidf', roles: ['Admin'] },
        { title: 'Case-Based Reasoning', url: '/admin/case-based-reasoning', roles: ['Admin'] },
        { title: 'Rule Management', url: '/admin/rule-management', roles: ['Admin', 'ITManager'] },
      ],
    },
    {
      title: 'Knowledge Base',
      url: '/knowledge-base',
      icon: BookOpen,
      roles: ALL_ROLES,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      roles: ALL_ROLES,
      items: [
        { title: 'Profile & Preferences', url: '/settings/preferences', roles: ALL_ROLES },
        { title: 'Team Settings', url: '/settings/team', roles: MANAGEMENT_ROLES },
        { title: 'System Settings', url: '/settings/system', roles: ['Admin'] },
        { title: 'Cron Settings', url: '/settings/cron-settings', roles: ['Admin', 'ITManager'] },
        { title: 'Notifications', url: '/settings/notifications', roles: ALL_ROLES },
      ],
    },
    {
      title: 'Help',
      url: siteConfig.links.docs,
      icon: HelpCircle,
      roles: ALL_ROLES, // Changed
    },
  ],
};
