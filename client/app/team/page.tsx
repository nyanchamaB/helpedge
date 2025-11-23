"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Team Page - Redirects to Team Members
 * Authorization: Admin, ITManager, TeamLead
 */
export default function TeamPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const allowedRoles = ["Admin", "ITManager", "TeamLead"];

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard");
      } else {
        router.push("/team/members");
      }
    }
  }, [isLoading, user, router]);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    </div>
  );
}
