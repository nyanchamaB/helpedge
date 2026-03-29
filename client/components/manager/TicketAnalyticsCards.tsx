'use client';

import { cn } from '@/lib/utils';
import { Ticket } from '@/lib/api/tickets';
import {
  Ticket as TicketIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const SLA_HOURS: Record<string, number> = {
  Critical: 1,
  High: 4,
  Medium: 8,
  Low: 24,
};

function isSlaBreached(ticket: Ticket): boolean {
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {return false;}
  const threshold = SLA_HOURS[ticket.priority] ?? 24;
  const hoursOpen = (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;

  return hoursOpen > threshold;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subLabel?: string;
  colorClass: string;
  iconBg: string;
}

function StatCard({ icon: Icon, label, value, subLabel, colorClass, iconBg }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
      <div className={cn('p-2.5 rounded-xl', iconBg)}>
        <Icon className={cn('h-5 w-5', colorClass)} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {subLabel && <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>}
      </div>
    </div>
  );
}

interface TicketAnalyticsCardsProps {
  tickets: Ticket[];
  isLoading?: boolean;
}

export function TicketAnalyticsCards({ tickets, isLoading = false }: TicketAnalyticsCardsProps) {
  const stats = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'InProgress').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
      escalated: tickets.filter((t) => t.isEscalated).length,
      slaBreaches: tickets.filter(isSlaBreached).length,
      resolvedToday: tickets.filter(
        (t) => t.resolvedAt && new Date(t.resolvedAt).getTime() >= today.getTime(),
      ).length,
    };
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      icon: TicketIcon,
      label: 'Total Tickets',
      value: stats.total,
      colorClass: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Clock,
      label: 'Open',
      value: stats.open,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      icon: TrendingUp,
      label: 'In Progress',
      value: stats.inProgress,
      colorClass: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: CheckCircle,
      label: 'Resolved',
      value: stats.resolved,
      subLabel: `${stats.resolvedToday} today`,
      colorClass: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Escalated',
      value: stats.escalated,
      colorClass: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      icon: AlertTriangle,
      label: 'SLA Breaches',
      value: stats.slaBreaches,
      colorClass:
        stats.slaBreaches > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
      iconBg: stats.slaBreaches > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
