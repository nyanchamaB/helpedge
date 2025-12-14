// components/layout/Layout.tsx
'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import {Breadcrumbs} from '@/components/ui/breadcrumbs';
import {BreadcrumbContainer} from './breadcrumb';
import { useBreadcrumbs } from '@/hooks/usebreadcrumb';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const breadcrumbItems = useBreadcrumbs();

  useEffect(() => {
    // Get user info from API or context
    // For now, we'll use mock data
    setUser({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'agent'
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar userRole={user.role} />
        <div className="flex-1">
          <Header user={user} />
          {breadcrumbItems.length > 0 && (
            <BreadcrumbContainer>
              <Breadcrumbs items={breadcrumbItems} />
            </BreadcrumbContainer>
          )}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
