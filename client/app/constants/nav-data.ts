import {
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Settings,
  Users,
  BadgeCheck,
  HelpCircle,
  LogOut,
  Settings2,
} from "lucide-react";
import { Iconlist } from "../components/icons";

type NavItem = {
  title: string;
  url: string;
  icon: Iconlist;
  items?: { title: string; url: string; roles?: number[] }[];
  roles?: number[]; // allowed roles (0 = superadmin). if omitted -> allowed for all roles
};

export const navData = {
  user: {
    name: "user",
    email: "use@gmail.com",
  //  image: "/avatar.png",
   // plan: "Pro",
   // planHref: "/settings/billing",
  },
  // keep full list here with role restrictions added
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: [0,1,2,3,4] },
    {
      title: "Tickets",
      url: "/tickets",
      icon: MessageCircle,
      roles: [2,3,4],
      items: [
        { title: "All Tickets", url: "/tickets", roles: [2,3,4] },
        { title: "My Tickets", url: "/tickets/my-tickets", roles: [3,4] },
        { title: "Create Ticket", url: "/tickets/create", roles: [4] },
      ],
    },
    { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen, roles: [0,1,2,3,4] },
    { title: "Customers", url: "/customers", icon: Users, roles: [0,1] },
    { title: "Reports", url: "/reports", icon: Calendar, roles: [0,1,2] },
    {
      // Settings: managed by role 0 (superadmin) per request
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: [0],
      items: [
        { title: "Profile", url: "/settings/profile", roles: [0,1,2,3,4] },
        { title: "Team", url: "/settings/team", roles: [0] },
        { title: "Preferences", url: "/settings/preferences", roles: [0,1,2,3,4] },
      ],
    },
    { title: "Help", icon: HelpCircle, roles: [0,1,2,3,4] },
  ] as NavItem[],
};

// utility to get nav filtered by numeric role
export function getNavForRole(role: number) {
  const allowed = (roles?: number[]) => {
    if (!roles || roles.length === 0) return true; 
    return roles.includes(role);
  };

  const filtered = navData.navMain
    .filter((item) => allowed(item.roles))
    .map((item) => {
      if (!item.items) return item;
      const filteredItems = item.items.filter((it) => allowed(it.roles));
      return { ...item, items: filteredItems };
    });

  return { ...navData, navMain: filtered };
}
