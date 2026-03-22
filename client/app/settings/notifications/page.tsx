"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { getTicketsByAssignee, getTicketsByCreator, Ticket } from "@/lib/api/tickets";
import { formatDistanceToNow } from "date-fns";
import {
  Bell, MessageSquare, CheckCircle, Clock,
  TrendingUp, RefreshCw, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STAFF_ROLES = ["Admin","ITManager","TeamLead","SystemAdmin","ServiceDeskAgent","Technician","SecurityAdmin"];
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const READ_STORAGE_KEY = 'helpedge_read_notif_ids';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function persistReadIds(ids: Set<string>) {
  try { localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

type NotifType = "reply" | "resolved" | "assigned" | "escalated";

interface DerivedNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  ticketId: string;
  ticketNumber: string;
  timestamp: string;
  isNew: boolean;
  actionUrl: string;
}

function deriveNotifications(tickets: Ticket[], userId: string, isStaff: boolean): DerivedNotification[] {
  const notifs: DerivedNotification[] = [];
  const cutoff = Date.now() - ONE_WEEK_MS;

  for (const ticket of tickets) {
    const num = ticket.ticketNumber ?? ticket.id.slice(0, 8);
    const url = isStaff ? `/tickets/${ticket.id}` : `/portal/ticket/${ticket.id}`;

    for (const comment of ticket.comments ?? []) {
      if (comment.isInternal || comment.authorId === userId) continue;
      notifs.push({
        id: `comment-${comment.id}`,
        type: "reply",
        title: isStaff ? "User replied to your ticket" : "Support agent replied",
        message: `Re: ${ticket.subject} — "${comment.content.slice(0, 100)}${comment.content.length > 100 ? "…" : ""}"`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: comment.createdAt,
        isNew: new Date(comment.createdAt).getTime() > cutoff,
        actionUrl: url,
      });
    }

    if (ticket.status === "Resolved" && ticket.resolvedAt) {
      notifs.push({
        id: `resolved-${ticket.id}`,
        type: "resolved",
        title: "Ticket resolved",
        message: `"${ticket.subject}" has been marked as resolved.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.resolvedAt,
        isNew: new Date(ticket.resolvedAt).getTime() > cutoff,
        actionUrl: url,
      });
    }

    if (!isStaff && ticket.assignedToId) {
      notifs.push({
        id: `assigned-${ticket.id}`,
        type: "assigned",
        title: "Ticket assigned to agent",
        message: `"${ticket.subject}" has been assigned to a support agent.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.updatedAt,
        isNew: false,
        actionUrl: url,
      });
    }

    if (isStaff && ticket.isEscalated) {
      notifs.push({
        id: `escalated-${ticket.id}`,
        type: "escalated",
        title: "Ticket escalated",
        message: `"${ticket.subject}" has been escalated and requires urgent attention.`,
        ticketId: ticket.id,
        ticketNumber: num,
        timestamp: ticket.updatedAt,
        isNew: new Date(ticket.updatedAt).getTime() > cutoff,
        actionUrl: url,
      });
    }
  }

  return notifs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);
}

const typeConfig: Record<NotifType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  reply:    { icon: MessageSquare, iconBg: "bg-blue-500/10",   iconColor: "text-blue-500" },
  resolved: { icon: CheckCircle,   iconBg: "bg-green-500/10",  iconColor: "text-green-500" },
  assigned: { icon: Clock,         iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
  escalated:{ icon: TrendingUp,    iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
};

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIds());
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const isStaff = user ? STAFF_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!authLoading && user?.id) fetchData();
  }, [authLoading, user]);

  async function fetchData() {
    if (!user?.id) return;
    setIsLoading(true);
    const fetcher = isStaff ? getTicketsByAssignee : getTicketsByCreator;
    const response = await fetcher(user.id);
    if (response.success && response.data) setTickets(response.data);
    setIsLoading(false);
  }

  const allNotifications = useMemo(
    () => (user ? deriveNotifications(tickets, user.id, isStaff) : []),
    [tickets, user, isStaff]
  );

  const notifications = useMemo(
    () => allNotifications.map(n => ({ ...n, isNew: n.isNew && !readIds.has(n.id) })),
    [allNotifications, readIds]
  );

  const newCount = notifications.filter((n) => n.isNew).length;

  function markRead(ids: string[]) {
    setReadIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      persistReadIds(next);
      return next;
    });
  }

  function markAllRead() {
    const ids = allNotifications.filter(n => n.isNew && !readIds.has(n.id)).map(n => n.id);
    markRead(ids);
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Activity and updates related to your tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <Badge className="bg-blue-500 text-white">{newCount} new</Badge>
          )}
          {newCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading} title="Refresh">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Notification Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No notifications yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ll see updates here when there&apos;s activity on your tickets.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigateTo(isStaff ? "/tickets" : "/portal/my-tickets")}>
            View {isStaff ? "All Tickets" : "My Tickets"}
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
                onClick={() => { if (notification.isNew) markRead([notification.id]); navigateTo(notification.actionUrl); }}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                  notification.isNew
                    ? "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
                    : "bg-card hover:bg-muted/50 border-border"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", config.iconBg)}>
                  <Icon className={cn("h-4 w-4", config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={cn("text-sm font-medium", notification.isNew ? "text-foreground" : "text-foreground/80")}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">#{notification.ticketNumber}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      )}

      <Separator />

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
            { key: "smsNotifications",   label: "SMS Notifications",   description: "Receive updates via SMS" },
            { key: "pushNotifications",  label: "Push Notifications",  description: "Receive browser push notifications" },
          ] as const).map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
