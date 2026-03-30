// for navigation icon in mobile view
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icons as _Icons, IconsList } from '@/components/icons';
import { usePathname } from 'next/navigation';
import _Link from 'next/link';
import { buttonVariants as _buttonVariants } from '@/components/ui/button';

export function MobileNavIcon() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        'p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary',
        open ? 'bg-primary/10' : 'bg-transparent',
        !isHomePage && 'mr-2',
      )}
      aria-label="Toggle Menu"
    >
      {open ? <IconsList.close className="h-6 w-6" /> : <IconsList.menu className="h-6 w-6" />}
    </button>
  );
}
