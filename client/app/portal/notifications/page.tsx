'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { getTicketsByCreator, Ticket } from '@/lib/api/tickets';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type NotifType = 'reply' | 'resolved' | 'assigned';

interface DerivedNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  ticketId: string;
  ticketNumber: string;
  timestamp: string;
  isNew: boolean;
}

function deriveNotifications(tickets: Ticket[], currentUserId: string): DerivedNotification[] {
  const notifications: DerivedNotification[] = [];
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const ticket of tickets) {
    const num = ticket.ticketNumber ?? ticket.id.slice(0, 8);

    // Agent replies (comments not by current user)
    for (const comment of ticket.comments ?? []) {
      if (comment.isInternal || comment.authorId === currentUserId) {continue;}
      notifications.push({
        id: `comment-${comment.id}`,
        type: 'reply',
        title: 'Support agent replied',
        message: `Re: ${ticket.subject} — "${comment.content.slice(0, 100)}${comment.content.length > 100 ? '…' : ''}"`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: comment.createdAt,
        isNew: new Date(comment.createdAt).getTime() > oneWeekAgo,
      });
    }

    // Resolved notification
    if (ticket.status === 'Resolved' && ticket.resolvedAt) {
      notifications.push({
        id: `resolved-${ticket.id}`,
        type: 'resolved',
        title: 'Ticket resolved',
        message: `Your ticket "${ticket.subject}" has been marked as resolved.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.resolvedAt,
        isNew: new Date(ticket.resolvedAt).getTime() > oneWeekAgo,
      });
    }

    // Assignment notification
    if (ticket.assignedToId) {
      notifications.push({
        id: `assigned-${ticket.id}`,
        type: 'assigned',
        title: 'Ticket assigned to agent',
        message: `"${ticket.subject}" has been assigned to a support agent.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.updatedAt,
        isNew: false,
      });
    }
  }

  return notifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 40);
}

const typeConfig: Record<
  NotifType,
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  reply: {
    icon: MessageSquare,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  resolved: {
    icon: CheckCircle,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  assigned: {
    icon: Clock,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
};

export default function PortalNotifications() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchData() {
    if (!user?.id) {return;}
    setIsLoading(true);
    const response = await getTicketsByCreator(user.id);

    if (response.success && response.data) {
      setTickets(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!authLoading && user) {
      async function loadData() {
        await fetchData();
      }

      void loadData();
    }
  }, [authLoading, user]);

  const notifications = useMemo(
    () => (user ? deriveNotifications(tickets, user.id) : []),
    [tickets, user],
  );

  const newCount = notifications.filter((n) => n.isNew).length;

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Updates and activity on your support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && <Badge className="bg-blue-500 text-white">{newCount} new</Badge>}
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="h-12 w-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No notifications yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            You&apos;ll see updates here when agents respond to your tickets or statuses change.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigateTo('/portal/my-tickets')}
          >
            View My Tickets
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            return (
              <button
                key={notification.id}
                onClick={() =>
                  navigateTo(`/portal/ticket/${notification.ticketId}`, {
                    from: '/portal/notifications',
                  })
                }
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors',
                  notification.isNew
                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100/70'
                    : 'bg-white hover:bg-gray-50 border-gray-100',
                )}
              >
                <div className={cn('p-2 rounded-lg shrink-0', config.iconBg)}>
                  <Icon className={cn('h-4 w-4', config.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        notification.isNew ? 'text-blue-900' : 'text-gray-800',
                      )}
                    >
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">#{notification.ticketNumber}</p>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
