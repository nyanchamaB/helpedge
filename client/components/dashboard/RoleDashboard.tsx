"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_DESCRIPTIONS } from "@/lib/api/auth";
import {
  getDashboardStats,
  getTicketStatusCounts,
  getTeamStats,
  getMySLA,
  getMyTicketsDashboard,
  getMyStats,
  getDetailedHealth,
  type DashboardStats,
  type TicketStatusCounts,
  type TeamStats,
  type SLAStats,
  type MyTicketsDashboard,
  type MyStats,
  type DetailedHealthStatus,
} from "@/lib/api/dashboard";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Shield,
  Server,
  TrendingUp,
  UserCheck,
  AlertCircle,
} from "lucide-react";

// Role-based dashboard configurations
const ROLE_DASHBOARD_CONFIG: Record<UserRole, {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  Admin: {
    title: "Admin Dashboard",
    description: "Full system overview and management",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-purple-500",
  },
  ITManager: {
    title: "IT Manager Dashboard",
    description: "Strategic oversight and reporting",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "bg-blue-500",
  },
  TeamLead: {
    title: "Team Lead Dashboard",
    description: "Team management and workload distribution",
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-500",
  },
  SystemAdmin: {
    title: "System Admin Dashboard",
    description: "Infrastructure and SLA management",
    icon: <Server className="h-6 w-6" />,
    color: "bg-orange-500",
  },
  ServiceDeskAgent: {
    title: "Service Desk Dashboard",
    description: "Ticket triage and first-line support",
    icon: <Ticket className="h-6 w-6" />,
    color: "bg-cyan-500",
  },
  Technician: {
    title: "Technician Dashboard",
    description: "Technical resolution and second-line support",
    icon: <Activity className="h-6 w-6" />,
    color: "bg-indigo-500",
  },
  SecurityAdmin: {
    title: "Security Admin Dashboard",
    description: "Security requests and access management",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-red-500",
  },
  EndUser: {
    title: "My Tickets",
    description: "Track your support requests",
    icon: <Ticket className="h-6 w-6" />,
    color: "bg-gray-500",
  },
};

