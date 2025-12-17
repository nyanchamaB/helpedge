"use client";

import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function CreateRequestPage() {
  return (
    <PlaceholderPage
      title="Create Service Request"
      description="Submit a new service request"
      features={[
        "Multi-step request creation wizard",
        "Service category selection",
        "Dynamic form fields based on request type",
        "File and document attachments",
        "Priority and urgency selection",
        "Department and cost center assignment",
        "Request preview before submission",
        "Email confirmation upon submission",
      ]}
    />
  );
}
