"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
