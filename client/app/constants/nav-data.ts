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
import { siteConfig } from "@/config/site";

export const navData = {
  user: {
    name: "user",
    email: "use@gmail.com",
    image: "/default-avatar.png",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Tickets",
      url: "/tickets",
      icon: MessageCircle,
      items: [
        { title: "All Tickets", url: "/tickets" },
        { title: "My Tickets", url: "/tickets/my-tickets" },
        { title: "Create Ticket", url: "/tickets/create" },
      ],
    },
    { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
    { title: "Customers", url: "/customers", icon: Users },
    { title: "Reports", url: "/reports", icon: Calendar },
    { title: "Billing", url: "/billing", icon: CreditCard },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        { title: "Profile", url: "/settings/profile" },
        { title: "Team", url: "/settings/team" },
        { title: "Preferences", url: "/settings/preferences" },
      ],
    },
    { title: "Help", url: siteConfig.links.docs, icon: HelpCircle },
  ],
};
