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
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { UserRole } from "@/lib/api/auth";

// All roles for easy reference
const ALL_ROLES: UserRole[] = [
  "Admin",
  "ITManager",
  "TeamLead",
  "SystemAdmin",
  "ServiceDeskAgent",
  "Technician",
  "SecurityAdmin",
  "EndUser",
];

// Staff roles (everyone except EndUser)
const STAFF_ROLES: UserRole[] = [
  "Admin",
  "ITManager",
  "TeamLead",
  "SystemAdmin",
  "ServiceDeskAgent",
  "Technician",
  "SecurityAdmin",
];

// Management roles
const MANAGEMENT_ROLES: UserRole[] = ["Admin", "ITManager", "TeamLead"];

// Support roles (handle tickets)
const SUPPORT_ROLES: UserRole[] = ["ServiceDeskAgent", "Technician", "SecurityAdmin", "SystemAdmin"];

export const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ALL_ROLES, 
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
      roles: ALL_ROLES, 
      items: [
        { title: "All Tickets", url: "/tickets", roles: ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"] },
        { title: "Assigned to Me", url: "/tickets/assigned", roles: [...SUPPORT_ROLES, "TeamLead"] },
        { title: "My Tickets", url: "/tickets/my-tickets", roles: ["EndUser"] },
        { title: "Create Ticket", url: "/tickets/create-ticket", roles: ALL_ROLES },
        { title: "Queue", url: "/tickets/queue", roles: ["ServiceDeskAgent", "TeamLead"] },
      ],
    },
    {
      title: "Service Requests",
      url: "/service-requests",
      icon: ClipboardList,
      roles: ALL_ROLES, 
      items: [
        { title: "Service Requests", url: "/service-requests", roles: ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"] },
        { title: "My Requests Details", url: "/service-requests/my-requests", roles: ALL_ROLES },
        { title: "Raise Service Request", url: "/service-requests/create-request", roles: ALL_ROLES },
        { title: "Request Queue", url: "/service-requests/queue", roles: ["ServiceDeskAgent", "TeamLead", "ITManager", "Admin", "SystemAdmin", "Technician", "SecurityAdmin"] },
      ],
    },
    {
      title: "Service Categories",
      url: "/service-categories",
      icon: UserCheck,
      roles: ALL_ROLES, 
      items: [
        { title: "View Categories", url: "/service-categories", roles: ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"] },
        { title: "Create Category", url: "/service-categories/create-category", roles: ["Admin", "ITManager"] },
      ],
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
      roles: MANAGEMENT_ROLES, 
      items: [
        { title: "Members", url: "/team/members", roles: MANAGEMENT_ROLES },
        { title: "Workload", url: "/team/workload", roles: ["TeamLead", "ITManager"] },
        { title: "Performance", url: "/team/performance", roles: ["Admin", "ITManager"] },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: TrendingUp,
      roles: [...MANAGEMENT_ROLES, "ServiceDeskAgent", "Technician"], 
      items: [
        { title: "Overview", url: "/reports", roles: MANAGEMENT_ROLES },
        { title: "My Performance", url: "/reports/my-performance", roles: SUPPORT_ROLES },
        { title: "SLA Report", url: "/reports/sla", roles: ["Admin", "ITManager", "SystemAdmin"] },
        { title: "Analytics", url: "/reports/analytics", roles: ["Admin", "ITManager"] },
      ],
    },
    {
      title: "Systems",
      url: "/systems",
      icon: Server,
      roles: ["Admin", "SystemAdmin"], 
      items: [
        { title: "Infrastructure", url: "/systems/infrastructure", roles: ["Admin", "SystemAdmin"] },
        { title: "Health Status", url: "/systems/health", roles: ["Admin", "SystemAdmin"] },
        { title: "SLA Dashboard", url: "/systems/sla", roles: ["SystemAdmin"] },
      ],
    },
    {
      title: "Security",
      url: "/security",
      icon: Shield,
      roles: ["Admin", "SecurityAdmin"], 
      items: [
        { title: "Access Requests", url: "/security/access-requests", roles: ["Admin", "SecurityAdmin"] },
        { title: "Audit Log", url: "/security/audit", roles: ["Admin", "SecurityAdmin"] },
        { title: "Permissions", url: "/security/permissions", roles: ["Admin"] },
      ],
    },
    {
      title: "Knowledge Base",
      url: "/knowledge-base",
      icon: BookOpen,
      roles: ALL_ROLES, 
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: ALL_ROLES, 
      items: [
        { title: "Profile", url: "/settings/profile", roles: ALL_ROLES },
        { title: "Team Settings", url: "/settings/team", roles: MANAGEMENT_ROLES },
        { title: "System Settings", url: "/settings/system", roles: ["Admin"] },
        { title: "Cron Settings", url: "/settings/cron-settings", roles: ["Admin", "ITManager"] },
        { title: "Preferences", url: "/settings/preferences", roles: ALL_ROLES },
        { title: "Notifications", url: "/settings/notifications", roles: ALL_ROLES },
      ],
    },
    {
      title: "Help",
      url: siteConfig.links.docs,
      icon: HelpCircle,
      roles: ALL_ROLES, // ✅ Changed
    },
  ],
};