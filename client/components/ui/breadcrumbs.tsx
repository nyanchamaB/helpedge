// components/ui/breadcrumbs.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  homeIcon?: React.ReactNode;
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  className,
  homeIcon = <Home className="h-4 w-4" />,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // If items are provided, use them
  // Otherwise, generate from pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      <Link
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        {homeIcon}
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="mx-2">{separator}</div>

          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              href={item.href}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center text-gray-700 font-medium">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') {return [];}

  const paths = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let accumulatedPath = '';

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    accumulatedPath += `/${path}`;

    // Format the label (convert kebab-case to Title Case)
    let label = path
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\.tsx$/, '') // Remove .tsx from labels
      .replace(/^Page$/, '') // Remove "Page" from labels
      .trim();

    // Special cases for specific paths
    if (label === 'Service Categories') {label = 'Service Categories';}
    if (label === 'Create Category') {label = 'Create Category';}
    if (path.startsWith('[') && path.endsWith(']')) {
      label = 'Details'; // For dynamic routes like [id]
    }

    items.push({
      label: label || 'Home',
      href: i < paths.length - 1 ? accumulatedPath : undefined,
    });
  }

  return items;
}
