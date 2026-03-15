"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { NavigationProvider } from '@/contexts/NavigationContext';
// modetoggle and session timer are client components, so we need to dynamically import them to avoid hydration issues
const ModeToggle = dynamic(() => import('@/components/mode-toggle').then(mod => ({ default: mod.ModeToggle })));
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => ({ default: mod.AppSidebar })));
const SessionAlert = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionAlert })));
const SessionTimer = dynamic(() => import('@/components/auth/SessionAlert').then(mod => ({ default: mod.SessionTimer })));
interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <NavigationProvider>
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                
                <SidebarInset>
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                       {/*} <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" /> */}

                        {/* Breadcrumbs */}
                        <div className="flex-1">
                            <Breadcrumb />
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Search className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                            </Button>

                            <SessionTimer />
                            <ModeToggle />
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        <div className="min-h-[calc(100vh-4rem)]">
                            {children}
                        </div>
                    </main>
                </SidebarInset>

                <SessionAlert />
            </SidebarProvider>
        </ProtectedRoute>
        </NavigationProvider>
    );
}