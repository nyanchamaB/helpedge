import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Ticket {
  _id: string;
  title: string;
  customerEmail: string;
  customerName?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: string;
}

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch("http://localhost:5000/api/tickets", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.tickets;
}

export default async function AdminDashboard() {
  const tickets = await fetchTickets();

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const urgentTickets = tickets.filter((t) => t.priority === "urgent").length;

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTickets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{openTickets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{urgentTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Tickets</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.slice(0, 6).map((ticket) => {
            const formattedDate = format(new Date(ticket.createdAt), "PPpp");

            return (
              <Card key={ticket._id} className="hover:shadow-lg transition">
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold truncate">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {ticket.customerName
                      ? `${ticket.customerName} (${ticket.customerEmail})`
                      : ticket.customerEmail}
                  </p>
                  <p className="text-xs text-gray-500">{formattedDate}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="outline">{ticket.status.toUpperCase()}</Badge>
                    <Badge>{ticket.priority.toUpperCase()}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
