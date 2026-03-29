'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  items?: NavSubItem[];
}

interface NavMainProps {
  items: NavItem[];
  userRole: string | UserRole;
  onItemClick?: () => void;
}

export function NavMain({ items, userRole, onItemClick }: NavMainProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  // Filter items based on role (handle both 'role' and 'roles' for sub-items)
  const filteredItems = items
    .filter((item) => !item.role || item.role.includes(userRole as UserRole))
    .map((item) => ({
      ...item,
      items: item.items
        ? item.items.filter((sub) => !sub.roles || sub.roles.includes(userRole as UserRole))
        : [],
    }));

  // Auto-expand parent menu when child is active
  React.useEffect(() => {
    const menusToOpen: string[] = [];

    filteredItems.forEach((item) => {
      if (item.items && item.items.length > 0) {
        const hasActiveChild = item.items.some((sub) => pathname === sub.url);

        if (hasActiveChild) {
          menusToOpen.push(item.title);
        }
      }
    });
    if (menusToOpen.length > 0) {
      setOpenMenus((prev) => [...new Set([...prev, ...menusToOpen])]);
    }
  }, [pathname, filteredItems]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
        const isOpen = openMenus.includes(item.title);

        return (
          <SidebarMenuItem key={`main-${item.title}`}>
            {/* Parent item */}
            <SidebarMenuButton
              asChild
              className={`flex items-center justify-between ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                if (item.items && item.items.length > 0) {
                  toggleMenu(item.title);
                } else {
                  onItemClick?.();
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <Link href={item.url} className="flex items-center gap-2 w-full">
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[state=collapsed]:hidden">{item.title}</span>
                </Link>
                {item.items && item.items.length > 0 && (
                  <span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    ) : (
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </SidebarMenuButton>

            {/* Submenu */}
            {item.items && isOpen && (
              <SidebarMenuSub key={`sub-${item.title}`}>
                {item.items.map((subItem) => {
                  const subActive = pathname === subItem.url;

                  return (
                    <SidebarMenuSubItem key={`sub-${item.title}-${subItem.title}`}>
                      <SidebarMenuSubButton asChild className={subActive ? 'bg-blue-50' : ''}>
                        <Link
                          href={subItem.url}
                          onClick={onItemClick}
                          className={`flex items-center gap-2 pl-8 text-sm ${
                            subActive
                              ? 'text-blue-700 font-semibold'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${subActive ? 'bg-blue-700' : 'bg-transparent'}`}
                          />
                          {subItem.title}
                        </Link>
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
