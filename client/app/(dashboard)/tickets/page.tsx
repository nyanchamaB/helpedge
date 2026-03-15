"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { getAllTickets, Ticket } from "@/lib/api/tickets";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";

/**
 * All Tickets Page
 * Displays all tickets in the system for authorized roles:
 * - Admin: Full access to all tickets
 * - ITManager: Full access to all tickets
 * - TeamLead: Access to team tickets
 * - ServiceDeskAgent: Access to queue and assigned tickets
 */
export default function AllTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Roles that can access all tickets
  const allowedRoles = ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"];

  useEffect(() => {
    // Check authorization after auth loading completes
    if (!authLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their tickets
        navigateTo("/tickets/my-tickets");
        return;
      }
      fetchTickets();
    }
  }, [authLoading, user, navigateTo]);

  async function fetchTickets() {
    setIsLoading(true);
    setError(null);

    const response = await getAllTickets();

    if (response.success && response.data) {
      setTickets(response.data);
    } else {
      setError(response.error || "Failed to load tickets");
    }

    setIsLoading(false);
  }

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Tickets</h1>
          <p className="text-muted-foreground">
            View and manage all tickets in the system
          </p>
        </div>
      </div>

      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchTickets}
        title="All Tickets"
        showFilters={true}
        emptyMessage="No tickets found in the system"
      />
    </div>
  );
}
