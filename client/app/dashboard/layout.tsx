"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarTrigger, SidebarInset} from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NavigationProvider } from '@/contexts/NavigationContext';

// Lazy load dashboard-specific components for better code splitting
// Since this is a Client Component, dynamic imports work without ssr option
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => ({ default: mod.AppSidebar })));
const NavUser = dynamic(() => import('@/components/nav-user').then(mod => ({ default: mod.NavUser })));
const SessionAlert = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionAlert })));
const SessionTimer = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionTimer })));
const NotificationBell = dynamic(() => import('@/components/layout/NotificationBell').then(mod => ({ default: mod.NotificationBell })));

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            <NavigationProvider>
                <SidebarProvider>
                    {/* Fixed sidebar */}
                    <AppSidebar />

                    {/* Main content area with proper scrolling */}
                    <SidebarInset className="flex flex-col h-screen overflow-hidden">
                        {/* Fixed header */}
                        <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger className="md:hidden" />
                                <NavUser />
                            </div>
                            <div className="flex items-center gap-2">
                                <NotificationBell />
                                <SessionTimer />
                            </div>
                        </header>

                        {/* Scrollable main content */}
                        <main className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="p-4 md:p-6">
                                {/* Page content */}
                                <div className="pb-6">
                                    {children}
                                </div>
                            </div>
                        </main>
                    </SidebarInset>

                    {/* Session expiration alerts */}
                    <SessionAlert />
                </SidebarProvider>
            </NavigationProvider>
        </ProtectedRoute>
    );
}
