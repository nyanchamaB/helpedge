'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  BellOff,
  Check,
  AlertCircle,
  Brain,
  RefreshCw,
  X,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  getAINotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/api/ai';
import { getTicketsByAssignee, getTicketsByCreator, Ticket } from '@/lib/api/tickets';
import type { AINotification, AINotificationType } from '@/lib/types/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STAFF_ROLES = [
  'Admin',
  'ITManager',
  'TeamLead',
  'SystemAdmin',
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
];
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const READ_STORAGE_KEY = 'helpedge_read_notif_ids';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);

    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

interface TicketNotification {
  id: string;
  type: 'reply' | 'resolved' | 'assigned' | 'escalated';
  title: string;
  message: string;
  ticketId: string;
  ticketNumber: string;
  timestamp: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}

function deriveTicketNotifications(
  tickets: Ticket[],
  userId: string,
  isStaff: boolean,
): TicketNotification[] {
  const notifs: TicketNotification[] = [];
  const cutoff = Date.now() - ONE_WEEK_MS;

  for (const ticket of tickets) {
    const num = ticket.ticketNumber ?? ticket.id.slice(0, 8);
    const url = isStaff ? `/tickets/${ticket.id}` : `/portal/ticket/${ticket.id}`;

    for (const comment of ticket.comments ?? []) {
      if (comment.isInternal || comment.authorId === userId) {continue;}
      notifs.push({
        id: `comment-${comment.id}`,
        type: 'reply',
        title: isStaff ? 'User replied to ticket' : 'Support agent replied',
        message: `Re: ${ticket.subject} — "${comment.content.slice(0, 80)}${comment.content.length > 80 ? '…' : ''}"`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: comment.createdAt,
        isRead: new Date(comment.createdAt).getTime() <= cutoff,
        actionUrl: url,
        createdAt: comment.createdAt,
      });
    }

    if (ticket.status === 'Resolved' && ticket.resolvedAt) {
      notifs.push({
        id: `resolved-${ticket.id}`,
        type: 'resolved',
        title: 'Ticket resolved',
        message: `"${ticket.subject}" has been marked as resolved.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.resolvedAt,
        isRead: new Date(ticket.resolvedAt).getTime() <= cutoff,
        actionUrl: url,
        createdAt: ticket.resolvedAt,
      });
    }

    if (isStaff && ticket.isEscalated) {
      notifs.push({
        id: `escalated-${ticket.id}`,
        type: 'escalated',
        title: 'Ticket escalated',
        message: `"${ticket.subject}" has been escalated and requires attention.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.updatedAt,
        isRead: true,
        actionUrl: url,
        createdAt: ticket.updatedAt,
      });
    }
  }

  return notifs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

const POLL_INTERVAL = 60000; // 60 seconds

type CombinedNotification =
  | (AINotification & { source: 'ai' })
  | (TicketNotification & { source: 'ticket' });
/**
 * Notification Bell Component
 * Displays AI notifications with real-time polling
 * Shows unread count badge and dropdown panel
 */
export function NotificationBell() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted',
  );

  const isStaff = user ? STAFF_ROLES.includes(user.role) : false;
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') {return new Set();}

    return getReadIds();
  });

  const markTicketNotifsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);

      ids.forEach((id) => next.add(id));
      persistReadIds(next);

      return next;
    });
  }, []);

  // Fetch AI unread count
  const { data: countResponse } = useQuery({
    queryKey: ['notification-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: POLL_INTERVAL,
    staleTime: 30 * 1000,
  });

  // Fetch AI notifications (only when open)
  const { data: notificationsResponse, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['ai-notifications'],
    queryFn: getAINotifications,
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  // Fetch ticket-derived notifications
  const { data: ticketsResponse } = useQuery({
    queryKey: ['notif-tickets', user?.id],
    queryFn: () =>
      user?.id
        ? isStaff
          ? getTicketsByAssignee(user.id)
          : getTicketsByCreator(user.id)
        : Promise.resolve({ success: false, status: 0, data: [] }),
    enabled: !!user?.id,
    refetchInterval: POLL_INTERVAL,
    staleTime: 30 * 1000,
  });

  const ticketNotifications = useMemo(() => {
    const tickets = ticketsResponse?.data ?? [];

    return user ? deriveTicketNotifications(tickets, user.id, isStaff) : [];
  }, [ticketsResponse, user, isStaff]);

  const aiNotifications = notificationsResponse?.data || [];
  const aiUnreadCount = countResponse?.data?.count || 0;
  const ticketUnreadCount = ticketNotifications.filter(
    (n) => !n.isRead && !readIds.has(n.id),
  ).length;
  const unreadCount = aiUnreadCount + ticketUnreadCount;

  // Combined notifications list sorted by time, with read state applied
  const notifications = useMemo(() => {
    const combined = [
      ...aiNotifications.map((n) => ({ ...n, source: 'ai' as const })),
      ...ticketNotifications.map((n) => ({
        ...n,
        isRead: n.isRead || readIds.has(n.id),
        source: 'ticket' as const,
      })),
    ];

    return combined
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30);
  }, [aiNotifications, ticketNotifications, readIds]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['ai-notifications'] });
    },
  });

  // Show desktop notification for new notifications
  const showDesktopNotification = useCallback(
    (notification: AINotification) => {
      if (
        desktopNotificationsEnabled &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const desktopNotif = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });

        desktopNotif.onclick = () => {
          if (notification.actionUrl) {
            navigateTo(notification.actionUrl);
          }
          desktopNotif.close();
        };
      }
    },
    [desktopNotificationsEnabled, navigateTo],
  );

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setDesktopNotificationsEnabled(true);
        toast.success('Desktop notifications enabled');
      }
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: CombinedNotification) => {
    if (!notification.isRead) {
      if (notification.source === 'ai') {
        markAsReadMutation.mutate(notification.id);
      } else {
        markTicketNotifsRead([notification.id]);
      }
    }
    if (notification.actionUrl) {
      navigateTo(notification.actionUrl);
      setIsOpen(false);
    }
  };

  // Handle delete notification (AI only)
  const handleDeleteNotification = (e: React.MouseEvent, notification: CombinedNotification) => {
    e.stopPropagation();
    if (notification.source === 'ai') {
      deleteMutation.mutate(notification.id);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    // Mark AI notifications via API
    markAllAsReadMutation.mutate();
    // Mark all ticket notifications in localStorage
    const ticketIds = ticketNotifications
      .filter((n) => !n.isRead && !readIds.has(n.id))
      .map((n) => n.id);

    if (ticketIds.length > 0) {markTicketNotifsRead(ticketIds);}
  };

  // Get icon for any notification type
  const getNotificationIcon = (notification: CombinedNotification) => {
    if (notification.source === 'ticket') {
      switch (notification.type) {
        case 'reply':
          return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case 'resolved':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'assigned':
          return <Clock className="h-4 w-4 text-purple-500" />;
        case 'escalated':
          return <TrendingUp className="h-4 w-4 text-orange-500" />;
      }
    }
    switch (notification.type as AINotificationType) {
      case 'LowConfidence':
      case 'ReviewQueueAlert':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'ModelRetrained':
        return <Brain className="h-4 w-4 text-purple-600" />;
      case 'OverrideRecorded':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'TrainingDataAdded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            {!desktopNotificationsEnabled && 'Notification' in window && (
              <Button
                variant="ghost"
                size="icon"
                onClick={requestNotificationPermission}
                title="Enable desktop notifications"
              >
                <BellOff className="h-4 w-4" />
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoadingNotifications ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group',
                    !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20',
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}

                  <div className="flex gap-3 pl-4">
                    {/* Icon */}
                    <div className="shrink-0 mt-1">{getNotificationIcon(notification)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            'text-sm font-medium line-clamp-1',
                            !notification.isRead && 'font-semibold',
                          )}
                        >
                          {notification.title}
                        </h4>
                        {/* Delete button (AI notifications only) */}
                        {notification.source === 'ai' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => handleDeleteNotification(e, notification)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.ticketNumber && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {notification.ticketNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You&rsquo;re all caught up!</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={() => {
                  navigateTo('/settings/notifications');
                  setIsOpen(false);
                }}
              >
                Notification Settings
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
