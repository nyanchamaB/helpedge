import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { format } from "date-fns";

interface Ticket {
  _id: string;
  subject: string;
  from?: string;
  to: string[];
  cc?: string[];
  date?: string;
  body: string;
  status: "open" | "pending" | "closed";
  sender?: string;
  priority?: string;
  source?: string;
  createdAt?: string;
}

async function getTicket(id: string): Promise<Ticket | null> {
  const res = await fetch(`http://localhost:3000/api/tickets/${id}`, {
    next: { revalidate: 1 },
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await getTicket(params.id);
  if (!ticket) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{ticket.subject}</span>
            <Badge
              variant={
                ticket.status === "closed"
                  ? "destructive"
                  : ticket.status === "pending"
                  ? "secondary"
                  : "default"
              }
            >
              {ticket.status}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            From: {ticket.from}{" "}
            {ticket.date || ticket.createdAt ? (
              <>
                | {format(new Date(ticket.date ?? ticket.createdAt!), "PPpp")}
              </>
            ) : null}
          </p>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed border rounded-md p-4 bg-muted">
            {ticket.body}
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="secondary">Mark as Pending</Button>
            <Button variant="destructive">Close Ticket</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
