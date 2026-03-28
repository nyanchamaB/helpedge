"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}