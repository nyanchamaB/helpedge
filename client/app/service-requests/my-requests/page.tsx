"use client";

import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function MyRequestsPage() {
  return (
    <PlaceholderPage
      title="My Requests"
      description="View and track your service requests"
      features={[
        "View all your submitted service requests",
        "Track request status and progress",
        "Receive notifications on request updates",
        "Add comments and attachments",
        "Cancel or modify pending requests",
        "View request history and timeline",
        "Rate completed services",
        "Request status filters and search",
      ]}
    />
  );
}
