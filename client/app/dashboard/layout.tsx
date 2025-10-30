"use client";
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import {redirect, useParams} from 'next/navigation';
import { UserProvider } from '@/hooks/useUser';
//import { ErpSycHandler } from '@/components/erp-sync-handler';
//import { RedirectHandler } from '@/components/redirect-handler';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

interface DashboardLayoutProps {
    children: React.ReactNode;  
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
   // const session = await UserProvider();

   // if (!session?.user) {
    //    redirect('/login');
   // }
   // if (session.user && !session.user.emailVerified) {
    //    redirect('/verify-email');
   // }
    return (
        <UserProvider>
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
        </UserProvider>
    );
}
