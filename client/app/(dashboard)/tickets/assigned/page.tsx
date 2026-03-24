"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { getTicketsByAssignee, Ticket } from "@/lib/api/tickets";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { Spinner } from "@/components/ui/spinner";

/**
 * Assigned Tickets Page
 * Displays tickets assigned to the current user for support roles:
 * - ServiceDeskAgent: First-line support
 * - Technician: Second-line support
 * - SecurityAdmin: Security requests
 * - SystemAdmin: System-related tickets
 * - TeamLead: Can view their assigned tickets
 */
export default function AssignedTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Roles that can access assigned tickets
  const allowedRoles = [
    "ServiceDeskAgent",
    "Technician",
    "SecurityAdmin",
    "SystemAdmin",
    "TeamLead",
    "Admin",
    "ITManager",
  ];

  useEffect(() => {
    // Check authorization after auth loading completes
    if (!authLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their tickets
        navigateTo("/tickets/my-tickets");
        return;
      }
      fetchAssignedTickets();
    }
  }, [authLoading, user, navigateTo]);

  async function fetchAssignedTickets() {
    if (!user?.id) {
      setError("User ID not found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await getTicketsByAssignee(user.id);

    if (response.success && response.data) {
      setTickets(response.data);
    } else {
      setError(response.error || "Failed to load assigned tickets");
    }

    setIsLoading(false);
  }

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-500">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assigned to Me</h1>
          <p className="text-muted-foreground">
            Tickets assigned to you for resolution
          </p>
        </div>
      </div>

      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchAssignedTickets}
        title="My Assigned Tickets"
        showFilters={true}
        emptyMessage="No tickets are currently assigned to you"
      />
    </div>
  );
}
