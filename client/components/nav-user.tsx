"use client";

import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/useUser";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Settings2,
  HelpCircle,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { getLastReturnPath } from "@/lib/path-storage";

export function NavUser() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(pathname);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const selectedRole = user?.decodedToken?.role || null;

  if (isLoading) return null;
  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
             // variant="ghost"
              className="data-[state=open]:bg-secondary w-full justify-start"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src={user.decodedToken?.avatarUrl || "/default-avatar.png"}
                  alt={user.session.user?.name || "User Avatar"}
                />
                <AvatarFallback>
                  {user.session.user?.name
                    ? user.session.user.name.charAt(0)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium">
                  {user.session.user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.session.user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage
                    src={user.decodedToken?.avatarUrl || "/default-avatar.png"}
                    alt={user.session.user?.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {user.session.user?.name
                      ? user.session.user.name.charAt(0)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium">
                    {user.session.user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.session.user?.email}
                  </span>
                  {selectedRole && (
                    <span className="text-xs text-muted-foreground capitalize">
                      Role: {selectedRole.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings2 />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
                const returnPath = getLastReturnPath() || currentPath;
                signOut({ callbackUrl: `${window.location.origin}/login?returnPath=${encodeURIComponent(returnPath)}` });
                // router.push('/login'); // Redirect to login after sign out 
              }}
            >
              <LogOut />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
