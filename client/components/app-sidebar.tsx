"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { navData } from "@/app/constants/nav-data";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user: userData, isLoading } = useUser();
  const decodedRoles = userData?.decodedToken?.roles;
  const userRole =
    Array.isArray(decodedRoles) ? decodedRoles[0] ?? "end_user" : decodedRoles ?? "end_user";

  return (
    <Sidebar
      className={className}
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground p-2">
                  <span className="text-lg font-bold">{siteConfig.name[0].toUpperCase()}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isLoading && (
          <NavMain
            items={navData.navMain}
            userRole={userRole}
          />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
