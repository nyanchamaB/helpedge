// hooks/use-breadcrumbs.ts
'use client';

import { usePathname, useParams } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbConfig {
  id?: string;
  [key: string]: string | undefined;
}

// Custom breadcrumb configurations for specific routes
const routeConfig: Record<string, (params?: BreadcrumbConfig) => BreadcrumbItem[]> = {
  '/service-categories': () => [{ label: 'Service Categories', href: '/service-categories' }],
  '/service-categories/create-category': () => [
    { label: 'Service Categories', href: '/service-categories' },
    { label: 'Create Category' },
  ],
  '/service-categories/[id]': (params?: BreadcrumbConfig) => [
    { label: 'Service Categories', href: '/service-categories' },
    { label: `Category ${params?.id ? `#${params.id.substring(0, 8)}...` : 'Details'}` },
  ],
  '/service-categories/[id]/edit': (params?: BreadcrumbConfig) => [
    { label: 'Service Categories', href: '/service-categories' },
    {
      label: `Category ${params?.id ? `#${params.id.substring(0, 8)}...` : 'Details'}`,
      href: `/service-categories/${params?.id}`,
    },
    { label: 'Edit' },
  ],
  '/dashboard': () => [{ label: 'Dashboard' }],
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const params = useParams();

  const items = useMemo(() => {
    // Check if we have a custom config for this route
    const matchedRoute = Object.keys(routeConfig).find((route) => {
      const routePattern = route.replace(/\[.*?\]/g, '([^/]+)');
      const regex = new RegExp(`^${routePattern}$`);

      return regex.test(pathname);
    });

    if (matchedRoute && routeConfig[matchedRoute]) {
      return routeConfig[matchedRoute](params as BreadcrumbConfig);
    }

    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const accumulatedPath = '/' + paths.slice(0, index + 1).join('/');

      let label = path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\.tsx$/, '')
        .trim();

      if (path.startsWith('[') && path.endsWith(']')) {
        const paramName = path.slice(1, -1);
        label = (params[paramName] as string) || 'Details';
      }

      return {
        label,
        href: index < paths.length - 1 ? accumulatedPath : undefined,
      };
    });
  }, [pathname, params]);

  return items;
}
