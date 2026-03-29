'use client';

import * as React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { UserRole } from '@/lib/api/auth';

interface NavSubItem {
  title: string;
  url: string;
  roles?: string[] | UserRole[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  role?: string[] | UserRole[];
  roles?: string[] | UserRole[];
  items?: NavSubItem[];
}

interface NavMainProps {
  items: NavItem[];
  userRole: string | UserRole;
  onItemClick?: () => void;
}

export function NavMainSPA({ items, userRole, onItemClick }: NavMainProps) {
  const { activePage, navigateTo } = useNavigation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  // Filter items based on role
  const filteredItems = items
    .filter((item) => {
      const allowedRoles = item.roles ?? item.role;

      return !allowedRoles || allowedRoles.includes(userRole as UserRole);
    })
    .map((item) => ({
      ...item,
      items: item.items
        ? item.items.filter((sub) => !sub.roles || sub.roles.includes(userRole as UserRole))
        : [],
    }));

  // Close all open menus when sidebar collapses to icon mode
  React.useEffect(() => {
    if (isCollapsed) {
      setOpenMenus([]);
    }
  }, [isCollapsed]);

  // Auto-expand parent menu when child is active
  React.useEffect(() => {
    if (isCollapsed) {return;}
    const menusToOpen: string[] = [];

    filteredItems.forEach((item) => {
      if (item.items && item.items.length > 0) {
        const hasActiveChild = item.items.some((sub) => activePage === sub.url);

        if (hasActiveChild && !openMenus.includes(item.title)) {
          menusToOpen.push(item.title);
        }
      }
    });
    if (menusToOpen.length > 0) {
      setOpenMenus((prev) => [...new Set([...prev, ...menusToOpen])]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, isCollapsed]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  const handleNavigation = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo(url);
    onItemClick?.();
  };

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
        const isActive = activePage === item.url;
        const isOpen = openMenus.includes(item.title);
        const hasChildren = item.items && item.items.length > 0;

        return (
          <SidebarMenuItem key={`main-${item.title}`}>
            {/* Parent item */}
            <SidebarMenuButton
              className={
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/30'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }
              onClick={(e) => {
                if (hasChildren) {
                  toggleMenu(item.title);
                } else {
                  handleNavigation(item.url, e);
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-blue-700 dark:text-blue-300' : ''
                    }`}
                  />
                  <span className="truncate">{item.title}</span>
                </div>
                {/* Only show chevron when sidebar is expanded */}
                {hasChildren && !isCollapsed && (
                  <span className="shrink-0 ml-auto">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    ) : (
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </SidebarMenuButton>

            {/* Submenu — only render when open AND sidebar is expanded */}
            {hasChildren && isOpen && !isCollapsed && (
              <SidebarMenuSub key={`sub-${item.title}`}>
                {item.items.map((subItem) => {
                  const subActive = activePage === subItem.url;

                  return (
                    <SidebarMenuSubItem key={`sub-${item.title}-${subItem.title}`}>
                      <SidebarMenuSubButton
                        className={
                          subActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                            : 'hover:bg-sidebar-accent'
                        }
                        onClick={(e) => handleNavigation(subItem.url, e)}
                      >
                        <div
                          className={`flex items-center gap-2 pl-8 text-sm ${
                            subActive
                              ? 'text-blue-700 dark:text-blue-300 font-semibold'
                              : 'text-sidebar-foreground hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                              subActive
                                ? 'bg-blue-700 dark:bg-blue-400'
                                : 'bg-sidebar-foreground/30'
                            }`}
                          />
                          {subItem.title}
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
