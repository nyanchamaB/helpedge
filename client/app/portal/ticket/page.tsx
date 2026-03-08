"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTicketById,
  addTicketComment,
  Ticket,
  getStatusString,
  getPriorityString,
} from "@/lib/api/tickets";
import { getCategoryById } from "@/lib/api/categories";
import { TicketStatusTracker } from "@/components/portal/TicketStatusTracker";
import { TicketConversationThread } from "@/components/portal/TicketConversationThread";
import { NotificationBanner } from "@/components/portal/NotificationBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TicketStatusString, TicketPriorityString } from "@/lib/api/tickets";

function getStatusBadgeStyle(status: TicketStatusString): string {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "InProgress":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Resolved":
      return "bg-green-100 text-green-700 border-green-200";
    case "Closed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "OnHold":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getPriorityBadgeStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case "Low":
      return "bg-gray-50 text-gray-600 border-gray-200";
    case "Medium":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "High":
      return "bg-orange-50 text-orange-600 border-orange-200";
    case "Critical":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}

export default function PortalTicketDetail() {
  const { pageParams, navigateTo } = useNavigation();
  const { user } = useAuth();
  const ticketId = pageParams.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  async function fetchTicket() {
    setIsLoading(true);
    const response = await getTicketById(ticketId);
    if (response.success && response.data) {
      setTicket(response.data);
      if (response.data.categoryId) {
        const catResponse = await getCategoryById(response.data.categoryId);
        if (catResponse.success && catResponse.data) {
          setCategoryName(catResponse.data.name);
        }
      }
    } else {
      toast.error("Failed to load ticket");
    }
    setIsLoading(false);
  }

  async function handleReply(content: string) {
    if (!user?.id || !ticketId) return;
    setIsReplying(true);
    const response = await addTicketComment(ticketId, {
      content,
      authorId: user.id,
      isInternal: false,
    });
    if (response.success && response.data) {
      setTicket(response.data);
      toast.success("Reply sent");
    } else {
      toast.error("Failed to send reply. Please try again.");
    }
    setIsReplying(false);
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container max-w-4xl py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("/portal/my-tickets")}
          className="-ml-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to My Tickets
        </Button>
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">Ticket not found</p>
          <p className="text-sm mt-1">
            This ticket may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  const agentComments = (ticket.comments ?? []).filter(
    (c) => !c.isInternal && c.authorId !== user?.id
  );
  const hasNewResponse = agentComments.length > 0;
  const isClosed = ticket.status === "Closed";

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Back button + refresh */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("/portal/my-tickets")}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to My Tickets
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTicket}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Notification banners */}
      {hasNewResponse && !isClosed && (
        <NotificationBanner
          type="info"
          title="New response from support"
          message="A support agent has replied to your ticket."
        />
      )}

      {ticket.isEscalated && (
        <NotificationBanner
          type="warning"
          title="This ticket has been escalated"
          message="It is now being handled by senior support staff for faster resolution."
          dismissible={false}
        />
      )}

      {isClosed && (
        <NotificationBanner
          type="success"
          title="This ticket is closed"
          message="If your issue persists, you can submit a new ticket."
          dismissible={false}
        />
      )}

      {/* Status Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ticket Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketStatusTracker
            status={ticket.status}
            hasAssignee={!!ticket.assignedToId}
            createdAt={ticket.createdAt}
            resolvedAt={ticket.resolvedAt ?? undefined}
          />
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: ticket details + conversation */}
        <div className="md:col-span-2 space-y-4">
          {/* Ticket info card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-400 mb-1">
                    {ticket.ticketNumber ?? ticket.id.slice(0, 8)}
                  </p>
                  <CardTitle className="text-xl leading-snug">
                    {ticket.subject}
                  </CardTitle>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                  <Badge
                    variant="outline"
                    className={getStatusBadgeStyle(ticket.status)}
                  >
                    {getStatusString(ticket.status)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getPriorityBadgeStyle(ticket.priority)}
                  >
                    {getPriorityString(ticket.priority)}
                  </Badge>
                  {ticket.isEscalated && (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Escalated
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketConversationThread
                comments={ticket.comments ?? []}
                currentUserId={user?.id ?? ""}
                onReply={handleReply}
                isReplying={isReplying}
                disabled={isClosed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={Calendar}
                label="Submitted"
                value={format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
              />
              <InfoRow
                icon={Calendar}
                label="Last Updated"
                value={format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              />
              {ticket.resolvedAt && (
                <InfoRow
                  icon={Calendar}
                  label="Resolved"
                  value={format(
                    new Date(ticket.resolvedAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                />
              )}
              <Separator />
              <InfoRow
                icon={User}
                label="Assigned To"
                value={ticket.assignedToId ? "Support Agent" : "Awaiting assignment"}
              />
              {categoryName && (
                <InfoRow
                  icon={Tag}
                  label="Category"
                  value={categoryName}
                />
              )}
            </CardContent>
          </Card>

          {/* Email source info */}
          {ticket.emailSender && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-medium text-gray-700 break-all">
                  {ticket.emailSender}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
