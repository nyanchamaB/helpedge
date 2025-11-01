"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
    items?: { title: string; url: string }[];
  }[];
  onItemClick?: () => void;
}

export function NavMain({ items, onItemClick }: NavMainProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          pathname === item.url || pathname.startsWith(item.url + "/");
        const isOpen = openMenus.includes(item.title);

        return (
          <SidebarMenuItem key={item.title}>
            {/* Parent item */}
            <SidebarMenuButton
              asChild
              className={`flex items-center justify-between ${
                isActive ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => {
                if (item.items) {
                  toggleMenu(item.title);
                } else {
                  onItemClick?.();
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <Link href={item.url} className="flex items-center gap-2 w-full">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
                {item.items && (
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

            {/* Submenu items */}
            {item.items && isOpen && (
              <SidebarMenuSub>
                {item.items.map((subItem) => {
                  const subActive = pathname === subItem.url;
                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          href={subItem.url}
                          onClick={onItemClick}
                          className={`flex items-center gap-2 pl-8 text-sm ${
                            subActive
                              ? "text-blue-600 font-medium"
                              : "text-gray-700 hover:text-blue-600"
                          }`}
                        >
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
