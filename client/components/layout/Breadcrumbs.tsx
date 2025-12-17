"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateBreadcrumbs, collapseBreadcrumbs } from '@/lib/breadcrumbs/utils';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface BreadcrumbsProps {
  /**
   * Custom labels for dynamic routes
   * @example { '/tickets/123': 'Printer Not Working' }
   */
  customLabels?: Record<string, string>;
  /**
   * Maximum number of items to show on mobile before collapsing
   * @default 3
   */
  maxMobileItems?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Hide breadcrumbs on specific paths
   */
  hiddenPaths?: string[];
}

/**
 * Breadcrumbs Navigation Component
 *
 * Automatically generates breadcrumbs from the current route path.
 * Supports dynamic routes, custom labels, and responsive collapsing.
 *
 * @example
 * // Basic usage (auto-generates from current path)
 * <Breadcrumbs />
 *
 * @example
 * // With custom labels for dynamic routes
 * <Breadcrumbs customLabels={{ '/tickets/123': 'Printer Not Working' }} />
 *
 * @example
 * // With hidden paths
 * <Breadcrumbs hiddenPaths={['/settings/profile']} />
 */
export function Breadcrumbs({
  customLabels,
  maxMobileItems = 3,
  className,
  hiddenPaths = [],
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if current path should hide breadcrumbs
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Generate breadcrumb items
  const breadcrumbs = generateBreadcrumbs(pathname, customLabels);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Collapse breadcrumbs on mobile if needed
  const { items: displayItems, hasEllipsis } = isMobile
    ? collapseBreadcrumbs(breadcrumbs, maxMobileItems)
    : { items: breadcrumbs, hasEllipsis: false };

  // Get hidden items for ellipsis dropdown
  const hiddenItems = hasEllipsis
    ? breadcrumbs.slice(1, breadcrumbs.length - 2)
    : [];

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isLast = item.isCurrentPage;
          const showEllipsis = hasEllipsis && index === 1;

          return (
            <div key={item.href} className="contents">
              {/* Show ellipsis dropdown on mobile */}
              {showEllipsis && (
                <>
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex items-center gap-1"
                        aria-label="Show more breadcrumbs"
                      >
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {hiddenItems.map((hiddenItem) => (
                          <DropdownMenuItem key={hiddenItem.href} asChild>
                            <Link href={hiddenItem.href}>
                              {hiddenItem.icon && (
                                <hiddenItem.icon className="h-4 w-4 mr-2" />
                              )}
                              {hiddenItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}

              {/* Regular breadcrumb item */}
              {!showEllipsis && (
                <>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {item.icon && index === 0 && (
                          <item.icon className="h-4 w-4 mr-1 inline-block" />
                        )}
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-1"
                        >
                          {item.icon && index === 0 && (
                            <item.icon className="h-4 w-4" />
                          )}
                          <span>{item.label}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Simple Breadcrumbs Component (No Client-Side JS)
 * Use this for server components when you don't need dynamic behavior
 */
export function SimpleBreadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.label} className="contents">
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
