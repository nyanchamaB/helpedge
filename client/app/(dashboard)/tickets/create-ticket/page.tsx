"use client";

import { useEffect } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { Spinner } from "@/components/ui/spinner";

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
        <Spinner size="lg" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
