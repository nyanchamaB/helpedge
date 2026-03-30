'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
