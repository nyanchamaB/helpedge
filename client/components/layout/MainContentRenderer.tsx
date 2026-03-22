"use client";

import { useNavigation } from "@/contexts/NavigationContext";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import EmailTicketPage from "@/components/tickets/EmailTicketPage";

// Agent pages
const AgentDashboardContent = dynamic(() => import("@/app/agent/dashboard/page"), {
  loading: () => <PageSkeleton />,
});

const AgentTicketsContent = dynamic(() => import("@/app/agent/tickets/page"), {
  loading: () => <PageSkeleton />,
});

// Resolver pages
const ResolverDashboardContent = dynamic(() => import("@/app/resolver/dashboard/page"), {
  loading: () => <PageSkeleton />,
});

const ResolverTicketsContent = dynamic(() => import("@/app/resolver/tickets/page"), {
  loading: () => <PageSkeleton />,
});

// Manager pages
const ManagerDashboardContent = dynamic(() => import("@/app/manager/dashboard/page"), {
  loading: () => <PageSkeleton />,
});

const ManagerTicketsContent = dynamic(() => import("@/app/manager/tickets/page"), {
  loading: () => <PageSkeleton />,
});

// Portal (end-user) pages
const PortalMyTicketsContent = dynamic(() => import("@/app/portal/my-tickets/page"), {
  loading: () => <PageSkeleton />,
});

const PortalCreateTicketContent = dynamic(() => import("@/app/portal/create-ticket/page"), {
  loading: () => <PageSkeleton />,
});

const PortalTicketDetailContent = dynamic(() => import("@/app/portal/ticket/page"), {
  loading: () => <PageSkeleton />,
});

const PortalEmailTicketContent = dynamic(() => import("@/app/portal/email-ticket/page"), {
  loading: () => <PageSkeleton />,
});


// Dynamically import all page components
const DashboardContent = dynamic(() => import("@/app/(dashboard)/dashboard/DashboardContent"), {
  loading: () => <PageSkeleton />,
});

const AllTicketsContent = dynamic(() => import("@/app/(dashboard)/tickets/page"), {
  loading: () => <PageSkeleton />,
});

const AssignedTicketsContent = dynamic(() => import("@/app/(dashboard)/tickets/assigned/page"), {
  loading: () => <PageSkeleton />,
});

const MyTicketsContent = dynamic(() => import("@/app/(dashboard)/tickets/my-tickets/page"), {
  loading: () => <PageSkeleton />,
});


const ReviewQueueContent = dynamic(() => import("@/app/(protected)/tickets/review-queue/page"), {
  loading: () => <PageSkeleton />,
});

const ServiceRequestsContent = dynamic(() => import("@/app/service-requests/page"), {
  loading: () => <PageSkeleton />,
});

const MyRequestsContent = dynamic(() => import("@/app/service-requests/my-requests/page"), {
  loading: () => <PageSkeleton />,
});

const CreateRequestContent = dynamic(() => import("@/app/service-requests/create-request/page"), {
  loading: () => <PageSkeleton />,
});

const ServiceCategoriesContent = dynamic(() => import("@/app/(dashboard)/service-categories/page"), {
  loading: () => <PageSkeleton />,
});

const CreateCategoryContent = dynamic(() => import("@/app/(dashboard)/service-categories/create-category/page"), {
  loading: () => <PageSkeleton />,
});

const TeamMembersContent = dynamic(() => import("@/app/(dashboard)/team/members/page"), {
  loading: () => <PageSkeleton />,
});

const TeamWorkloadContent = dynamic(() => import("@/app/team/workload/page"), {
  loading: () => <PageSkeleton />,
});

const TeamPerformanceContent = dynamic(() => import("@/app/team/performance/page"), {
  loading: () => <PageSkeleton />,
});

const ReportsContent = dynamic(() => import("@/app/reports/page"),{
  loading: () => <PageSkeleton />,
});

const MyPerformanceContent = dynamic(() => import("@/app/reports/my-performance/page"), {
  loading: () => <PageSkeleton />,
});

const SLAReportContent = dynamic(() => import("@/app/reports/sla/page"), {
  loading: () => <PageSkeleton />,
});

