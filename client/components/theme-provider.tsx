// components/theme-provider.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';

const DARK_MODE_ROUTES = [
  '/dashboard',
  '/tickets',
  '/service-requests',
  '/service-categories',
  '/team',
  '/reports',
  '/systems',
  '/security',
  '/knowledge-base',
  '/settings',
];

export default function ThemeProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDarkModeRoute = DARK_MODE_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={isDarkModeRoute ? undefined : 'light'}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
