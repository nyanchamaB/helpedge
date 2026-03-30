'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';

export default function ServiceCategoriesLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
