'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavMainSPA } from '@/components/nav-main-spa';
import { NavUser } from '@/components/nav-user';
import { navData } from '@/app/constants/nav-data';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { siteConfig } from '@/config/site';
import { UserRole } from '@/lib/api/auth';
import { Link } from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const { setOpenMobile } = useSidebar();

  // Default to EndUser if no role is found
  const userRole: UserRole = user?.role || 'EndUser';
  const handleNavItemClick = () => {
    setOpenMobile(false); // Close mobile sidebar when a nav item is clicked (for better UX on mobile)
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between w-full p-2">
          {/* Logo + Company Name */}
          <Link
            href="/dashboard"
            onClick={handleNavItemClick}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="size-8 rounded-lg overflow-hidden flex-shrink-0 group-data-[state=collapsed]:hidden">
              <img
                src={siteConfig.logo}
                alt="HelpEdge Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
              <span className="truncate font-semibold">{siteConfig.name}</span>
            </div>
          </Link>
          {/* Close button */}
          <SidebarTrigger className="flex-shrink-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {!isLoading && <NavMainSPA items={navData.navMain} userRole={userRole} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
        {/* <div className="grid flex-1 text-left text-sm leading-tight mt-5">
                  <span className="truncate font-semibold">
                    {siteConfig.name}
                  </span>
          </div> 
          */}
      </SidebarFooter>
    </Sidebar>
  );
}
