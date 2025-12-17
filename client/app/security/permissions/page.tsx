"use client";

import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function PermissionsPage() {
  return (
    <PlaceholderPage
      title="Permissions"
      description="Manage roles and permissions across the system"
      features={[
        "Role-based permission management",
        "Create and edit custom roles",
        "Permission matrix view",
        "User-role assignments",
        "Permission inheritance",
        "Granular access control",
        "Permission audit trail",
        "Bulk permission updates",
      ]}
    />
  );
}
