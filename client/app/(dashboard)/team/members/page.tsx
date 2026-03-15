"use client";

import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function TeamMembersPage() {
  return (
    <PlaceholderPage
      title="Team Members"
      description="View and manage team members and their roles"
      features={[
        "View all team members with role information",
        "Search and filter by department or role",
        "Add or remove team members",
        "Assign roles and permissions",
        "Track member availability status",
        "View workload and task assignments",
        "Manage team hierarchy",
        "Export team roster",
      ]}
    />
  );
}
