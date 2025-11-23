"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarTrigger, SidebarInset} from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load dashboard-specific components for better code splitting
// Since this is a Client Component, dynamic imports work without ssr option
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => ({ default: mod.AppSidebar })));
const NavUser = dynamic(() => import('@/components/nav-user').then(mod => ({ default: mod.NavUser })));
const SessionAlert = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionAlert })));
const SessionTimer = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionTimer })));

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
                            <div className="flex items-center gap-4">
                                <SidebarTrigger className="md:hidden" />
                                <NavUser />
                            </div>
                            <SessionTimer />
                        </header>
                    </div>
                    <main className="p-4">
                        <div className="min-h-[calc(100vh-4rem)]">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
                {/* Session expiration alerts */}
                <SessionAlert />
            </SidebarProvider>
        </ProtectedRoute>
    );
}
