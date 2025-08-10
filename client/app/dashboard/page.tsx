import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cookies } from "next/headers";

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  customerEmail: string;
  customerName?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: string;
}

async function fetchTickets(): Promise<Ticket[]> {
  const cookieStore = cookies();

  const res = await fetch("http://localhost:8000/api/tickets", {
    cache: "no-store",
    headers: {
      Cookie: (await cookieStore).toString(),
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch tickets:", await res.text());
    return [];
  }


  const data = await res.json();
  console.log("Fetched tickets:", data.tickets);
  return data.tickets; // ✅ extract just the array
}

export default async function DashboardPage() {
  const tickets = await fetchTickets();

  return (
    <main className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Support Tickets</h1>

      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const formattedDate = format(new Date(ticket.createdAt), "PPpp");

            const priorityColor: Record<Ticket["priority"], string> = {
              low: "bg-green-100 text-green-800",
              medium: "bg-yellow-100 text-yellow-800",
              high: "bg-orange-100 text-orange-800",
              urgent: "bg-red-100 text-red-800",
            };

            const statusColor: Record<Ticket["status"], string> = {
              open: "bg-blue-100 text-blue-800",
              "in-progress": "bg-purple-100 text-purple-800",
              resolved: "bg-teal-100 text-teal-800",
              closed: "bg-gray-200 text-gray-800",
            };

            return (
              <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 space-y-2">
                    <h2 className="text-lg font-semibold truncate">
                      {ticket.title}
                    </h2>
                    <p className="text-sm text-gray-600 truncate">
                      {ticket.customerName
                        ? `${ticket.customerName} (${ticket.customerEmail})`
                        : ticket.customerEmail}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[ticket.status]}`}
                      >
                        {ticket.status.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[ticket.priority]}`}
                      >
                        {ticket.priority.toUpperCase()}
                      </span>
                      <Badge variant="outline">{ticket.ticketNumber}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}


// import React from "react";
// import Link from "next/link";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

// interface Ticket {
//   _id: string;
//   subject: string;
//   from: string;
//   status: "open" | "pending" | "closed";
//   date?: string;
// }


// async function fetchTickets(): Promise<Ticket[]> {
//   const res = await fetch("http://localhost:3000/api/tickets", {
//     cache: "no-store",
//   });
//   return res.json();
// }

// export default async function DashboardPage() {
//   const tickets = await fetchTickets();

//   return (
//     <main className="p-6 grid gap-4">
//       <h1 className="text-2xl font-bold">Support Tickets</h1>
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {tickets.map((ticket) => {
//           const displayDate = ticket.date
//             ? format(new Date(ticket.date), "PPpp")
//             : "No Date";

//           return (
//             <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
//               <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//                 <CardContent className="p-4">
//                   <h2 className="text-lg font-semibold truncate">
//                     {ticket.subject}
//                   </h2>
//                   <p className="text-sm text-gray-600 truncate">
//                     From: {ticket.from}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-1">{displayDate}</p>
//                   <Badge
//                     variant={
//                       ticket.status === "open"
//                         ? "default"
//                         : ticket.status === "pending"
//                         ? "outline"
//                         : "secondary"
//                     }
//                     className="mt-2"
//                   >
//                     {ticket.status.toUpperCase()}
//                   </Badge>
//                 </CardContent>
//               </Card>
//             </Link>
//           );
//         })}
//       </div>
//     </main>
//   );
// }



// "use client";

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export default function Dashboard() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     // Simulate getting user data from the server or context
//     // In a real app, you might get this from a context or API call
//     const mockUser: User = {
//       id: '1',
//       name: 'Test User',
//       email: 'test@example.com',
//       role: 'user'
//     };
    
//     setUser(mockUser);
//     setLoading(false);
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const response = await fetch('/api/auth/logout', {
//         method: 'POST',
//         credentials: 'include',
//       });

//       if (response.ok) {
//         router.push('/auth/login');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">HelpEdge Dashboard</h1>
//             <p className="text-gray-600">Welcome back, {user?.name}!</p>
//           </div>
//           <Button onClick={handleLogout} variant="outline">
//             Logout
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-blue-600">
//                 🎫 Total Tickets
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">24</div>
//               <p className="text-sm text-gray-500">+3 from last week</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-green-600">
//                 ✅ Resolved
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">18</div>
//               <p className="text-sm text-gray-500">75% resolution rate</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-yellow-600">
//                 ⏳ Pending
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">6</div>
//               <p className="text-sm text-gray-500">Average response: 2h</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="mt-8">
//           <Card>
//             <CardHeader>
//               <CardTitle>User Information</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <p><strong>Name:</strong> {user?.name}</p>
//                 <p><strong>Email:</strong> {user?.email}</p>
//                 <p><strong>Role:</strong> {user?.role}</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }