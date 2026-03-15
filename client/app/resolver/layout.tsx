"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export default function ResolverLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
