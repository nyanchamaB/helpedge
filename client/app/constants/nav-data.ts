import {
  BookOpen,
  Calendar,
  CreditCard,
  MessageCircle,
  Settings,
  Users,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const navData = {
  user: {
    name: "user",
    email: "use@gmail.com",
    image: "/default-avatar.png",
  },

  // Role-based navigation
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      role: ["admin", "agent", "enduser"], // visible to everyone
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: MessageCircle,
      role: ["admin", "agent", "enduser"], // all have access, but child items differ
      items: [
        { title: "All Tickets", url: "/tickets", roles: ["admin"] },
        { title: "Assigned Tickets", url: "/tickets/assigned", roles: ["agent"] },
        { title: "My Tickets", url: "/tickets/my-tickets", roles: ["enduser"] },
        { title: "Create Ticket", url: "/tickets/create", roles: ["enduser"] },
      ],
    },
    {
      title: "Knowledge Base",
      url: "/knowledge-base",
      icon: BookOpen,
      role: ["admin", "agent", "enduser"],
    },
    {/*{
      title: "Customers",
      url: "/customers",
      icon: Users,
      roles: ["admin"], // only admins
    },
    */},
    {
      title: "Reports",
      url: "/reports",
      icon: Calendar,
      role: ["admin", "agent"], // admins & agents
    },
    {/*
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
      roles: ["admin"], // only admins
    },
    */},
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      role: ["admin", "agent", "enduser"],
      items: [
        { title: "Profile", url: "/settings/profile", roles: ["admin", "agent", "enduser"] },
        { title: "Team", url: "/settings/team", roles: ["admin"] },
        { title: "Preferences", url: "/settings/preferences", roles: ["admin", "agent", "enduser"] },
      ],
    },
    {
      title: "Help",
      url: siteConfig.links.docs,
      icon: HelpCircle,
      role: ["admin", "agent", "enduser"],
    },
  ],
};
