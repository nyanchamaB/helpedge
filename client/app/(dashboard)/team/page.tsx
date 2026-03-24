"use client";

export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

/**
 * Team Page - Redirects to Team Members
 * Authorization: Admin, ITManager, TeamLead
 */
export default function TeamPage() {
  const { user, isLoading } = useAuth();
  const { navigateTo } = useNavigation();

  const allowedRoles = ["Admin", "ITManager", "TeamLead"];

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        navigateTo("/dashboard");
      } else {
        navigateTo("/team/members");
      }
    }
  }, [isLoading, user, navigateTo]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    </div>
  );
}
