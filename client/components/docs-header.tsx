"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

const slugToLabel: Record<string, string> = {
  docs: "Docs",
  "getting-started": "Getting Started",
  "quick-setup": "Quick Setup",
  introduction: "Introduction",
  "incident-management": "Incident Management",
  "change-management": "Change Management",
  "problem-management": "Problem Management",
  "sla-management": "SLA Management",
  "asset-management": "Asset Management",
  "knowledge-base": "Knowledge Base",
  "self-service-portal": "Self-Service Portal",
  "multi-channel-support": "Multi-Channel Support",
  "user-management": "User Management",
  "custom-workflows": "Custom Workflows",
  automation: "Automation",
  integrations: "Integrations",
  security: "Security",
  "reporting-dashboards": "Reporting & Dashboards",
  analytics: "Analytics",
  "collaboration-tools": "Collaboration Tools",
};

export default function DocsHeader() {
  const pathname = usePathname();

  // Build breadcrumb segments from pathname
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((seg, i) => ({
    label: slugToLabel[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">

        {/* Logo + back to home */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors shrink-0"
        >
          <img
            src={siteConfig.logo}
            alt="HelpEdge Logo"
            className="h-5 w-auto transition-transform duration-200 hover:scale-110 h-15 w-auto"
          />
          <span className="ml-2">{siteConfig.name}</span>
        </Link>

        <span className="text-muted-foreground/40">|</span>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden">
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1 truncate">
              {!crumb.isLast ? (
                <>
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </>
              ) : (
                <span className="text-foreground font-medium truncate">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            className="pl-8 h-8 text-sm bg-muted border-0 focus-visible:ring-1"
          />
        </div>

        {/* Version badge */}
        <Badge variant="outline" className="text-xs shrink-0">
          v2.4.0
        </Badge>
      </div>
    </header>
  );
}