'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
