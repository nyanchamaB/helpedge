import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Ticket {
  _id: string;
  subject: string;
  from: string;
  status: "open" | "pending" | "closed";
  date?: string;
}


async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch("http://localhost:3000/api/tickets", {
    cache: "no-store",
  });
  return res.json();
}

export default async function DashboardPage() {
  const tickets = await fetchTickets();

  return (
    <main className="p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => {
          const displayDate = ticket.date
            ? format(new Date(ticket.date), "PPpp")
            : "No Date";

          return (
            <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold truncate">
                    {ticket.subject}
                  </h2>
                  <p className="text-sm text-gray-600 truncate">
                    From: {ticket.from}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{displayDate}</p>
                  <Badge
                    variant={
                      ticket.status === "open"
                        ? "default"
                        : ticket.status === "pending"
                        ? "outline"
                        : "secondary"
                    }
                    className="mt-2"
                  >
                    {ticket.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