const AnalyticsContent = dynamic(() => import("@/app/reports/analytics/page"), {
  loading: () => <PageSkeleton />,
});

const SystemsInfrastructureContent = dynamic(() => import("@/app/systems/infrastructure/page"), {
  loading: () => <PageSkeleton />,
});

const SystemsHealthContent = dynamic(() => import("@/app/systems/health/page"), {
  loading: () => <PageSkeleton />,
});

const SystemsSLAContent = dynamic(() => import("@/app/systems/sla/page"), {
  loading: () => <PageSkeleton />,
});

const SecurityAccessRequestsContent = dynamic(() => import("@/app/security/access-requests/page"), {
  loading: () => <PageSkeleton />,
});

const SecurityAuditContent = dynamic(() => import("@/app/security/audit/page"), {
  loading: () => <PageSkeleton />,
});

const SecurityPermissionsContent = dynamic(() => import("@/app/security/permissions/page"), {
  loading: () => <PageSkeleton />,
});

const AIAnalyticsContent = dynamic(() => import("@/app/admin/ai-analytics/page"), {
  loading: () => <PageSkeleton />,
});

const MLModelsContent = dynamic(() => import("@/app/admin/tfidf/page"), {
  loading: () => <PageSkeleton />,
});

const TrainingDataContent = dynamic(() => import("@/app/admin/training-data/page"), {
  loading: () => <PageSkeleton />,
});

const CaseBasedReasoningContent = dynamic(() => import("@/app/admin/case-based-reasoning/page"), {
  loading: () => <PageSkeleton />,
});

const RuleManagementContent = dynamic(() => import("@/app/admin/rule-management/page"), {
  loading: () => <PageSkeleton />,
});

const CategoriesContent = dynamic(() => import("@/app/admin/categories/page"), {
  loading: () => <PageSkeleton />,
});

