"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { UserRole, ROLE_DESCRIPTIONS } from "@/lib/api/auth";
import {
  getDashboardStats,
  getTicketStatusCounts,
  getTeamStats,
  getMySLA,
  getMyTicketsDashboard,
  getMyStats,
  getDetailedHealth,
  getResolverKpis,
  type DashboardStats,
  type TicketStatusCounts,
  type TeamStats,
  type SLAStats,
  type MyTicketsDashboard,
  type MyStats,
  type DetailedHealthStatus,
} from "@/lib/api/dashboard";
import { getAssignableStaff } from "@/lib/api/users";
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
  Plus,
  Mail,
  ChevronRight,
  FileText,
} from "lucide-react";

// Role-based dashboard configurations
const ROLE_DASHBOARD_CONFIG: Record<
  UserRole,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
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
          <p
            className={`text-xs ${trend.positive ? "text-green-500" : "text-red-500"}`}
          >
            {trend.positive ? "+" : ""}
            {trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<DetailedHealthStatus | null>(
    null,
  );
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [avgResolutionHours, setAvgResolutionHours] = useState<string>("N/A");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsRes, healthRes, staffRes, kpisRes] = await Promise.all([
        getDashboardStats(),
        getDetailedHealth(),
        getAssignableStaff(),
        getResolverKpis(),
      ]);
      if (statsRes.success) setStats(statsRes.data!);
      if (healthRes.success) setHealthStatus(healthRes.data!);
      if (staffRes.success) setStaffCount(staffRes.data!.length);
      if (kpisRes.success && kpisRes.data) {
        const ttrs = kpisRes.data
          .map((r) => r.avgTtrMinutes)
          .filter((v): v is number => v != null && v > 0);
        if (ttrs.length > 0) {
          const avgMinutes = ttrs.reduce((a, b) => a + b, 0) / ttrs.length;
          const hours = avgMinutes / 60;
          setAvgResolutionHours(
            hours < 1 ? `${Math.round(avgMinutes)}m` : `${hours.toFixed(1)}h`,
          );
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <Card className="space-y-6">
      <div className="">
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
            value={healthStatus?.checks != null ? "Healthy" : "Issues"}
            icon={<Server className="h-4 w-4" />}
            color={healthStatus?.checks != null ? "bg-green-500" : "bg-red-500"}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="In Progress"
            value={stats?.inProgressTickets ?? 0}
            icon={<Clock className="h-4 w-4" />}
            color="bg-blue-400"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolvedTickets ?? stats?.rlvedTickets ?? 0}
            icon={<CheckCircle className="h-4 w-4" />}
            color="bg-green-400"
          />
          <StatCard
            title="Team Members"
            value={staffCount ?? 0}
            icon={<UserCheck className="h-4 w-4" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Avg Resolution"
            value={avgResolutionHours}
            icon={<TrendingUp className="h-4 w-4" />}
            color="bg-indigo-500"
          />
        </div>
      </div>
    </Card>
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
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {myStats?.assignedTickets.open ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {myStats?.assignedTickets.inProgress ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {myStats?.assignedTickets.resolved ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {myStats?.assignedTickets.total ?? 0}
              </div>
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
  const [healthStatus, setHealthStatus] = useState<DetailedHealthStatus | null>(
    null,
  );
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
          value={healthStatus?.checks != null ? "OK" : "Issues"}
          icon={<Server className="h-4 w-4" />}
          color={healthStatus?.checks != null ? "bg-green-500" : "bg-red-500"}
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
                <Badge variant="destructive">
                  {slaStats?.byPriority.critical ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High</span>
                <Badge className="bg-orange-500">
                  {slaStats?.byPriority.high ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium</span>
                <Badge className="bg-yellow-500">
                  {slaStats?.byPriority.medium ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low</span>
                <Badge className="bg-green-500">
                  {slaStats?.byPriority.low ?? 0}
                </Badge>
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
                <Badge
                  className={
                    healthStatus?.checks?.mongodb != null
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {healthStatus?.checks?.mongodb?.status ?? "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">JWT Auth</span>
                <Badge
                  className={
                    healthStatus?.checks?.configuration?.jwtConfigured
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {healthStatus?.checks?.configuration?.jwtConfigured
                    ? "Configured"
                    : "Not Set"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CORS</span>
                <Badge
                  className={
                    healthStatus?.checks?.configuration?.corsConfigured
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {healthStatus?.checks?.configuration?.corsConfigured
                    ? "Configured"
                    : "Not Set"}
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
  const [statusCounts, setStatusCounts] = useState<TicketStatusCounts | null>(
    null,
  );
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
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {myStats?.assignedTickets.open ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {myStats?.assignedTickets.inProgress ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {myStats?.assignedTickets.resolved ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {myStats?.assignedTickets.closed ?? 0}
              </div>
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

// Status + Priority badge helpers for EndUser dashboard
function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    InProgress:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    OnHold:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    AwaitingInfo:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    Resolved:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    Closed: "bg-muted text-muted-foreground border-border",
  };
  const label: Record<string, string> = {
    InProgress: "In Progress",
    AwaitingInfo: "Awaiting Info",
    OnHold: "On Hold",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label[status] ?? status}
    </span>
  );
}

function TicketPriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-500/10 text-red-700 dark:text-red-400",
    High: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Low: "bg-green-500/10 text-green-700 dark:text-green-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[priority] ?? "bg-muted text-muted-foreground"}`}
    >
      {priority}
    </span>
  );
}

// End User Dashboard
function EndUserDashboard() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
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

  const firstName =
    user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const totalTickets =
    (myTickets?.statusCounts?.open ?? 0) +
    (myTickets?.statusCounts?.inProgress ?? 0) +
    (myTickets?.statusCounts?.resolved ?? 0) +
    (myTickets?.statusCounts?.closed ?? 0);

  // ── Layout ──────────────────────────────────────────────────────────────────
  // Row 1: Welcome banner — always full width
  // Row 2: Stats (left col, 2×2) | Recent Tickets or Empty state (right cols)
  //
  // Desktop (lg+):
  //   [ Welcome banner ─────────────────────────────── ]
  //   [ Stats 2×2 ] [ Recent Tickets / Empty state     ]
  //
  // Mobile (stacked):
  //   Welcome → Stats → Recent Tickets → Empty state

  const statsColumn = (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Total"
        value={totalTickets}
        icon={<Ticket className="h-4 w-4" />}
        color="bg-blue-500"
      />
      <StatCard
        title="Open"
        value={myTickets?.statusCounts?.open ?? 0}
        icon={<AlertCircle className="h-4 w-4" />}
        color="bg-yellow-500"
      />
      <StatCard
        title="In Progress"
        value={myTickets?.statusCounts?.inProgress ?? 0}
        icon={<Clock className="h-4 w-4" />}
        color="bg-orange-500"
      />
      <StatCard
        title="Resolved"
        value={(myTickets?.statusCounts?.resolved ?? 0) + (myTickets?.statusCounts?.closed ?? 0)}
        icon={<CheckCircle className="h-4 w-4" />}
        color="bg-green-500"
      />
    </div>
  );

  const recentTicketsCard =
    !loading && myTickets?.recentTickets && myTickets.recentTickets.length > 0 ? (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3 shrink-0">
          <CardTitle className="text-base">Recent Tickets</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1"
            onClick={() => navigateTo("/portal/my-tickets")}
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {myTickets.recentTickets.map((ticket) => (
              <button
                key={ticket.id}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors text-left"
                onClick={() => navigateTo(`/portal/ticket/${ticket.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null;

  const emptyStateCard = !loading && totalTickets === 0 ? (
    <Card className="flex flex-col justify-center h-full">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="p-4 rounded-full bg-blue-500/10 mb-4">
          <Ticket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-semibold">No tickets yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Submit your first support request and we&apos;ll take it from there.
        </p>
        <Button className="mt-5" onClick={() => navigateTo("/portal/create-ticket")}>
          <Plus className="h-4 w-4 mr-2" />
          Submit a Ticket
        </Button>
      </CardContent>
    </Card>
  ) : null;

  // The right panel is recent tickets when available, empty state when no tickets, nothing while loading.
  const rightPanel = recentTicketsCard ?? emptyStateCard;

  return (
    <div className="space-y-6">
      {/* Row 1 — Welcome banner, full width */}
      <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6">
        <h2 className="text-xl font-bold">Welcome back, {firstName}!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Need IT support? Submit a ticket and our team will get back to you shortly.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button onClick={() => navigateTo("/portal/create-ticket")}>
            <Plus className="h-4 w-4 mr-2" />
            Submit a Ticket
          </Button>
          <Button variant="outline" onClick={() => navigateTo("/portal/my-tickets")}>
            <FileText className="h-4 w-4 mr-2" />
            View My Tickets
          </Button>
          <Button variant="outline" onClick={() => navigateTo("/portal/email-ticket")}>
            <Mail className="h-4 w-4 mr-2" />
            Submit via Email
          </Button>
        </div>
      </div>

      {/* Row 2 — Stats (left) + Recent tickets or Empty state (right) */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: 2×2 stats grid */}
          <div className="lg:col-span-1">{statsColumn}</div>
          {/* Right: recent tickets or empty state */}
          {rightPanel && <div className="lg:col-span-2">{rightPanel}</div>}
        </div>
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
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
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
      {/* Dashboard Header — hidden for EndUser (they get a welcome banner inside their dashboard) */}
      {user.role !== "EndUser" && (
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
      )}

      {/* Role-specific Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}
