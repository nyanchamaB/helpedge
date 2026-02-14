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
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { navData } from "@/app/constants/nav-data"; 
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { UserRole } from "@/lib/api/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const { setOpenMobile } = useSidebar(); 

  // Default to EndUser if no role is found
  const userRole: UserRole = user?.role || "EndUser";
  const handleNavItemClick = () => {
    setOpenMobile(false); // Close mobile sidebar when a nav item is clicked (for better UX on mobile)
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={handleNavItemClick}> 
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <img
                    src={siteConfig.logo}
                    alt="HelpEdge Logo"
                    className="h-full w-full relative object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {siteConfig.name}
                  </span>
                  {/*<span className="truncate text-xs">Help Desk</span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isLoading && <NavMain items={navData.navMain} userRole={userRole} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
