'use client';

import { useMemo } from 'react';
import { Ticket } from '@/lib/api/tickets';
import { User, getUserDisplayName } from '@/lib/api/users';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AgentLoad {
  user: User;
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

function LoadBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

interface TeamWorkloadTableProps {
  tickets: Ticket[];
  users: User[];
  isLoading?: boolean;
}

export function TeamWorkloadTable({ tickets, users, isLoading = false }: TeamWorkloadTableProps) {
  const staffRoles = ['ServiceDeskAgent', 'Technician', 'SystemAdmin', 'SecurityAdmin', 'TeamLead'];

  const agentLoads = useMemo<AgentLoad[]>(() => {
    const staff = users.filter((u) => staffRoles.includes(u.role));

    return staff
      .map((user) => {
        const assigned = tickets.filter((t) => t.assignedToId === user.id);

        return {
          user,
          open: assigned.filter((t) => t.status === 'Open').length,
          inProgress: assigned.filter((t) => t.status === 'InProgress').length,
          resolved: assigned.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
          total: assigned.length,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [tickets, users]);

  const maxTotal = Math.max(...agentLoads.map((a) => a.total), 1);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (agentLoads.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No staff members found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="text-left pb-2 font-medium">Agent</th>
            <th className="text-center pb-2 font-medium w-16">Open</th>
            <th className="text-center pb-2 font-medium w-20">In Progress</th>
            <th className="text-center pb-2 font-medium w-16">Resolved</th>
            <th className="text-left pb-2 font-medium pl-3 w-32">Load</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {agentLoads.map(({ user, open, inProgress, resolved, total }) => (
            <tr key={user.id} className="hover:bg-accent transition-colors">
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              </td>
              <td className="py-2.5 text-center">
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-100 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                >
                  {open}
                </Badge>
              </td>
              <td className="py-2.5 text-center">
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-100 text-yellow-600 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                >
                  {inProgress}
                </Badge>
              </td>
              <td className="py-2.5 text-center">
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                >
                  {resolved}
                </Badge>
              </td>
              <td className="py-2.5 pl-3">
                <LoadBar value={total} max={maxTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
