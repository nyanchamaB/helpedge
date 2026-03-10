"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
