'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getTicketById,
  assignTicket,
  unassignTicket,
  acknowledgeTicket,
  addTicketComment,
  resolveTicket,
  closeTicket,
  reopenTicket,
  transferTicket,
  deleteTicket,
  requestAwaitingInfo,
  markInProgress,
  confirmTriageSuggestions,
  modifyTriageSuggestions,
  Ticket,
  getPriorityString,
  getTriageStatusString,
  getEffectiveStatusLabel,
  getEffectiveStatusStyle,
  TicketStatusString,
  TicketPriorityString,
  TriageStatusString,
} from '@/lib/api/tickets';
import { Textarea } from '@/components/ui/textarea';
import {
  getAllUsers,
  getAssignableStaff,
  getUserById,
  User as UserType,
  getUserDisplayName,
} from '@/lib/api/users';
import { getAllCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/contexts/AuthContext';
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
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Lock,
  Sparkles,
  Check,
  Edit2,
  RefreshCw,
  TrendingUp,
  HelpCircle,
  ArrowLeftRight,
  Trash2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { AIDetailsSection } from '@/components/tickets/AIDetailsSection';
import { OverrideModal } from '@/components/ai/OverrideModal';
import { EscalateDialog } from '@/components/tickets/EscalateDialog';
import { PageContainer } from '@/components/layout/PageContainer';
import type { TicketAIDetails } from '@/lib/types/ai';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

// Status badge styling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStatusBadgeStyle(status: TicketStatusString): string {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'InProgress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'OnHold':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'AwaitingInfo':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Priority badge styling
function getPriorityBadgeStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case 'Low':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'Medium':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Triage status badge styling
function getTriageBadgeStyle(triageStatus: TriageStatusString): string {
  switch (triageStatus) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Confirmed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Modified':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Skipped':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'AutoAssigned':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'AssignedWithReview':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function DetailItem({
  icon,
  label,
  value,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (!value) {return null;}

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

// Returns the correct "back" URL for a given role
function getBackRoute(role?: string): string {
  switch (role) {
    case 'Technician':
    case 'SystemAdmin':
    case 'SecurityAdmin':
      return '/resolver/tickets';
    case 'ServiceDeskAgent':
      return '/agent/tickets';
    case 'EndUser':
      return '/portal/my-tickets';
    default:
      return '/tickets'; // Admin, ITManager, TeamLead
  }
}

// Roles allowed to assign tickets
const ASSIGN_ROLES = ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'];

// Roles allowed to escalate tickets
const ESCALATE_ROLES = [
  'Admin',
  'ITManager',
  'TeamLead',
  'Technician',
  'SystemAdmin',
  'ServiceDeskAgent',
];

// Roles allowed to view AI details and override classifications
const AI_ROLES = ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'];

// Roles that can close/reopen tickets (backend: Admin, ITManager, TeamLead, ServiceDeskAgent)
const CLOSE_REOPEN_ROLES = ['Admin', 'ITManager', 'TeamLead', 'ServiceDeskAgent'];

// Manager/supervisor roles that can act on any ticket (not just their own)
const MANAGER_ROLES = ['Admin', 'ITManager', 'TeamLead'];

export default function TicketDetailPage() {
  const { pageParams, navigateTo, activePage: _activePage } = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ticketId = pageParams.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Override Modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  // Escalate dialog state
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);

  // Assignment states
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriorityString>('Medium');
  const [assignError, setAssignError] = useState<string | null>(null);

  // Triage states
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageError, setTriageError] = useState<string | null>(null);

  // Workflow action states
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Transfer dialog states (SystemAdmin peer-transfer)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [authorNameMap, setAuthorNameMap] = useState<Record<string, string>>({});

  // Build name map from already-loaded users; supplemented by per-ID lookups below
  const knownNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    users.forEach((u) => {
      map[u.id] = getUserDisplayName(u);
    });
    if (user) {
      map[user.id] = user.name || user.email || 'You';
    }

    return map;
  }, [users, user]);

  // Check if current user can assign tickets
  const canAssign = user && ASSIGN_ROLES.includes(user.role);
  const canEscalate = user && ESCALATE_ROLES.includes(user.role);

  // Check if current user can triage tickets (same roles as assign)
  const canTriage = user && ASSIGN_ROLES.includes(user.role);

  // Check if current user can view AI details and override
  const canViewAI = user && AI_ROLES.includes(user.role);

  // Check if ticket needs triage (has AI suggestions and triageStatus is Pending)
  const needsTriage =
    ticket?.triageStatus === 'Pending' &&
    (ticket?.aiSuggestedCategoryId || ticket?.aiSuggestedAssigneeId || ticket?.aiSuggestedPriority);

  // Check if current user is the assignee
  const isAssignee = user && ticket?.assignedToId === user.id;

  // Granular action permissions based on backend authorization
  // Acknowledge: SystemAdmin only, own Open ticket (other roles auto-progress to InProgress on assign)
  const canAcknowledge =
    user?.role === 'SystemAdmin' && Boolean(isAssignee) && ticket?.status === 'Open';

  // Resolve: assignee OR manager on any active ticket
  const canResolve =
    Boolean(isAssignee || (user && MANAGER_ROLES.includes(user.role))) &&
    (ticket?.status === 'InProgress' ||
      ticket?.status === 'OnHold' ||
      ticket?.status === 'AwaitingInfo');

  // Close: specific roles on Resolved tickets
  const canClose =
    Boolean(user && CLOSE_REOPEN_ROLES.includes(user.role)) && ticket?.status === 'Resolved';

  // Reopen: specific roles on Resolved or Closed tickets
  const canReopen =
    Boolean(user && CLOSE_REOPEN_ROLES.includes(user.role)) &&
    (ticket?.status === 'Resolved' || ticket?.status === 'Closed');

  // Transfer: SystemAdmin only — peer-transfer of own assigned ticket
  const canTransfer =
    user?.role === 'SystemAdmin' &&
    Boolean(isAssignee) &&
    (ticket?.status === 'Open' || ticket?.status === 'InProgress');

  // Request Info: assignee or manager — flag ticket as awaiting user info (only from InProgress)
  const canRequestInfo =
    Boolean(isAssignee || (user && MANAGER_ROLES.includes(user.role))) &&
    ticket?.status === 'InProgress';

  // Mark In Progress: two cases both use the same /mark-in-progress endpoint:
  // 1. Resume a paused ticket (OnHold / AwaitingInfo) — assignee or manager
  // 2. Start work on an Open/assigned ticket for non-SystemAdmin roles
  //    (SystemAdmin uses /acknowledge instead — covered by canAcknowledge)
  const canMarkInProgress =
    (Boolean(isAssignee || (user && MANAGER_ROLES.includes(user.role))) &&
      (ticket?.status === 'OnHold' || ticket?.status === 'AwaitingInfo')) ||
    (Boolean(isAssignee) && ticket?.status === 'Open' && user?.role !== 'SystemAdmin');

  // Show the actions card if any action is available or user is the assignee/manager
  const showActionsCard =
    canAcknowledge ||
    canResolve ||
    canClose ||
    canReopen ||
    canTransfer ||
    canRequestInfo ||
    canMarkInProgress ||
    Boolean(isAssignee) ||
    Boolean(user && MANAGER_ROLES.includes(user.role));

  const fetchTicket = async () => {
    setIsLoading(true);
    setError(null);

    const response = await getTicketById(ticketId);

    if (response.success && response.data) {
      setTicket(response.data);
      resolveCommentAuthors(response.data.comments ?? [], [
        response.data.assignedToId,
        response.data.createdById,
        response.data.triagedById,
      ]);
    } else {
      setError(response.error || 'Failed to load ticket');
    }

    setIsLoading(false);
  };

  async function resolveCommentAuthors(
    comments: import('@/lib/api/tickets').TicketComment[],
    extraIds?: (string | null | undefined)[],
  ) {
    const commentIds = comments.map((c) => c.authorId);
    const all = [...commentIds, ...((extraIds?.filter(Boolean) as string[]) ?? [])];
    const uniqueIds = [...new Set(all)];
    const extra: Record<string, string> = {};

    await Promise.all(
      uniqueIds.map(async (id) => {
        const res = await getUserById(id);

        if (res.success && res.data) {
          extra[id] = getUserDisplayName(res.data);
        }
      }),
    );
    if (Object.keys(extra).length > 0) {
      setAuthorNameMap((prev) => ({ ...prev, ...extra }));
    }
  }

  // Fetch users when dialog opens — Admin/Manager get full list, others get staff-only endpoint
  const fetchUsers = async () => {
    if (users.length > 0) {return;} // Already loaded

    setIsLoadingUsers(true);
    let response = await getAllUsers();

    // Fallback for roles without access to GET /api/Users (ServiceDeskAgent, Technician, etc.)
    if (!response.success) {
      response = await getAssignableStaff();
    }

    if (response.success && response.data) {
      const assignableUsers = response.data.filter((u) => u.isActive);

      setUsers(assignableUsers);
    }

    setIsLoadingUsers(false);
  };

  // Fetch categories when dialog opens
  const fetchCategories = async () => {
    if (categories.length > 0) {return;} // Already loaded

    setIsLoadingCategories(true);
    const response = await getAllCategories();

    if (response.success && response.data) {
      // Filter to only show active categories
      const activeCategories = response.data.filter((c) => c.isActive);

      setCategories(activeCategories);
    }

    setIsLoadingCategories(false);
  };

  useEffect(() => {
    if (ticketId) {
      async function run() { await fetchTicket(); }
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  // Fetch categories and users on component mount for AI suggestions display
  useEffect(() => {
    async function run() { await fetchCategories(); await fetchUsers(); }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to get category name by ID
  function getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) {return 'Unknown Category';}
    const category = categories.find((c) => c.id === categoryId);

    return category?.name || 'Unknown Category';
  }

  // Helper function to get user display name by ID
  function getUserName(userId: string | null | undefined): string {
    if (!userId) {return 'Unassigned';}
    // Check users list first (staff roles), then resolved maps
    const fromList = users.find((u) => u.id === userId);

    if (fromList) {return getUserDisplayName(fromList);}

    return knownNameMap[userId] || authorNameMap[userId] || '...';
  }

  // Handle opening assign dialog - pre-fill with AI suggestions if available
  function handleOpenAssignDialog() {
    setAssignDialogOpen(true);
    setAssignError(null);
    setTriageError(null);

    // Pre-fill with AI suggestions or current values
    setSelectedUserId(ticket?.assignedToId || ticket?.aiSuggestedAssigneeId || '');
    setSelectedCategoryId(ticket?.categoryId || ticket?.aiSuggestedCategoryId || '');
    setSelectedPriority(ticket?.priority || ticket?.aiSuggestedPriority || 'Medium');

    // Fetch both users and categories
    fetchUsers();
    fetchCategories();
  }

  // Handle ticket assignment
  async function handleAssign() {
    if (!selectedUserId || !ticket) {return;}

    setIsAssigning(true);
    setAssignError(null);

    const response = await assignTicket(ticket.id, selectedUserId);

    if (response.success) {
      // Refresh ticket data
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setAssignError(response.error || 'Failed to assign ticket');
    }

    setIsAssigning(false);
  }

  // Handle ticket unassignment
  async function handleUnassign() {
    if (!ticket) {return;}

    setIsAssigning(true);
    setAssignError(null);

    const response = await unassignTicket(ticket.id);

    if (response.success) {
      // Refresh ticket data
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setAssignError(response.error || 'Failed to unassign ticket');
    }

    setIsAssigning(false);
  }

  // Confirm AI suggestions (1-click triage)
  async function handleConfirmTriage() {
    if (!ticket) {return;}

    setIsTriaging(true);
    setTriageError(null);

    const response = await confirmTriageSuggestions(ticket.id);

    if (response.success) {
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setTriageError(response.error || 'Failed to confirm AI suggestions');
    }

    setIsTriaging(false);
  }

  // Modify AI suggestions during triage
  async function handleModifyTriage() {
    if (!ticket) {return;}

    setIsTriaging(true);
    setTriageError(null);

    const response = await modifyTriageSuggestions(ticket.id, {
      categoryId: selectedCategoryId || undefined,
      assigneeId: selectedUserId || undefined,
      priority: selectedPriority,
    });

    if (response.success) {
      await fetchTicket();
      setAssignDialogOpen(false);
    } else {
      setTriageError(response.error || 'Failed to modify triage suggestions');
    }

    setIsTriaging(false);
  }

  // Acknowledge ticket (start working on it)
  async function handleAcknowledge() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await acknowledgeTicket(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to acknowledge ticket');
    }

    setIsProcessing(false);
  }

  // Resolve ticket
  async function handleResolve() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await resolveTicket(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to resolve ticket');
    }

    setIsProcessing(false);
  }

  // Transfer ticket to another SystemAdmin
  async function handleTransfer() {
    if (!ticket || !transferTargetId) {return;}

    setIsTransferring(true);
    setTransferError(null);

    const response = await transferTicket(ticket.id, transferTargetId);

    if (response.success) {
      setTransferDialogOpen(false);
      setTransferTargetId('');
      await fetchTicket();
    } else {
      setTransferError(response.error || 'Failed to transfer ticket');
    }

    setIsTransferring(false);
  }

  // Close ticket
  async function handleClose() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await closeTicket(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to close ticket');
    }

    setIsProcessing(false);
  }

  // Reopen ticket
  async function handleReopen() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await reopenTicket(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to reopen ticket');
    }

    setIsProcessing(false);
  }

  // Request more info from the user (InProgress → AwaitingInfo)
  async function handleRequestInfo() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await requestAwaitingInfo(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to request information');
    }

    setIsProcessing(false);
  }

  // Resume work on a paused ticket (OnHold/AwaitingInfo → InProgress)
  async function handleMarkInProgress() {
    if (!ticket) {return;}

    setIsProcessing(true);
    setActionError(null);

    const response = await markInProgress(ticket.id);

    if (response.success) {
      await fetchTicket();
    } else {
      setActionError(response.error || 'Failed to resume ticket');
    }

    setIsProcessing(false);
  }

  // Delete ticket — Admin only
  async function handleDelete() {
    if (!ticket) {return;}
    setIsDeleting(true);
    const res = await deleteTicket(ticket.id);

    if (res.success) {
      toast.success('Ticket deleted');
      navigateTo(pageParams?.from ?? getBackRoute(user?.role));
    } else {
      toast.error(res.error || 'Failed to delete ticket');
      setIsDeleting(false);
    }
  }

  // Add comment
  async function handleAddComment() {
    if (!ticket || !newComment.trim() || !user) {return;}

    setIsAddingComment(true);
    setCommentError(null);

    const response = await addTicketComment(ticket.id, {
      content: newComment.trim(),
      authorId: user.id,
      isInternal: isInternalComment,
    });

    if (response.success) {
      await fetchTicket();
      setNewComment('');
      setIsInternalComment(false);
    } else {
      setCommentError(response.error || 'Failed to add comment');
    }

    setIsAddingComment(false);
  }

  if (isLoading) {
    return (
      <PageContainer>
        <TicketDetailSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Ticket</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigateTo(pageParams?.from ?? getBackRoute(user?.role))}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={fetchTicket}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo(pageParams?.from ?? getBackRoute(user?.role))}
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
              <Badge
                variant="outline"
                className={getEffectiveStatusStyle(ticket.status, ticket.assignedToId)}
              >
                {getEffectiveStatusLabel(ticket.status, ticket.assignedToId)}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeStyle(ticket.priority)}>
                {getPriorityString(ticket.priority)}
              </Badge>
              {ticket.triageStatus && (
                <Badge variant="outline" className={getTriageBadgeStyle(ticket.triageStatus)}>
                  Triage: {getTriageStatusString(ticket.triageStatus)}
                </Badge>
              )}
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Delete — Admin only */}
          {user?.role === 'Admin' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="font-medium">{ticket.ticketNumber}</span> — {ticket.subject}
                    <br />
                    <br />
                    This action is permanent and cannot be undone. All comments, attachments, and AI
                    analysis will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Ticket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Escalate Button */}
          {canEscalate && !ticket.isEscalated && (
            <Button variant="outline" onClick={() => setEscalateDialogOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Escalate
            </Button>
          )}

          {/* Override AI Button - Only for AI-authorized roles */}
          {canViewAI && (
            <Button
              variant="outline"
              onClick={() => {
                fetchUsers();
                fetchCategories();
                setOverrideModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Override AI
            </Button>
          )}

          {/* Assign Button - Only for authorized roles */}
          {canAssign && (
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={needsTriage ? 'default' : 'outline'}
                  onClick={handleOpenAssignDialog}
                  className={needsTriage ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {needsTriage ? (
                    <Sparkles className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {needsTriage ? 'Triage' : ticket.assignedToId ? 'Reassign' : 'Assign'}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {needsTriage && <Sparkles className="h-5 w-5 text-purple-500" />}
                    {needsTriage ? 'Triage Ticket' : 'Assign Ticket'}
                  </DialogTitle>
                  <DialogDescription>
                    {needsTriage
                      ? 'Review AI suggestions and confirm or modify them.'
                      : 'Select a user to assign this ticket to.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-1">
                  {(assignError || triageError) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                      {assignError || triageError}
                    </div>
                  )}

                  {/* AI Suggestions Banner */}
                  {needsTriage && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-800 font-medium mb-2">
                        <Sparkles className="h-4 w-4" />
                        AI Suggestions
                      </div>
                      <div className="text-sm text-purple-700 space-y-1">
                        {ticket.aiSuggestedPriority && (
                          <div className="flex justify-between">
                            <span>Priority:</span>
                            <span className="font-medium">{ticket.aiSuggestedPriority}</span>
                            {ticket.aiPriorityConfidence && (
                              <span className="text-xs opacity-75">
                                ({(ticket.aiPriorityConfidence * 100).toFixed(0)}
                                %)
                              </span>
                            )}
                          </div>
                        )}
                        {ticket.aiSuggestedCategoryId && (
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">
                              {getCategoryName(ticket.aiSuggestedCategoryId)}
                            </span>
                            {ticket.aiCategoryConfidence && (
                              <span className="text-xs opacity-75">
                                ({(ticket.aiCategoryConfidence * 100).toFixed(0)}
                                %)
                              </span>
                            )}
                          </div>
                        )}
                        {ticket.aiSuggestedAssigneeId && (
                          <div className="flex justify-between">
                            <span>Assignee:</span>
                            <span className="font-medium">
                              {getUserName(ticket.aiSuggestedAssigneeId)}
                            </span>
                            {ticket.aiAssigneeConfidence && (
                              <span className="text-xs opacity-75">
                                ({(ticket.aiAssigneeConfidence * 100).toFixed(0)}
                                %)
                              </span>
                            )}
                          </div>
                        )}
                        {ticket.aiAssignmentReason && (
                          <div className="pt-2 border-t border-purple-200 mt-2">
                            <span className="text-xs italic">{ticket.aiAssignmentReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Priority Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Priority
                      {ticket.aiSuggestedPriority &&
                        selectedPriority === ticket.aiSuggestedPriority && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                    </label>
                    <Select
                      value={selectedPriority}
                      onValueChange={(value) => setSelectedPriority(value as TicketPriorityString)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Category
                      {ticket.aiSuggestedCategoryId &&
                        selectedCategoryId === ticket.aiSuggestedCategoryId && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                    </label>
                    {isLoadingCategories ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner className="text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading categories...
                        </span>
                      </div>
                    ) : (
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span className="font-medium">{c.name}</span>
                                {c.description && (
                                  <span className="text-muted-foreground text-xs line-clamp-1 max-w-xs">
                                    {c.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Assignee Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Assignee
                      {ticket.aiSuggestedAssigneeId &&
                        selectedUserId === ticket.aiSuggestedAssigneeId && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                    </label>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner className="text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                      </div>
                    ) : (
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span className="font-medium">{getUserDisplayName(u)}</span>
                                <span className="text-muted-foreground text-xs">
                                  {u.role} · {u.email}
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
                      Currently assigned to:{' '}
                      <span className="font-medium text-foreground">
                        {getUserName(ticket.assignedToId)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  {ticket.assignedToId && !needsTriage && (
                    <Button
                      variant="outline"
                      onClick={handleUnassign}
                      disabled={isAssigning || isTriaging}
                    >
                      {isAssigning ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : (
                        <UserMinus className="h-4 w-4 mr-2" />
                      )}
                      Unassign
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                      Cancel
                    </Button>

                    {/* Triage buttons */}
                    {needsTriage && canTriage ? (
                      <>
                        {/* 1-Click Confirm AI Suggestions */}
                        <Button
                          onClick={handleConfirmTriage}
                          disabled={isTriaging}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isTriaging ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Confirm AI
                        </Button>

                        {/* Apply Modified Values */}
                        <Button
                          onClick={handleModifyTriage}
                          disabled={!selectedUserId || isTriaging}
                          variant="outline"
                        >
                          {isTriaging ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <Edit2 className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      /* Regular assign button */
                      <Button onClick={handleAssign} disabled={!selectedUserId || isAssigning}>
                        {isAssigning ? (
                          <Spinner size="sm" className="mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Workflow Actions Card */}
      {showActionsCard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5" />
              Actions
            </CardTitle>
            <CardDescription>
              {isAssignee
                ? 'You are assigned to this ticket'
                : user && MANAGER_ROLES.includes(user.role)
                  ? 'Manager actions available'
                  : 'Ticket actions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
                {actionError}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {/* Acknowledge — SystemAdmin only: Open ticket assigned to them */}
              {canAcknowledge && (
                <Button
                  onClick={handleAcknowledge}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Working
                </Button>
              )}

              {/* Resolve — assignee or manager, active ticket */}
              {canResolve && (
                <Button
                  onClick={handleResolve}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Mark Resolved
                </Button>
              )}

              {/* Close — Admin/ITManager/TeamLead/ServiceDeskAgent on Resolved tickets */}
              {canClose && (
                <Button onClick={handleClose} disabled={isProcessing} variant="outline">
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Close Ticket
                </Button>
              )}

              {/* Reopen — Admin/ITManager/TeamLead/ServiceDeskAgent on Resolved/Closed */}
              {canReopen && (
                <Button onClick={handleReopen} disabled={isProcessing} variant="outline">
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Reopen Ticket
                </Button>
              )}

              {/* Transfer — SystemAdmin peer-transfer of own assigned ticket */}
              {canTransfer && (
                <Button
                  onClick={() => {
                    setTransferTargetId('');
                    setTransferError(null);
                    setTransferDialogOpen(true);
                  }}
                  disabled={isProcessing}
                  variant="outline"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
              )}

              {/* Request Info — flag ticket as awaiting user info (InProgress → AwaitingInfo) */}
              {canRequestInfo && (
                <Button onClick={handleRequestInfo} disabled={isProcessing} variant="outline">
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <HelpCircle className="h-4 w-4 mr-2" />
                  )}
                  Request Info
                </Button>
              )}

              {/* Start Working / Resume Work — both use /mark-in-progress */}
              {canMarkInProgress && (
                <Button
                  onClick={handleMarkInProgress}
                  disabled={isProcessing}
                  className={
                    ticket.status === 'Open'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                  }
                  variant={ticket.status === 'Open' ? 'default' : 'outline'}
                >
                  {isProcessing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {ticket.status === 'Open' ? 'Start Working' : 'Resume Work'}
                </Button>
              )}

              {/* Info: assigned to someone else, waiting to start */}
              {ticket.status === 'Open' && !isAssignee && ticket.assignedToId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Waiting for assignee to start working
                </div>
              )}

              {/* Info: unassigned */}
              {ticket.status === 'Open' && !ticket.assignedToId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserPlus className="h-4 w-4" />
                  Ticket needs to be assigned first
                </div>
              )}

              {/* Info: awaiting more information from user */}
              {ticket.status === 'AwaitingInfo' && !canResolve && (
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <HelpCircle className="h-4 w-4" />
                  Waiting for user to provide more information
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer Dialog — SystemAdmin peer-transfer */}
      <Dialog
        open={transferDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTransferDialogOpen(false);
            setTransferTargetId('');
            setTransferError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
              Transfer Ticket
            </DialogTitle>
            <DialogDescription>
              Transfer this ticket to another SystemAdmin. They will become the new assignee
              responsible for resolving it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {transferError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {transferError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Transfer to <span className="text-red-500">*</span>
              </label>
              <Select value={transferTargetId} onValueChange={setTransferTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a SystemAdmin" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.role === 'SystemAdmin' && u.id !== user?.id && u.isActive)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {getUserDisplayName(u)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
              disabled={isTransferring}
            >
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={!transferTargetId || isTransferring}>
              {isTransferring ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <ArrowLeftRight className="h-4 w-4 mr-2" />
              )}
              Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            {ticket.description || 'No description provided'}
          </div>
        </CardContent>
      </Card>

      {/* AI Classification Details Section - Only for authorized roles */}
      {canViewAI && (
        <AIDetailsSection
          ticketId={ticketId}
          ticketDescription={ticket.description}
          initialExpanded={false}
          getCategoryName={getCategoryName}
        />
      )}

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
              value={format(new Date(ticket.createdAt), 'PPpp')}
            />
            <DetailItem
              icon={<Clock className="h-4 w-4" />}
              label="Updated At"
              value={format(new Date(ticket.updatedAt), 'PPpp')}
            />
            {ticket.resolvedAt && (
              <DetailItem
                icon={<CheckCircle className="h-4 w-4" />}
                label="Resolved At"
                value={format(new Date(ticket.resolvedAt), 'PPpp')}
              />
            )}
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Created By"
              value={ticket.createdById ? getUserName(ticket.createdById) : 'System/Email'}
            />
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Assigned To"
              value={getUserName(ticket.assignedToId)}
            />
            {ticket.categoryId && (
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Category ID"
                value={getCategoryName(ticket.categoryId)}
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
                  value={ticket.emailRecipients.join(', ')}
                />
              )}
              {ticket.emailReceivedAt && (
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Received At"
                  value={format(new Date(ticket.emailReceivedAt), 'PPpp')}
                />
              )}
              {ticket.emailMessageId && (
                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="Message ID"
                  value={
                    <span className="font-mono text-xs break-all">{ticket.emailMessageId}</span>
                  }
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions (if available) */}
        {(ticket.aiSuggestedCategoryId ||
          ticket.aiSuggestedAssigneeId ||
          ticket.aiSuggestedPriority) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>Automated analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.aiSuggestedPriority && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suggested Priority</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getPriorityBadgeStyle(ticket.aiSuggestedPriority)}
                    >
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
                    <Badge variant="outline">{getCategoryName(ticket.aiSuggestedCategoryId)}</Badge>
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
                    <Badge variant="outline">{getUserName(ticket.aiSuggestedAssigneeId)}</Badge>
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

        {/* AutoAssigned banner */}
        {ticket.triageStatus === 'AutoAssigned' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Auto-Assigned by AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-green-700">
                This ticket was automatically assigned by the AI system with high confidence. No
                manual review required.
              </p>
              {ticket.aiConfidenceScore !== null && ticket.aiConfidenceScore !== undefined && (
                <p className="text-sm text-green-700">
                  Confidence:{' '}
                  <span className="font-medium">
                    {(ticket.aiConfidenceScore * 100).toFixed(0)}%
                  </span>
                </p>
              )}
              {ticket.assignedToId && (
                <p className="text-sm text-green-700">
                  Assigned to:{' '}
                  <span className="font-medium">{getUserName(ticket.assignedToId)}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* AssignedWithReview banner */}
        {ticket.triageStatus === 'AssignedWithReview' && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                Assigned — Please Verify
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-amber-700">
                The AI assigned this ticket but flagged it for human review. Please verify the
                assignment is correct.
              </p>
              {ticket.aiConfidenceScore !== null && ticket.aiConfidenceScore !== undefined && (
                <p className="text-sm text-amber-700">
                  Confidence:{' '}
                  <span className="font-medium">
                    {(ticket.aiConfidenceScore * 100).toFixed(0)}%
                  </span>
                </p>
              )}
              {ticket.assignedToId && (
                <p className="text-sm text-amber-700">
                  Assigned to:{' '}
                  <span className="font-medium">{getUserName(ticket.assignedToId)}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Triage Information for Confirmed / Modified / Skipped */}
        {ticket.triageStatus &&
          ticket.triageStatus !== 'Pending' &&
          ticket.triageStatus !== 'AutoAssigned' &&
          ticket.triageStatus !== 'AssignedWithReview' && (
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
                    value={getUserName(ticket.triagedById)}
                  />
                )}
                {ticket.triagedAt && (
                  <DetailItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Triaged At"
                    value={format(new Date(ticket.triagedAt), 'PPpp')}
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

      {/* Escalation Status */}
      {ticket.isEscalated && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <TrendingUp className="h-5 w-5" />
              Escalation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Assignment</span>
              {ticket.assignedToId ? (
                <span className="text-sm font-medium">
                  Escalated to {getUserName(ticket.assignedToId)}
                </span>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Awaiting L2 Assignment
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The escalation reason is recorded in the internal comments below.
            </p>
          </CardContent>
        </Card>
      )}

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
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          {user && ticket.status !== 'Closed' && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-3">Add a Comment</h4>

              {commentError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm mb-3">
                  {commentError}
                </div>
              )}

              <Textarea
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="mb-3"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Lock className="h-4 w-4 text-yellow-500" />
                  <span className="text-foreground">Internal note (not visible to end user)</span>
                </label>

                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  size="sm"
                >
                  {isAddingComment ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Add Comment
                </Button>
              </div>
            </div>
          )}

          {ticket.status === 'Closed' && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              This ticket is closed. Reopen it to add comments.
            </div>
          )}

          {/* Comments List */}
          {!ticket.comments || ticket.comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment) => {
                const authorName =
                  comment.authorName ||
                  knownNameMap[comment.authorId] ||
                  authorNameMap[comment.authorId] ||
                  'User';
                const isOwn = comment.authorId === user?.id;

                return (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      comment.isInternal
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : isOwn
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={isOwn ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : ''}
                        >
                          {getInitials(authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{authorName}</span>
                          {comment.isInternal && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Internal
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Override AI Modal - Only for authorized roles */}
      {canViewAI && (
        <OverrideModal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          onSuccess={() => {
            // Refresh ticket data and AI details
            fetchTicket();
            queryClient.invalidateQueries({
              queryKey: ['ticket-ai-details', ticketId],
            });
            toast.success('AI classification overridden successfully');
          }}
          ticketId={ticketId}
          aiDetails={
            {
              ticketId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              method: 'Hybrid' as any, // Will be populated from actual AI details
              finalCategory: ticket.categoryId,
              finalPriority: ticket.priority,
              finalAssignee: ticket.assignedToId,
            } as TicketAIDetails
          }
          availableCategories={categories.map((c) => ({
            id: c.id,
            name: c.name,
          }))}
          availablePriorities={['Low', 'Medium', 'High', 'Critical']}
          availableAssignees={users.map((u) => ({
            id: u.id,
            name: u.fullName || `${u.firstName} ${u.lastName}`,
          }))}
        />
      )}

      {/* Escalate Dialog */}
      <EscalateDialog
        isOpen={escalateDialogOpen}
        onClose={() => setEscalateDialogOpen(false)}
        ticketId={ticketId}
        onSuccess={() => {
          fetchTicket();
          toast.success('Ticket escalated successfully');
        }}
      />
    </PageContainer>
  );
}
