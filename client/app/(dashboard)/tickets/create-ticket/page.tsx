"use client";

import { useEffect } from "react";
import { useNavigation } from "@/contexts/NavigationContext";

/**
 * Redirect /tickets/create-ticket → dashboard SPA submit ticket route.
 * This page exists only to catch direct URL access to this Next.js route.
 */
export default function CreateTicketRedirect() {
  const { navigateTo } = useNavigation();

  useEffect(() => {
    navigateTo("/portal/create-ticket");
  }, [navigateTo]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
