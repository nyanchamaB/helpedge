"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/contexts/NavigationContext';
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
} from 'lucide-react';
import {
  getAINotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/api/ai';
import type { AINotification, AINotificationType } from '@/lib/types/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const POLL_INTERVAL = 60000; // 60 seconds

/**
 * Notification Bell Component
 * Displays AI notifications with real-time polling
 * Shows unread count badge and dropdown panel
 */
export function NotificationBell() {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(false);

  // Fetch unread count
  const {
    data: countResponse,
    isLoading: isLoadingCount,
  } = useQuery({
    queryKey: ['notification-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: POLL_INTERVAL,
    staleTime: 30 * 1000,
  });

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['ai-notifications'],
    queryFn: getAINotifications,
    enabled: isOpen, // Only fetch when dropdown is open
    staleTime: 30 * 1000,
  });

  const unreadCount = countResponse?.data?.count || 0;
  const notifications = notificationsResponse?.data || [];

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
    onError: (error: any) => {
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

  // Request desktop notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setDesktopNotificationsEnabled(true);
    }
  }, []);

  // Show desktop notification for new notifications
  const showDesktopNotification = useCallback((notification: AINotification) => {
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
  }, [desktopNotificationsEnabled, navigateTo]);

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
  const handleNotificationClick = (notification: AINotification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      navigateTo(notification.actionUrl);
      setIsOpen(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    deleteMutation.mutate(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (notifications.length > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: AINotificationType) => {
    switch (type) {
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
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
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
            <h3 className="font-semibold">AI Notifications</h3>
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
                    !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}

                  <div className="flex gap-3 pl-4">
                    {/* Icon */}
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            'text-sm font-medium line-clamp-1',
                            !notification.isRead && 'font-semibold'
                          )}
                        >
                          {notification.title}
                        </h4>
                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
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
