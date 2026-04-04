'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/app/onboarding/footer').then((mod) => mod.default), {
  ssr: false,
});

// Only show footer on the pages listed in SHOW_FOOTER_ROUTES
const SHOW_FOOTER_ROUTES = [
  '/',
  '/pricing',
  '/GetStarted',
  '/ContactTeam',
  '/resources',
  '/services',
  '/features',
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Only show footer on landing page (root path)
  const shouldShowFooter =
    SHOW_FOOTER_ROUTES.includes(pathname || '') ||           // exact match e.g. /pricing
    SHOW_FOOTER_ROUTES.some((route) =>                      // dynamic match e.g. /resources/guides
      route !== '/' && pathname?.startsWith(route)          // exclude / to avoid matching everything
    );

  if (!shouldShowFooter) {
    return null;
  }

  return <Footer />;
}
