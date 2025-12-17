"use client";

import * as React from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { UserRole } from "@/lib/api/auth";

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

export function NavMainSPA({ items, userRole, onItemClick }: NavMainProps) {
  const { activePage, navigateTo } = useNavigation();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  // Filter items based on role
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
  }, [activePage]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
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

        return (
          <SidebarMenuItem key={`main-${item.title}`}>
            {/* Parent item */}
            <SidebarMenuButton
              className={`flex items-center justify-between ${
                isActive ? "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100" : "hover:bg-gray-50"
              }`}
              onClick={(e) => {
                if (item.items && item.items.length > 0) {
                  toggleMenu(item.title);
                } else {
                  handleNavigation(item.url, e);
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-700" : ""}`} />
                  <span>{item.title}</span>
                </div>
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
                  const subActive = activePage === subItem.url;
                  return (
                    <SidebarMenuSubItem
                      key={`sub-${item.title}-${subItem.title}`}
                    >
                      <SidebarMenuSubButton
                        className={subActive ? "bg-blue-50" : ""}
                        onClick={(e) => handleNavigation(subItem.url, e)}
                      >
                        <div
                          className={`flex items-center gap-2 pl-8 text-sm ${
                            subActive
                              ? "text-blue-700 font-semibold"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${subActive ? "bg-blue-700" : "bg-transparent"}`} />
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
