'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
