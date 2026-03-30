// components/layout/breadcrumb.tsx
'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { getBreadcrumbConfig, segmentToLabel } from '@/lib/breadcrumbs/config';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

function buildBreadcrumbs(activePage: string): BreadcrumbItem[] {
  // Normalise: strip trailing slash, ensure leading slash
  const clean = ('/' + activePage.replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');

  if (clean === '/' || clean === '/dashboard') {return [];}

  const segments = clean.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  segments.forEach((_, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const config = getBreadcrumbConfig(path);

    // Skip segments marked as hidden
    if (config?.hideInBreadcrumb) {return;}

    const label = config?.label ?? segmentToLabel(segments[i]);

    items.push({ label, path, isLast: false });
  });

  if (items.length > 0) {
    items[items.length - 1].isLast = true;
  }

  return items;
}

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const { activePage, navigateTo } = useNavigation();

  const items = buildBreadcrumbs(activePage);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}
    >
      {/* Root — always shown */}
      <button
        onClick={() => navigateTo('/dashboard')}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Dashboard"
      >
        <Home className="h-3.5 w-3.5 shrink-0" />
        <span className={cn(items.length === 0 ? 'text-foreground font-medium' : '')}>
          Dashboard
        </span>
      </button>

      {items.map((item) => (
        <Fragment key={item.path}>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          {item.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[200px]" title={item.label}>
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => navigateTo(item.path)}
              className="hover:text-foreground transition-colors truncate max-w-[160px]"
              title={item.label}
            >
              {item.label}
            </button>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
