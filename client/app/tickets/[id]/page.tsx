"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTicketById,
  assignTicket,
  unassignTicket,
  Ticket,
  getStatusString,
  getPriorityString,
  getTriageStatusString,
  TicketStatusString,
  TicketPriorityString,
  TriageStatusString,
} from "@/lib/api/tickets";
import { getAllUsers, User as UserType } from "@/lib/api/users";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  User,
  Tag,
  MessageSquare,
  Brain,
  CheckCircle,
  AlertCircle,
  FileText,
  Hash,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";

// Status badge styling
function getStatusBadgeStyle(status: TicketStatusString): string {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "InProgress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Closed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "OnHold":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Priority badge styling
function getPriorityBadgeStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// Triage status badge styling
function getTriageBadgeStyle(triageStatus: TriageStatusString): string {
  switch (triageStatus) {
    case "Pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "Modified":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Skipped":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function DetailItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (!value) return null;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

// Roles allowed to assign tickets
const ASSIGN_ROLES = ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"];

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assignment states
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignError, setAssignError] = useState<string | null>(null);

  // Check if current user can assign tickets
  const canAssign = user && ASSIGN_ROLES.includes(user.role);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  async function fetchTicket() {
    setIsLoading(true);
    setError(null);

    const response = await getTicketById(ticketId);

    if (response.success && response.data) {
      setTicket(response.data);
    } else {
      setError(response.error || "Failed to load ticket");
    }

    setIsLoading(false);
  }

  // Fetch users when dialog opens
  async function fetchUsers() {
    if (users.length > 0) return; // Already loaded

    setIsLoadingUsers(true);
    const response = await getAllUsers();

    if (response.success && response.data) {
      // Filter to only show active users who can be assigned tickets
      const assignableUsers = response.data.filter((u) => u.isActive);
      setUsers(assignableUsers);
    }

    setIsLoadingUsers(false);
  }

  // Handle opening assign dialog
  function handleOpenAssignDialog() {
    setAssignDialogOpen(true);
    setAssignError(null);
    setSelectedUserId(ticket?.assignedToId || "");
    fetchUsers();
  }

  // Handle ticket assignment
  async function handleAssign() {
    if (!selectedUserId || !ticket) return;

    setIsAssigning(true);
    setAssignError(null);

    const response = await assignTicket(ticket.id, selectedUserId);

    if (response.success) {
      // Refresh ticket data
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setAssignError(response.error || "Failed to assign ticket");
    }

    setIsAssigning(false);
  }

  // Handle ticket unassignment
  async function handleUnassign() {
    if (!ticket) return;

    setIsAssigning(true);
    setAssignError(null);

    const response = await unassignTicket(ticket.id);

    if (response.success) {
      // Refresh ticket data
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setAssignError(response.error || "Failed to unassign ticket");
    }

    setIsAssigning(false);
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6">
        <TicketDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Ticket
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={fetchTicket}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <Hash className="h-4 w-4" />
              <span className="font-mono">{ticket.ticketNumber}</span>
              <span className="mx-2">·</span>
              <Badge variant="outline" className={getStatusBadgeStyle(ticket.status)}>
                {getStatusString(ticket.status)}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeStyle(ticket.priority)}>
                {getPriorityString(ticket.priority)}
              </Badge>
              {ticket.triageStatus && (
                <Badge variant="outline" className={getTriageBadgeStyle(ticket.triageStatus)}>
                  Triage: {getTriageStatusString(ticket.triageStatus)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Assign Button - Only for authorized roles */}
        {canAssign && (
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleOpenAssignDialog}>
                <UserPlus className="h-4 w-4 mr-2" />
                {ticket.assignedToId ? "Reassign" : "Assign"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Ticket</DialogTitle>
                <DialogDescription>
                  Select a user to assign this ticket to.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {assignError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {assignError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading users...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({u.email})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {ticket.assignedToId && (
                  <p className="text-sm text-muted-foreground">
                    Currently assigned to: {ticket.assignedToId}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                {ticket.assignedToId && (
                  <Button
                    variant="outline"
                    onClick={handleUnassign}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserMinus className="h-4 w-4 mr-2" />
                    )}
                    Unassign
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => setAssignDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedUserId || isAssigning}
                  >
                    {isAssigning ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Assign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm">
            {ticket.description || "No description provided"}
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Created At"
              value={format(new Date(ticket.createdAt), "PPpp")}
            />
            <DetailItem
              icon={<Clock className="h-4 w-4" />}
              label="Updated At"
              value={format(new Date(ticket.updatedAt), "PPpp")}
            />
            {ticket.resolvedAt && (
              <DetailItem
                icon={<CheckCircle className="h-4 w-4" />}
                label="Resolved At"
                value={format(new Date(ticket.resolvedAt), "PPpp")}
              />
            )}
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Created By"
              value={ticket.createdById || "System/Email"}
            />
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Assigned To"
              value={ticket.assignedToId || "Unassigned"}
            />
            {ticket.categoryId && (
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Category ID"
                value={ticket.categoryId}
              />
            )}
          </CardContent>
        </Card>

        {/* Email Information (if applicable) */}
        {ticket.emailSender && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                icon={<Mail className="h-4 w-4" />}
                label="From"
                value={ticket.emailSender}
              />
              {ticket.emailRecipients && ticket.emailRecipients.length > 0 && (
                <DetailItem
                  icon={<Mail className="h-4 w-4" />}
                  label="To"
                  value={ticket.emailRecipients.join(", ")}
                />
              )}
              {ticket.emailReceivedAt && (
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Received At"
                  value={format(new Date(ticket.emailReceivedAt), "PPpp")}
                />
              )}
              {ticket.emailMessageId && (
                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="Message ID"
                  value={
                    <span className="font-mono text-xs break-all">
                      {ticket.emailMessageId}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions (if available) */}
        {(ticket.aiSuggestedCategoryId || ticket.aiSuggestedAssigneeId || ticket.aiSuggestedPriority) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Automated analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.aiSuggestedPriority && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suggested Priority</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityBadgeStyle(ticket.aiSuggestedPriority)}>
                      {ticket.aiSuggestedPriority}
                    </Badge>
                    {ticket.aiPriorityConfidence && (
                      <span className="text-xs text-muted-foreground">
                        ({(ticket.aiPriorityConfidence * 100).toFixed(0)}% confidence)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {ticket.aiSuggestedCategoryId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suggested Category</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{ticket.aiSuggestedCategoryId.slice(-8)}</span>
                    {ticket.aiCategoryConfidence && (
                      <span className="text-xs text-muted-foreground">
                        ({(ticket.aiCategoryConfidence * 100).toFixed(0)}% confidence)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {ticket.aiSuggestedAssigneeId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suggested Assignee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{ticket.aiSuggestedAssigneeId.slice(-8)}</span>
                    {ticket.aiAssigneeConfidence && (
                      <span className="text-xs text-muted-foreground">
                        ({(ticket.aiAssigneeConfidence * 100).toFixed(0)}% confidence)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {ticket.aiAssignmentReason && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Assignment Reason</p>
                  <p className="text-sm">{ticket.aiAssignmentReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Triage Information */}
        {ticket.triageStatus && ticket.triageStatus !== "Pending" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Triage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={getTriageBadgeStyle(ticket.triageStatus)}>
                  {getTriageStatusString(ticket.triageStatus)}
                </Badge>
              </div>
              {ticket.triagedById && (
                <DetailItem
                  icon={<User className="h-4 w-4" />}
                  label="Triaged By"
                  value={ticket.triagedById}
                />
              )}
              {ticket.triagedAt && (
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Triaged At"
                  value={format(new Date(ticket.triagedAt), "PPpp")}
                />
              )}
              {ticket.categoryLocked && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Category is locked
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tags */}
      {ticket.tags && ticket.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
            {ticket.comments && ticket.comments.length > 0 && (
              <Badge variant="secondary">{ticket.comments.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!ticket.comments || ticket.comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No comments yet
            </p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${
                    comment.isInternal
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {comment.authorId?.slice(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.authorId || "Unknown"}
                        </span>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs bg-yellow-100">
                            Internal
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "PPp")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
