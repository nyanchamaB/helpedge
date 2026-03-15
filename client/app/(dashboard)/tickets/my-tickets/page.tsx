"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { getTicketsByCreator, Ticket } from "@/lib/api/tickets";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

/**
 * My Tickets Page
 * Displays tickets created by the current user
 * Available to all users, especially EndUsers
 */
export default function MyTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyTickets();
    }
  }, [authLoading, user]);

  async function fetchMyTickets() {
    if (!user?.id) {
      setError("User ID not found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await getTicketsByCreator(user.id);

    if (response.success && response.data) {
      setTickets(response.data);
    } else {
      setError(response.error || "Failed to load your tickets");
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
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">
            View and track your submitted tickets
          </p>
        </div>
        <Button asChild>
          <Link href="/tickets/create-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchMyTickets}
        title="My Submitted Tickets"
        showFilters={true}
        emptyMessage="You haven't submitted any tickets yet"
      />
    </div>
  );
}
