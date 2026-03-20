"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  getDashboardStats,
  type DashboardStats as DashboardStatsType,
} from "@/lib/api/dashboard";
import {
  getAllTickets,
  getTicketsByAssignee,
  getTicketsByCreator,
  getStatusString,
  getPriorityString,
  getStatusColor,
  getPriorityColor,
  type Ticket,
} from "@/lib/api/tickets";
import { getAuthToken } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ticket as TicketIcon,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";

// Roles that can access /api/Dashboard/stats
const DASHBOARD_STATS_ROLES = [
  "Admin",
  "ITManager",
  "TeamLead",
  "ServiceDeskAgent",
  "Technician",
  "SecurityAdmin",
];

export default function DashboardStats() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  // State management
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user can access dashboard stats API
  const canAccessDashboardStats = user && DASHBOARD_STATS_ROLES.includes(user.role);
  const isEndUser = user?.role === "EndUser";
  const isSystemAdmin = user?.role === "SystemAdmin";

  // Fetch dashboard data on mount
  useEffect(() => {
    let mounted = true;

    if (mounted && user) {
      fetchDashboardData();
    }

    return () => {
      mounted = false;
    };
  }, [user]); // Re-fetch when user changes

  async function fetchDashboardData() {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching dashboard data for role:", user.role);

      // Fetch dashboard stats only for authorized roles
      if (canAccessDashboardStats) {
        console.log("📊 Fetching dashboard stats...");
        const statsResponse = await getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          console.log("✅ Dashboard stats loaded:", statsResponse.data);
          setStats(statsResponse.data);
        } else {
          console.warn("⚠️ Failed to fetch dashboard stats:", {
            error: statsResponse.error,
            status: statsResponse.status,
          });
        }
      }

      // Fetch tickets based on user role
      let ticketsResponse;

      if (isEndUser) {
        // EndUser: Show only their own created tickets
        console.log("🎫 Fetching tickets created by user...");
        ticketsResponse = await getTicketsByCreator(user.id);
      } else if (isSystemAdmin) {
        // SystemAdmin: Show tickets assigned to them
        console.log("🎫 Fetching tickets assigned to SystemAdmin...");
        ticketsResponse = await getTicketsByAssignee(user.id);
      } else {
        // Other roles: Show all tickets
        console.log("🎫 Fetching all tickets...");
        ticketsResponse = await getAllTickets();
      }

      if (ticketsResponse.success && ticketsResponse.data) {
        console.log("✅ Tickets loaded:", ticketsResponse.data.length, "tickets");
        setTickets(ticketsResponse.data);
      } else {
        console.error("❌ Failed to fetch tickets:", ticketsResponse.error);
        setError(ticketsResponse.error || "Failed to fetch tickets");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("💥 Unexpected error fetching dashboard data:", err);
      setError("An unexpected error occurred while fetching dashboard data");
      setIsLoading(false);
    }
  }

  // Calculate stats from actual tickets data
  const calculatedCounts = {
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "InProgress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
    closed: tickets.filter((t) => t.status === "Closed").length,
    onHold: tickets.filter((t) => t.status === "OnHold").length,
  };

  // Calculate critical and high priority tickets
  const criticalTickets = tickets.filter((t) => t.priority === "Critical").length;
  const highPriorityTickets = tickets.filter((t) => t.priority === "High").length;

  // Get today's tickets from the tickets list
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTicketsFromList = tickets.filter((t) => {
    const createdDate = new Date(t.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return createdDate.getTime() === today.getTime();
  }).length;

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    if (isEndUser) return "My Tickets Dashboard";
    if (isSystemAdmin) return "My Assigned Tickets";
    return "Dashboard";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state with debugging information
  if (error && tickets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>↻</span>
            <span>Retry</span>
          </button>
        </div>

        <div className="bg-red-100 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-red-600 dark:text-red-400 text-2xl">⚠️</div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100">
                Error Loading Dashboard Data
              </h2>
              <p className="text-red-800 dark:text-red-200">{error}</p>

              <div className="bg-card rounded-md p-4 text-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Troubleshooting Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-foreground">
                  <li>Check that the backend API is running</li>
                  <li>
                    Verify the API URL:{" "}
                    <code className="bg-muted px-1 rounded">
                      {process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "https://helpedge-api.onrender.com"}
                    </code>
                  </li>
                  <li>Check browser console (F12) for detailed error logs</li>
                  <li>
                    Verify you are logged in (check cookies for
                    &apos;authToken&apos;)
                  </li>
                  <li>
                    Check backend logs for 500 Internal Server Error details
                  </li>
                </ol>
              </div>

              <details className="bg-card rounded-md p-4">
                <summary className="cursor-pointer font-semibold text-foreground hover:text-muted-foreground">
                  🔍 Technical Details (for developers)
                </summary>
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <p>
                    <strong>API Base URL:</strong>{" "}
                    {process.env.NEXT_PUBLIC_API_BASE_URL ||
                      "https://helpedge-api.onrender.com"}
                  </p>
                  <p>
                    <strong>Endpoint:</strong> GET /api/Tickets
                  </p>
                  <p>
                    <strong>Error:</strong> {error}
                  </p>
                  <p>
                    <strong>Token Present:</strong>{" "}
                    {typeof window !== "undefined" &&
                    getAuthToken()
                      ? "✅ Yes"
                      : "❌ No"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Check the browser console for full error details and network
                    requests.
                  </p>
                </div>
              </details>

              <div className="flex gap-2">
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/auth/login")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Re-login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Show partial stats if available */}
        {(stats || statusCounts) && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Available Data (Partial)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats && (
                <>
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{stats.totalTickets}</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </>
              )}
              {statusCounts && (
                <>
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statusCounts.open}
                    </p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {statusCounts.resolved}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getDashboardTitle()}</h1>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {user.name} ({user.role})
            </p>
          )}
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-md">
          <p className="text-sm">
            <strong>Warning:</strong> {error}
          </p>
        </div>
      )}

      {/* Organization Stats - Only for authorized roles */}
      {canAccessDashboardStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalTickets}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-500" />
                Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.openTickets}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgressTickets}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.resolvedTickets ?? stats.rlvedTickets}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">{stats.todayTickets}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket Status Summary - For all users (based on their visible tickets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{calculatedCounts.open}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{calculatedCounts.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{calculatedCounts.resolved}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{calculatedCounts.closed}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{criticalTickets}</p>
            {highPriorityTickets > 0 && (
              <p className="text-sm text-orange-600">{highPriorityTickets} high</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {isEndUser ? "My Recent Tickets" : isSystemAdmin ? "My Assigned Tickets" : "Recent Tickets"}
        </h2>
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isEndUser ? "You haven't created any tickets yet" : "No tickets found"}</p>
              {isEndUser && (
                <button
                  onClick={() => navigateTo("/portal/create-ticket")}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First Ticket
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.slice(0, 6).map((ticket) => {
              const formattedDate = format(new Date(ticket.createdAt), "PPpp");

              return (
                <Card
                  key={ticket.id}
                  className="hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    window.location.href = `/tickets/${ticket.id}`;
                  }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold truncate flex-1">
                        {ticket.subject || "No Subject"}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2">
                        #{ticket.ticketNumber}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description || "No description provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={getStatusColor(ticket.status)}
                      >
                        {getStatusString(ticket.status).toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityString(ticket.priority).toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {tickets.length > 6 && (
          <div className="mt-4 text-center">
            <a
              href={isEndUser ? "/tickets/my-tickets" : "/tickets"}
              className="text-blue-600 hover:underline"
            >
              View all {tickets.length} tickets
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
