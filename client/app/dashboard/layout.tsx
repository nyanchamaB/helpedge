"use client";
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { NavUser } from '@/components/nav-user';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div>
                        <header className="flex items-center justify-between p-4 border-b">
                            <div className="text-lg font-semibold">
                            <SidebarTrigger className="md:hidden" />
                            <NavUser />
                            </div>
                        </header>
                    </div>
                        <main className="p-4">
                            <div className ="min-h-[calc(100vh-4rem)]">
                                {children}
                            </div>
                        </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
