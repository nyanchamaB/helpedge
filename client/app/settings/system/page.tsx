"use client";

import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function SystemSettingsPage() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure global system settings and preferences"
      features={[
        "General system configuration",
        "Email server settings",
        "Authentication and security settings",
        "SLA configuration",
        "Workflow automation rules",
        "Integration settings",
        "Backup and maintenance",
        "Feature toggles and flags",
      ]}
    />
  );
}
