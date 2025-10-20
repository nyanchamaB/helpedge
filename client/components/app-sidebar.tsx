import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarHeader, SidebarFooter} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, signIn } from 'next-auth/react';
// import { toast } from 'sonner';          
import { useUser } from '@/hooks/useUser';
import {  RoleSwitcher } from '@/components/role-switcher';
//import {MobileRoleSwitcher} from '@/components/mobile-role-switcher';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useSidebar } from '@/components/ui/sidebar';
//import { MobileRoleSwitcher } from './mobile-role-switcher';
import { navData } from '@/app/constants/nav-data';



export function AppSidebar({...props } : React.ComponentProps<typeof Sidebar>) {
  const {setOpenMobile } = useSidebar();
  const {user, userData, isLoading } = useUser();

  const handleItemClick = React.useCallback(() => {
    setOpenMobile(false);
  }, [setOpenMobile]);

    return (
    <Sidebar collapsible = "icon" {...props}>
        <SidebarHeader>
            <RoleSwitcher className="hidden md:inline-flex" />
        </SidebarHeader>
        <SidebarContent>   
            <NavMain items={navData.navMain} onItemClick={handleItemClick} />
            </SidebarContent>
        <SidebarContent>
            <SidebarFooter>
                {userData && (
                    <NavUser/>
                )}
                <Button variant="destructive" className="w-full justify-start" onClick={() => signOut({ callbackUrl: '/' })}>
                    Sign Out
                </Button>
            </SidebarFooter>
        </SidebarContent>
    </Sidebar>
  );
}


