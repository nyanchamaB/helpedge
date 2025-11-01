"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  getDashboardStats,
  getTicketStatusCounts,
  type DashboardStats as DashboardStatsType,
  type TicketStatusCounts,
} from "@/lib/api/dashboard";
import {
  getAllTickets,
  getStatusString,
  getPriorityString,
  getStatusColor,
  getPriorityColor,
  type Ticket,
} from "@/lib/api/tickets";

export default function DashboardStats() {
  // State management
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(
    null
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchDashboardData();
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  async function fetchDashboardData() {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching dashboard data...");

      // Fetch each endpoint separately to better handle individual failures
      // Stats endpoint
      console.log("📊 Fetching dashboard stats...");
      const statsResponse = await getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        console.log("✅ Dashboard stats loaded:", statsResponse.data);
        setStats(statsResponse.data);
      } else {
        console.warn("⚠️ Failed to fetch dashboard stats:", {
          error: statsResponse.error,
          status: statsResponse.status,
          data: statsResponse.data,
        });
      }

      // Status counts endpoint
      console.log("📈 Fetching ticket status counts...");
      const statusCountsResponse = await getTicketStatusCounts();
      if (statusCountsResponse.success && statusCountsResponse.data) {
        console.log("✅ Status counts loaded:", statusCountsResponse.data);

        // Handle backend response format (might be array or object)
        let normalizedCounts;
        if (Array.isArray(statusCountsResponse.data)) {
          // Backend returns array, take first item
          const backendData = statusCountsResponse.data[0] as any;
          normalizedCounts = {
            open: backendData.openTickets || 0,
            inProgress: backendData.inProgressTickets || 0,
            resolved: backendData.resolvedTickets || 0,
            closed: backendData.closedTickets || 0,
          };
        } else if (typeof statusCountsResponse.data === 'object') {
          const backendData = statusCountsResponse.data as any;
          normalizedCounts = {
            open: backendData.openTickets || backendData.open || 0,
            inProgress: backendData.inProgressTickets || backendData.inProgress || 0,
            resolved: backendData.resolvedTickets || backendData.resolved || 0,
            closed: backendData.closedTickets || backendData.closed || 0,
          };
        }

        setStatusCounts(normalizedCounts);
      } else {
        console.warn("⚠️ Failed to fetch status counts:", {
          error: statusCountsResponse.error,
          status: statusCountsResponse.status,
          data: statusCountsResponse.data,
        });
      }

      // Tickets endpoint
      console.log("🎫 Fetching tickets...");
      const ticketsResponse = await getAllTickets();
      if (ticketsResponse.success && ticketsResponse.data) {
        console.log(
          "✅ Tickets loaded:",
          ticketsResponse.data.length,
          "tickets"
        );
        setTickets(ticketsResponse.data);
      } else {
        console.error("❌ Failed to fetch tickets:", {
          error: ticketsResponse.error,
          status: ticketsResponse.status,
          data: ticketsResponse.data,
        });

        // Parse error details if it's a JSON error from backend
        let errorMessage = ticketsResponse.error || "Failed to fetch tickets";

        // Try to extract more details from the error
        if (
          typeof ticketsResponse.data === "object" &&
          ticketsResponse.data !== null
        ) {
          const errorData = ticketsResponse.data as any;
          if (errorData.detail) {
            errorMessage = `${errorData.title || "Error"}: ${errorData.detail}`;
          }
          if (errorData.status === 500) {
            errorMessage += " (Backend server error - check backend logs)";
          }
        }

        setError(errorMessage);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("💥 Unexpected error fetching dashboard data:", err);
      setError("An unexpected error occurred while fetching dashboard data");
      setIsLoading(false);
    }
  }

  // Calculate stats from actual tickets data (source of truth)
  // This ensures accuracy even if API endpoints return incorrect data
  const calculatedCounts = {
    open: tickets.filter((t) => t.status === 0).length,
    inProgress: tickets.filter((t) => t.status === 1).length,
    resolved: tickets.filter((t) => t.status === 2).length,
    closed: tickets.filter((t) => t.status === 3).length,
  };

  // Debug: Log discrepancies between API and calculated counts
  if (statusCounts) {
    const hasDiscrepancy =
      statusCounts.open !== calculatedCounts.open ||
      statusCounts.inProgress !== calculatedCounts.inProgress ||
      statusCounts.resolved !== calculatedCounts.resolved ||
      statusCounts.closed !== calculatedCounts.closed;

    if (hasDiscrepancy) {
      console.warn('⚠️ Status count mismatch detected:');
      console.warn('API counts:', statusCounts);
      console.warn('Calculated from tickets:', calculatedCounts);
      console.warn('Using calculated counts (from actual ticket data)');
    }
  }

  const displayStats = stats || {
    totalTickets: tickets.length,
    openTickets: calculatedCounts.open,
    inProgressTickets: calculatedCounts.inProgress,
    resolvedTickets: calculatedCounts.resolved,
    closedTickets: calculatedCounts.closed,
    totalUsers: 0,
    activeUsers: 0,
    totalCategories: 0,
  };

  // Always use calculated counts from actual ticket data (source of truth)
  const displayStatusCounts = calculatedCounts;

  // Calculate urgent tickets
  const urgentTickets = tickets.filter((t) => t.priority === 3).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state with debugging information
  if (error && tickets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>↻</span>
            <span>Retry</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold text-red-900">
                Error Loading Dashboard Data
              </h2>
              <p className="text-red-800">{error}</p>

              <div className="bg-white rounded-md p-4 text-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Troubleshooting Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Check that the backend API is running</li>
                  <li>
                    Verify the API URL:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "https://helpedge-api.onrender.com"}
                    </code>
                  </li>
                  <li>Check browser console (F12) for detailed error logs</li>
                  <li>
                    Verify you are logged in (check localStorage for
                    &apos;authToken&apos;)
                  </li>
                  <li>
                    Check backend logs for 500 Internal Server Error details
                  </li>
                </ol>
              </div>

              <details className="bg-white rounded-md p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-gray-700">
                  🔍 Technical Details (for developers)
                </summary>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
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
                    localStorage.getItem("authToken")
                      ? "✅ Yes"
                      : "❌ No"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
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
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Available Data (Partial)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats && (
                <>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold">{stats.totalTickets}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </>
              )}
              {statusCounts && (
                <>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-600">Open</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statusCounts.open}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>↻</span>
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          <p className="text-sm">
            <strong>Warning:</strong> {error}
          </p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayStats.totalTickets}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {displayStatusCounts.open}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {displayStatusCounts.resolved}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Urgent Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{urgentTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">
                {stats.activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </CardContent>
          </Card>

          {stats.avgResolutionTime !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.round(stats.avgResolutionTime)}h
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Tickets */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Tickets</h2>
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>No tickets found</p>
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
                    // Navigate to ticket detail
                    window.location.href = `/tickets/${ticket.id}`;
                  }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold truncate flex-1">
                        {ticket.subject || 'No Subject'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        #{ticket.ticketNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.description || 'No description provided'}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
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
      </section>
    </main>
  );
}
