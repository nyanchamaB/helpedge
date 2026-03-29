import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DocsSidebarLink } from '@/components/docs-sidebar-links';
import DocsHeader from '@/components/docs-header';
const sidebarSections = [
  {
    title: 'Overview',
    links: [
      { label: 'Introduction', href: '/resources/docs/introduction' },
      { label: 'Getting Started', href: '/resources/docs/getting-started' },
      { label: 'Quick Setup', href: '/resources/docs/quick-setup' },
    ],
  },
  {
    title: 'Core Features',
    links: [
      { label: 'Incident Management', href: '/resources/docs/incident-management' },
      { label: 'Change Management', href: '/resources/docs/change-management' },
      { label: 'Problem Management', href: '/resources/docs/problem-management' },
      { label: 'SLA Management', href: '/resources/docs/sla-management' },
      { label: 'Asset Management', href: '/resources/docs/asset-management' },
    ],
  },
  {
    title: 'Self-Service',
    links: [
      { label: 'Knowledge Base', href: '/resources/docs/knowledge-base' },
      { label: 'Self-Service Portal', href: '/resources/docs/self-service-portal' },
      { label: 'Multi-Channel Support', href: '/resources/docs/multi-channel-support' },
    ],
  },
  {
    title: 'Administration',
    links: [
      { label: 'User Management', href: '/resources/docs/user-management' },
      { label: 'Custom Workflows', href: '/resources/docs/custom-workflows' },
      { label: 'Automation', href: '/resources/docs/automation' },
      { label: 'Integrations', href: '/resources/docs/integrations' },
      { label: 'Security', href: '/resources/docs/security' },
    ],
  },
  {
    title: 'Insights',
    links: [
      { label: 'Reporting & Dashboards', href: '/resources/docs/reporting-dashboards' },
      { label: 'Analytics', href: '/resources/docs/analytics' },
      { label: 'Collaboration Tools', href: '/resources/docs/collaboration-tools' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DocsHeader />
      <div className="flex min-h-screen max-w-7xl mx-auto px-6 py-16 gap-12">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Documentation
              </p>
            </div>
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <DocsSidebarLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
