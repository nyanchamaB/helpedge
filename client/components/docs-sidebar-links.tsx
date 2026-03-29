// components/docs-sidebar-link.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DocsSidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'block text-sm rounded-md px-3 py-1.5 transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-950'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      {label}
    </Link>
  );
}