const KnowledgeBaseContent = dynamic(() => import("@/app/(dashboard)/knowledge-base/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsProfileContent = dynamic(() => import("@/app/(dashboard)/settings/profile/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsTeamContent = dynamic(() => import("@/app/(dashboard)/settings/team/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsSystemContent = dynamic(() => import("@/app/settings/system/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsCronContent = dynamic(() => import("@/app/(dashboard)/settings/cron-settings/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsPreferencesContent = dynamic(() => import("@/app/(dashboard)/settings/preferences/page"), {
  loading: () => <PageSkeleton />,
});

const SettingsNotificationsContent = dynamic(() => import("@/app/settings/notifications/page"), {
  loading: () => <PageSkeleton />,
});

// Dynamic detail pages
const TicketDetailContent = dynamic(() => import("@/app/(dashboard)/tickets/[id]/page"), {
  loading: () => <PageSkeleton />,
});

const ServiceCategoryDetailContent = dynamic(() => import("@/app/(dashboard)/service-categories/[id]/page"), {
  loading: () => <PageSkeleton />,
});

const ServiceCategoryEditContent = dynamic(() => import("@/app/(dashboard)/service-categories/[id]/edit/page"), {
  loading: () => <PageSkeleton />,
});

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// Helper to match dynamic routes
function matchRoute(path: string, pattern: string): { match: boolean; params: Record<string, string> } {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
      // Dynamic segment
      const paramName = patternParts[i].slice(1, -1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      // Static segment doesn't match
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export function MainContentRenderer() {
  const { activePage, pageParams } = useNavigation();

  // Route mapping
  const renderContent = () => {
    // Agent routes
    if (activePage === '/agent/dashboard') return <AgentDashboardContent />;
    if (activePage === '/agent/tickets') return <AgentTicketsContent />;

    // Resolver routes
    if (activePage === '/resolver/dashboard') return <ResolverDashboardContent />;
    if (activePage === '/resolver/tickets') return <ResolverTicketsContent />;

    // Manager routes
    if (activePage === '/manager/dashboard') return <ManagerDashboardContent />;
    if (activePage === '/manager/tickets') return <ManagerTicketsContent />;

    // Portal (end-user) static routes
    if (activePage === '/portal/my-tickets') return <PortalMyTicketsContent />;
    if (activePage === '/portal/create-ticket') return <PortalCreateTicketContent />;
    if (activePage === '/portal/email-ticket') return <PortalEmailTicketContent />;
    if (activePage === '/portal/notifications') return <SettingsNotificationsContent />;

    // Portal ticket detail: /portal/ticket/[id]
    const portalTicketMatch = matchRoute(activePage, '/portal/ticket/[id]');
    if (portalTicketMatch.match) {
      return <PortalTicketDetailContent />;
    }

    // Handle static tickets routes FIRST to prevent them from matching dynamic patterns
    if (activePage === '/tickets') return <AllTicketsContent />;
    if (activePage === '/tickets/assigned') return <AssignedTicketsContent />;
    if (activePage === '/tickets/my-tickets') return <MyTicketsContent />;
    if (activePage === '/tickets/create-ticket') return <PortalCreateTicketContent />;
    if (activePage === '/tickets/from-email') return <EmailTicketPage />;
    if (activePage === '/tickets/review-queue') return <ReviewQueueContent />;

    // Check for dynamic routes AFTER static routes

    // Ticket detail: /tickets/[id]
    const ticketMatch = matchRoute(activePage, '/tickets/[id]');
    if (ticketMatch.match) {
      return <TicketDetailContent />;
    }

    // Service category detail: /service-categories/[id]
    const categoryMatch = matchRoute(activePage, '/service-categories/[id]');
    if (categoryMatch.match) {
      return <ServiceCategoryDetailContent />;
    }

    // Service category edit: /service-categories/[id]/edit
    const categoryEditMatch = matchRoute(activePage, '/service-categories/[id]/edit');
    if (categoryEditMatch.match) {
      return <ServiceCategoryEditContent />;
    }

    // Handle static routes
    switch (activePage) {
      case '/dashboard':
        return <DashboardContent />;

      // Service Requests
      case '/service-requests':
        return <ServiceRequestsContent />;
      case '/service-requests/my-requests':
        return <MyRequestsContent />;
      case '/service-requests/create-request':
        return <CreateRequestContent />;

      // Service Categories
      case '/service-categories':
        return <ServiceCategoriesContent />;
      case '/service-categories/create-category':
        return <CreateCategoryContent />;

      // Team
      case '/team/members':
        return <TeamMembersContent />;
      case '/team/workload':
        return <TeamWorkloadContent />;
      case '/team/performance':
        return <TeamPerformanceContent />;

      // Reports
      case '/reports':
        return <ReportsContent />;
      case '/reports/my-performance':
        return <MyPerformanceContent />;
      case '/reports/sla':
        return <SLAReportContent />;
      case '/reports/analytics':
        return <AnalyticsContent />;

      // Systems
      case '/systems/infrastructure':
        return <SystemsInfrastructureContent />;
      case '/systems/health':
        return <SystemsHealthContent />;
      case '/systems/sla':
        return <SystemsSLAContent />;

      // Security
      case '/security/access-requests':
        return <SecurityAccessRequestsContent />;
      case '/security/audit':
        return <SecurityAuditContent />;
      case '/security/permissions':
        return <SecurityPermissionsContent />;

      // AI & ML Admin
      case '/admin/ai-analytics':
        return <AIAnalyticsContent />;
      case '/admin/tfidf':
        return <MLModelsContent />;
      case '/admin/training-data':
        return <TrainingDataContent />;
      case '/admin/case-based-reasoning':
        return <CaseBasedReasoningContent />;
      case '/admin/rule-management':
        return <RuleManagementContent />;
      case '/admin/categories':
        return <CategoriesContent />;

      // Knowledge Base
      case '/knowledge-base':
        return <KnowledgeBaseContent />;

      // Settings
      case '/settings/profile':
        return <SettingsProfileContent />;
      case '/settings/team':
        return <SettingsTeamContent />;
      case '/settings/system':
        return <SettingsSystemContent />;
      case '/settings/cron-settings':
        return <SettingsCronContent />;
      case '/settings/preferences':
        return <SettingsPreferencesContent />;
      case '/settings/notifications':
        return <SettingsNotificationsContent />;

      default:
        return <DashboardContent />;
    }
  };

  return <>{renderContent()}</>;
}
