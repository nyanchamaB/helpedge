"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllUsers,
  getRoleDisplayString,
  getRoleBadgeColor,
  User,
} from '@/lib/api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  UserCog,
  ArrowRight,
  Clock,
  Building2,
  Briefcase,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

function getInitials(u: User) {
  return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || 'U';
}

function formatLastLogin(iso?: string) {
  if (!iso) return 'Never';
  try {
    const d = new Date(iso);
    const recent = Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    return recent ? formatDistanceToNow(d, { addSuffix: true }) : format(d, 'MMM d, yyyy');
  } catch { return '—'; }
}

const ROLE_GROUPS = [
  { label: 'Management',    roles: ['Admin', 'ITManager', 'TeamLead'] },
  { label: 'Service Desk',  roles: ['ServiceDeskAgent'] },
  { label: 'Resolvers',     roles: ['Technician', 'SystemAdmin', 'SecurityAdmin'] },
  { label: 'End Users',     roles: ['EndUser'] },
];

export default function TeamSettingsPage() {
  const { navigateTo } = useNavigation();
  const { user: currentUser } = useAuth();

  const [users, setUsers]       = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  async function fetchUsers() {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success && res.data) setUsers(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  // Stats
  const stats = useMemo(() => {
    const staff = users.filter((u) => u.role !== 'EndUser');
    return {
      total:    users.length,
      staff:    staff.length,
      active:   users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      endUsers: users.filter((u) => u.role === 'EndUser').length,
    };
  }, [users]);

  // Role group counts
  const groupCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ROLE_GROUPS.forEach((g) => {
      map[g.label] = users.filter((u) => g.roles.includes(u.role)).length;
    });
    return map;
  }, [users]);

  // Filtered list (exclude EndUsers from quick list to keep it staff-focused)
  const filtered = useMemo(() => {
    return users
      .filter((u) => u.role !== 'EndUser')
      .filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.department ?? '').toLowerCase().includes(q) ||
            (u.jobTitle ?? '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Current user first, then alphabetical
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
      });
  }, [users, search, roleFilter, currentUser?.id]);

  const uniqueRoles = Array.from(new Set(
    users.filter((u) => u.role !== 'EndUser').map((u) => u.role)
  )).sort();

  return (
    <div className="container mx-auto py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <UserCog className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Team Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Overview of your team's composition and member status
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigateTo('/team/members')}>
            <Users className="h-4 w-4 mr-1.5" />
            Manage Team
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users className="h-4 w-4 text-primary" />}       label="Total Members"  value={stats.total}    accent="primary" />
          <StatCard icon={<ShieldCheck className="h-4 w-4 text-blue-600" />} label="Staff"          value={stats.staff}    accent="blue" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-600"/>} label="Active"         value={stats.active}   accent="green" />
          <StatCard icon={<XCircle className="h-4 w-4 text-muted-foreground"/>} label="Inactive"    value={stats.inactive}  accent="gray" />
        </div>
      )}

      {/* Role distribution */}
      {!isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Team Composition</CardTitle>
            <CardDescription>Staff members grouped by function</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ROLE_GROUPS.map((g) => (
                <div key={g.label} className="text-center space-y-1">
                  <p className="text-2xl font-bold">{groupCounts[g.label] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{g.label}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {g.roles.map((r) => {
                      const count = users.filter((u) => u.role === r).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={r} variant="outline" className={cn('text-[10px] px-1.5 py-0 border', getRoleBadgeColor(r as any))}>
                          {getRoleDisplayString(r as any)} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff members list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base">Staff Members</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading…' : `${filtered.length} staff member${filtered.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-primary"
              onClick={() => navigateTo('/team/members')}
            >
              Full directory <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Search + role filter */}
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex rounded-lg border overflow-hidden text-sm h-9">
              <button
                onClick={() => setRoleFilter('all')}
                className={cn('px-3 transition-colors', roleFilter === 'all' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted')}
              >
                All roles
              </button>
              {uniqueRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={cn('px-3 border-l transition-colors', roleFilter === r ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted')}
                >
                  {getRoleDisplayString(r as any)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
              <Users className="h-8 w-8 opacity-30" />
              <p className="text-sm">No members match your search</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((u) => {
                const isMe = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Avatar */}
                    <Avatar className="h-9 w-9 shrink-0 border">
                      <AvatarImage src={u.avatarUrl ?? ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(u)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm">
                          {u.firstName} {u.lastName}
                        </span>
                        {isMe && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
                        )}
                        {!u.isActive && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>

                    {/* Role badge */}
                    <Badge variant="outline" className={cn('text-xs shrink-0 border hidden sm:inline-flex', getRoleBadgeColor(u.role))}>
                      {getRoleDisplayString(u.role)}
                    </Badge>

                    {/* Dept / title */}
                    <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground min-w-[120px]">
                      {u.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {u.department}
                        </span>
                      )}
                      {u.jobTitle && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> {u.jobTitle}
                        </span>
                      )}
                    </div>

                    {/* Last login */}
                    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-[110px] justify-end">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatLastLogin(u.lastLoginAt)}
                    </div>

                    {/* Action */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => navigateTo('/team/members')}
                      title="View in team directory"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Access</CardTitle>
          <CardDescription>Jump to team management areas</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Team Members',   desc: 'View, edit and manage all team members', path: '/team/members',     icon: Users },
            { label: 'Team Workload',  desc: 'See ticket distribution across the team',path: '/team/workload',    icon: ShieldCheck },
            { label: 'Performance',    desc: 'Full KPI breakdown and resolver metrics', path: '/team/performance', icon: ExternalLink },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className="flex items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/40 hover:shadow-sm transition-all group"
              >
                <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

const accentBg: Record<string, string> = {
  primary: 'bg-primary/5 dark:bg-primary/10',
  blue:    'bg-blue-50 dark:bg-blue-950/30',
  green:   'bg-green-50 dark:bg-green-950/30',
  gray:    'bg-muted/60',
};

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: number; accent: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border p-3.5', accentBg[accent] ?? accentBg.gray)}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