// Stats Card Component
function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  color = "bg-blue-500",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; positive: boolean };
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color} text-white`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.positive ? "text-green-500" : "text-red-500"}`}>
            {trend.positive ? "+" : ""}{trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<DetailedHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsRes, statusRes, teamRes, healthRes] = await Promise.all([
        getDashboardStats(),
        getTicketStatusCounts(),
        getTeamStats(),
        getDetailedHealth(),
      ]);
      if (statsRes.success) setStats(statsRes.data!);
      if (statusRes.success) setStatusCounts(statusRes.data!);
      if (teamRes.success) setTeamStats(teamRes.data!);
      if (healthRes.success) setHealthStatus(healthRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
          color="bg-green-500"
        />
        <StatCard
          title="System Status"
          value={healthStatus?.status === "Healthy" ? "Healthy" : "Issues"}
          icon={<Server className="h-4 w-4" />}
          color={healthStatus?.status === "Healthy" ? "bg-green-500" : "bg-red-500"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="In Progress"
          value={statusCounts?.inProgress ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-blue-400"
        />
        <StatCard
          title="Resolved"
          value={statusCounts?.resolved ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="bg-green-400"
        />
        <StatCard
          title="Team Members"
          value={teamStats?.totalUsers ?? 0}
          icon={<UserCheck className="h-4 w-4" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Resolution"
          value={stats?.avgResolutionTime ? `${stats.avgResolutionTime}h` : "N/A"}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-indigo-500"
        />
      </div>
    </div>
  );
}

// IT Manager Dashboard
function ITManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsRes, teamRes] = await Promise.all([
        getDashboardStats(),
        getTeamStats(),
      ]);
      if (statsRes.success) setStats(statsRes.data!);
      if (teamRes.success) setTeamStats(teamRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Team Performance"
          value={teamStats?.resolvedTickets ?? 0}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Tickets resolved"
          color="bg-green-500"
        />
        <StatCard
          title="Active Staff"
          value={teamStats?.totalUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Open Issues"
          value={teamStats?.openTickets ?? 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
}

// Team Lead Dashboard
function TeamLeadDashboard() {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [teamRes, myRes] = await Promise.all([
        getTeamStats(),
        getMyStats(),
      ]);
      if (teamRes.success) setTeamStats(teamRes.data!);
      if (myRes.success) setMyStats(myRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Tickets"
          value={teamStats?.totalTickets ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Open"
          value={teamStats?.openTickets ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="In Progress"
          value={teamStats?.inProgressTickets ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-blue-400"
        />
        <StatCard
          title="Team Size"
          value={teamStats?.totalUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
          color="bg-green-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assigned Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{myStats?.assignedTickets.open ?? 0}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{myStats?.assignedTickets.inProgress ?? 0}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{myStats?.assignedTickets.resolved ?? 0}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{myStats?.assignedTickets.total ?? 0}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// System Admin Dashboard (SLA focused)
function SystemAdminDashboard() {
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<DetailedHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [slaRes, healthRes] = await Promise.all([
        getMySLA(),
        getDetailedHealth(),
      ]);
      if (slaRes.success) setSlaStats(slaRes.data!);
      if (healthRes.success) setHealthStatus(healthRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Tickets"
          value={slaStats?.assignedTickets ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="SLA Breaching"
          value={slaStats?.slaBreaching ?? 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="bg-red-500"
        />
        <StatCard
          title="Near Breach"
          value={slaStats?.slaNearBreach ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="System Health"
          value={healthStatus?.status === "Healthy" ? "OK" : "Issues"}
          icon={<Server className="h-4 w-4" />}
          color={healthStatus?.status === "Healthy" ? "bg-green-500" : "bg-red-500"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical</span>
                <Badge variant="destructive">{slaStats?.byPriority.critical ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High</span>
                <Badge className="bg-orange-500">{slaStats?.byPriority.high ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium</span>
                <Badge className="bg-yellow-500">{slaStats?.byPriority.medium ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low</span>
                <Badge className="bg-green-500">{slaStats?.byPriority.low ?? 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">MongoDB</span>
                <Badge className={healthStatus?.mongodb?.status === "Connected" ? "bg-green-500" : "bg-red-500"}>
                  {healthStatus?.mongodb?.status ?? "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">JWT Auth</span>
                <Badge className={healthStatus?.configuration?.jwtConfigured ? "bg-green-500" : "bg-red-500"}>
                  {healthStatus?.configuration?.jwtConfigured ? "Configured" : "Not Set"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CORS</span>
                <Badge className={healthStatus?.configuration?.corsConfigured ? "bg-green-500" : "bg-red-500"}>
                  {healthStatus?.configuration?.corsConfigured ? "Configured" : "Not Set"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Service Desk Agent Dashboard
function ServiceDeskDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsRes, myRes, statusRes] = await Promise.all([
        getDashboardStats(),
        getMyStats(),
        getTicketStatusCounts(),
      ]);
      if (statsRes.success) setStats(statsRes.data!);
      if (myRes.success) setMyStats(myRes.data!);
      if (statusRes.success) setStatusCounts(statusRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Assigned"
          value={myStats?.assignedTickets.total ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Open Queue"
          value={statusCounts?.open ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="My Resolved"
          value={myStats?.assignedTickets.resolved ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets ?? 0}
          icon={<LayoutDashboard className="h-4 w-4" />}
          color="bg-purple-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{myStats?.assignedTickets.open ?? 0}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{myStats?.assignedTickets.inProgress ?? 0}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{myStats?.assignedTickets.resolved ?? 0}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{myStats?.assignedTickets.closed ?? 0}</div>
              <div className="text-sm text-muted-foreground">Closed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Technician Dashboard
function TechnicianDashboard() {
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [myRes, statsRes] = await Promise.all([
        getMyStats(),
        getDashboardStats(),
      ]);
      if (myRes.success) setMyStats(myRes.data!);
      if (statsRes.success) setStats(statsRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned to Me"
          value={myStats?.assignedTickets.total ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="In Progress"
          value={myStats?.assignedTickets.inProgress ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Resolved by Me"
          value={myStats?.assignedTickets.resolved ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="bg-green-500"
        />
        <StatCard
          title="Open Tickets"
          value={myStats?.assignedTickets.open ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
}

// Security Admin Dashboard
function SecurityAdminDashboard() {
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [myRes, statsRes] = await Promise.all([
        getMyStats(),
        getDashboardStats(),
      ]);
      if (myRes.success) setMyStats(myRes.data!);
      if (statsRes.success) setStats(statsRes.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Security Requests"
          value={myStats?.assignedTickets.total ?? 0}
          icon={<Shield className="h-4 w-4" />}
          color="bg-red-500"
        />
        <StatCard
          title="Pending Review"
          value={myStats?.assignedTickets.open ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="In Progress"
          value={myStats?.assignedTickets.inProgress ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed"
          value={myStats?.assignedTickets.resolved ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="bg-green-500"
        />
      </div>
    </div>
  );
}

// End User Dashboard
function EndUserDashboard() {
  const [myTickets, setMyTickets] = useState<MyTicketsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getMyTicketsDashboard();
      if (res.success) setMyTickets(res.data!);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Requests"
          value={myTickets?.statusCounts?.open ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="In Progress"
          value={myTickets?.statusCounts?.inProgress ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Resolved"
          value={myTickets?.statusCounts?.resolved ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="bg-green-500"
        />
        <StatCard
          title="Closed"
          value={myTickets?.statusCounts?.closed ?? 0}
          icon={<Ticket className="h-4 w-4" />}
          color="bg-gray-500"
        />
      </div>

      {myTickets?.recentTickets && myTickets.recentTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTickets.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{ticket.status}</Badge>
                    <Badge variant="secondary">{ticket.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Role Dashboard Component
export default function RoleDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <DashboardSkeleton />;
  }

  const config = ROLE_DASHBOARD_CONFIG[user.role];

  const renderDashboard = () => {
    switch (user.role) {
      case "Admin":
        return <AdminDashboard />;
      case "ITManager":
        return <ITManagerDashboard />;
      case "TeamLead":
        return <TeamLeadDashboard />;
      case "SystemAdmin":
        return <SystemAdminDashboard />;
      case "ServiceDeskAgent":
        return <ServiceDeskDashboard />;
      case "Technician":
        return <TechnicianDashboard />;
      case "SecurityAdmin":
        return <SecurityAdminDashboard />;
      case "EndUser":
        return <EndUserDashboard />;
      default:
        return <EndUserDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${config.color} text-white`}>
          {config.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Badge className="ml-auto" variant="outline">
          {user.role}
        </Badge>
      </div>

      {/* Role-specific Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}
