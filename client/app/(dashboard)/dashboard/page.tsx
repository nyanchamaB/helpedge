'use client';

import { MainContentRenderer } from '@/components/layout/MainContentRenderer';

/**
 * Main SPA Page
 * Single-page application that renders different content based on sidebar navigation
 * All navigation happens in the main content area without page reloads
 */
export default function DashboardPage() {
  return <MainContentRenderer />;
}
