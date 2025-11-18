"use client";
import { TicketForm } from "@/common/form/TicketForm";
import { useTicketsByCreator } from "@/apiClient/tickets";
import { useSession } from "next-auth/react";

export default function MyTickets() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const { data: tickets, isLoading, error } = useTicketsByCreator(userId as string );

  // Handle session loading
  if (status === "loading") return <h1>Loading session...</h1>;
  if (!userId) return <h1>No user found.</h1>;


  if (isLoading) return <h1>Loading tickets...</h1>;
  if (error) return <h1>Failed to load tickets.</h1>;
  if (!tickets || tickets.length === 0) return <h1>No tickets found.</h1>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">My Tickets</h1>
      <p className="text-gray-600 mb-6">
        View and manage your IT service tickets here.
      </p>
      <section className="mt-8">
         {tickets.map((ticket: any) => (
           <TicketForm key={ticket.id} defaultValues={ticket} isDisabled={true} />
         ))}      
         
      </section>
    </div>
  );
}
