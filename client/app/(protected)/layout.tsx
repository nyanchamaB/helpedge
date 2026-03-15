"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
