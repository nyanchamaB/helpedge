import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const docsContent: Record<string, { title: string; description: string; sections: { heading: string; body: string }[]; prev?: { label: string; href: string }; next?: { label: string; href: string } }> = {
  "introduction": {
    title: "Introduction",
    description: "Welcome to the HelpEdge ITSM documentation. Learn how to manage IT services, automate workflows, and deliver exceptional support.",
    sections: [
      { heading: "What is HelpEdge?", body: "HelpEdge is a modern IT Service Management platform designed to help teams handle incidents, manage assets, automate repetitive tasks, and deliver consistent IT support at scale." },
      { heading: "Who is it for?", body: "HelpEdge is built for IT teams, service desk agents, system administrators, and IT managers who need a centralized platform to manage service operations." },
      { heading: "Key Capabilities", body: "Incident and problem management, change control, asset tracking, SLA enforcement, knowledge base, self-service portal, reporting, and third-party integrations." },
    ],
    next: { label: "Getting Started", href: "/resources/docs/getting-started" },
  },
  "getting-started": {
    title: "Getting Started",
    description: "Get your ITSM workspace up and running quickly with this step-by-step guide.",
    sections: [
      { heading: "Step 1 — Create your account", body: "Sign up at helpedge.com and verify your email address. You'll be prompted to set up your organization name and primary admin account." },
      { heading: "Step 2 — Configure your workspace", body: "Set your organization's timezone, business hours, and default SLA policies from the Settings panel." },
      { heading: "Step 3 — Invite your team", body: "Navigate to User Management and invite agents and admins by email. Assign roles based on their responsibilities." },
      { heading: "Step 4 — Create your first ticket", body: "Go to the Service Desk, click New Ticket, fill in the details, assign it to an agent, and set a priority level." },
    ],
    prev: { label: "Introduction", href: "/resources/docs/introduction" },
    next: { label: "Quick Setup", href: "/resources/docs/quick-setup" },
  },
  "quick-setup": {
    title: "Quick Setup",
    description: "A condensed setup guide for teams who want to get productive fast.",
    sections: [
      { heading: "Minimum viable setup", body: "At minimum you need: one admin account, at least one agent, one service category, and one SLA policy before you can start handling tickets." },
      { heading: "Recommended first configurations", body: "Set up email integration so tickets can be created via email, configure your first automation rule to auto-assign tickets by category, and publish at least one knowledge base article." },
    ],
    prev: { label: "Getting Started", href: "/resources/docs/getting-started" },
    next: { label: "Incident Management", href: "/resources/docs/incident-management" },
  },
  "incident-management": {
    title: "Incident Management",
    description: "Learn how to log, categorize, assign, and resolve incidents efficiently.",
    sections: [
      { heading: "What is an incident?", body: "An incident is any unplanned interruption or reduction in quality of an IT service. Examples include server outages, application errors, or connectivity issues." },
      { heading: "Creating an incident", body: "Incidents can be created manually by agents, submitted through the self-service portal, or automatically via monitoring integrations." },
      { heading: "Incident lifecycle", body: "New → Assigned → In Progress → Pending → Resolved → Closed. Each stage can trigger notifications and SLA timers." },
      { heading: "Escalation rules", body: "Configure escalation policies so that unresolved incidents are automatically reassigned or flagged when SLA thresholds are approaching." },
    ],
    prev: { label: "Quick Setup", href: "/resources/docs/quick-setup" },
    next: { label: "Change Management", href: "/resources/docs/change-management" },
  },
  "change-management": {
    title: "Change Management",
    description: "Plan, review, and execute IT changes with minimal risk and disruption.",
    sections: [
      { heading: "Types of changes", body: "Standard changes are pre-approved low-risk changes. Normal changes require full review and approval. Emergency changes are expedited for critical situations." },
      { heading: "Change Advisory Board (CAB)", body: "Set up a CAB within HelpEdge to review and approve normal changes before they are implemented." },
      { heading: "Change calendar", body: "Use the change calendar to schedule and visualize upcoming changes, identify conflicts, and coordinate with stakeholders." },
    ],
    prev: { label: "Incident Management", href: "/resources/docs/incident-management" },
    next: { label: "Problem Management", href: "/resources/docs/problem-management" },
  },
  "sla-management": {
    title: "SLA Management",
    description: "Define and enforce service level agreements across your support operations.",
    sections: [
      { heading: "Creating SLA policies", body: "Navigate to Settings → SLA Policies. Define response and resolution targets based on ticket priority (Critical, High, Medium, Low)." },
      { heading: "Business hours", body: "SLA timers can be configured to count only during business hours or around the clock depending on your support model." },
      { heading: "Breach notifications", body: "Set up alerts to notify agents and managers when an SLA is at risk or has been breached." },
    ],
    prev: { label: "Problem Management", href: "/resources/docs/problem-management" },
    next: { label: "Asset Management", href: "/resources/docs/asset-management" },
  },
  "user-management": {
    title: "User Management",
    description: "Manage agents, admins, and end users with role-based access control.",
    sections: [
      { heading: "Roles", body: "HelpEdge has three default roles: Admin (full access), Agent (ticket handling), and End User (self-service portal only). Custom roles can be created." },
      { heading: "Inviting users", body: "Go to Settings → Users → Invite. Enter the email address and select a role. Users receive an invitation email to set up their account." },
      { heading: "Teams", body: "Group agents into teams by function (e.g. Network, Hardware, Software). Tickets can be assigned to teams and auto-routed based on category." },
    ],
    prev: { label: "Security", href: "/resources/docs/security" },
    next: { label: "Custom Workflows", href: "/resources/docs/custom-workflows" },
  },
  "automation": {
    title: "Automation",
    description: "Eliminate repetitive tasks with powerful automation rules.",
    sections: [
      { heading: "Automation rules", body: "Create if-then rules that trigger actions based on ticket events. Example: If priority is Critical and status is New, then assign to the on-call team and send an alert." },
      { heading: "Triggers", body: "Triggers include ticket creation, status change, field update, SLA breach, and time-based events." },
      { heading: "Actions", body: "Available actions include assign ticket, change status, send email, add note, set priority, and trigger webhook." },
    ],
    prev: { label: "Custom Workflows", href: "/resources/docs/custom-workflows" },
    next: { label: "Integrations", href: "/resources/docs/integrations" },
  },
};

export default function DocSlugPage({ params }: { params: { slug: string } }) {
  const doc = docsContent[params.slug];

  if (!doc) return notFound();

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6 not-prose">
        <span>Docs</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{doc.title}</span>
      </div>

      {/* Header */}
      <h1 className="text-4xl font-bold mb-3">{doc.title}</h1>
      <p className="text-lg text-muted-foreground mb-10 not-prose">{doc.description}</p>

      <hr className="mb-10" />

      {/* Sections */}
      <div className="space-y-10">
        {doc.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex justify-between mt-16 not-prose border-t pt-8">
        {doc.prev ? (
          <Link href={doc.prev.href} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            ← {doc.prev.label}
          </Link>
        ) : <div />}
        {doc.next && (
          <Link href={doc.next.href} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            {doc.next.label} →
          </Link>
        )}
      </div>
    </article>
  );
}