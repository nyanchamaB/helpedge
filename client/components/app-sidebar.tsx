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
import { NavMainSPA } from "@/components/nav-main-spa";
import { NavUser } from "@/components/nav-user";
import { navData } from "@/app/constants/nav-data";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { siteConfig } from "@/config/site";
import { UserRole } from "@/lib/api/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const { navigateTo } = useNavigation();
  // Default to EndUser if no role is found
  const userRole: UserRole = user?.role || "EndUser";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/dashboard');
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={handleLogoClick}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                <img
                  src={siteConfig.logo}
                  alt="HelpEdge Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {siteConfig.name}
                </span>
                <span className="truncate text-xs">Help Desk</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isLoading && <NavMainSPA items={navData.navMain} userRole={userRole} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
