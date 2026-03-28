"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useServiceRequest,
  useApprovalStatus,
  useServiceRequestComments,
} from "@/hooks/service-requests/useServiceRequests";
import { useWorkflowForRequest } from "@/hooks/approval-workflows/useApprovalWorkflows";
import {
  useSubmitServiceRequest,
  useApproveServiceRequest,
  useRejectServiceRequest,
  // useDelegateServiceRequestApproval,
  useAssignServiceRequest,
  useStartServiceRequest,
  useFulfillServiceRequest,
  useCloseServiceRequest,
  useCancelServiceRequest,
  useDeleteServiceRequest,
  useAddServiceRequestComment,
} from "@/hooks/service-requests/useServiceRequestMutations";
import {
  ServiceRequest,
  ServiceRequestStatus,
  getSRStatusLabel,
  getSRStatusStyle,
  getSRPriorityStyle,
  getSRTypeLabel,
  SR_STATUS_FLOW,
} from "@/lib/api/service-request";
import { UserRole } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  UserCheck,
  Play,
  Package,
  Lock,
  Trash2,
  MessageSquare,
  Clock,
  User,
  CalendarDays,
  Tag,
  History,
  AlertTriangle,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Role helpers ─────────────────────────────────────────────────────────────

const APPROVER_ROLES: UserRole[] = ["Admin", "ITManager", "TeamLead", "SecurityAdmin"];
const ASSIGNER_ROLES: UserRole[] = ["Admin", "ITManager", "TeamLead", "ServiceDeskAgent"];
const FULFILLER_ROLES: UserRole[] = ["Admin", "ITManager", "TeamLead", "SystemAdmin", "ServiceDeskAgent", "Technician", "SecurityAdmin"];

// ITManagement approverType maps to these roles
const IT_MANAGEMENT_ROLES: UserRole[] = ["Admin", "ITManager"];

function hasRole(userRoles: string | UserRole | undefined, allowed: UserRole[]): boolean {
  if (!userRoles) return false;
  return allowed.includes(userRoles as UserRole);
}

/** Determine if the user's role matches the current workflow step's approver configuration */
function canUserApproveStep(
  role: string | UserRole | undefined,
  approverType: string,
  approverRoles: string[],
): boolean {
  if (!role) return false;
  switch (approverType) {
    case 'Role':
      return approverRoles.includes(role as string);
    case 'ITManagement':
      return IT_MANAGEMENT_ROLES.includes(role as UserRole);
    case 'RequestersManager':
      // Can't determine client-side; fall back to management roles
      return hasRole(role, ["Admin", "ITManager", "TeamLead"]);
    case 'DepartmentHead':
      return hasRole(role, ["Admin", "ITManager"]);
    case 'CostCenterOwner':
      return hasRole(role, ["Admin", "ITManager"]);
    case 'SecurityTeam':
      return hasRole(role, ["Admin", "SecurityAdmin"]);
    case 'SpecificUser':
      // Can't determine client-side without userId; allow approver roles as fallback
      return hasRole(role, APPROVER_ROLES);
    default:
      return hasRole(role, APPROVER_ROLES);
  }
}

// ─── Status tracker ───────────────────────────────────────────────────────────

function StatusTracker({ status }: { status: ServiceRequestStatus }) {
  const isTerminal = ["Rejected", "Cancelled"].includes(status);
  if (isTerminal) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSRStatusStyle(status)}`}>
          {getSRStatusLabel(status)}
        </span>
      </div>
    );
  }
  const idx = SR_STATUS_FLOW.indexOf(status as typeof SR_STATUS_FLOW[number]);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {SR_STATUS_FLOW.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full border-2 ${
                done ? "bg-green-500 border-green-500" :
                active ? "bg-primary border-primary" :
                "bg-background border-muted-foreground/30"
              }`} />
              <span className={`text-[10px] mt-0.5 ${active ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                {getSRStatusLabel(s)}
              </span>
            </div>
            {i < SR_STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 w-8 mb-4 ${done ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ─── Comment thread ───────────────────────────────────────────────────────────

function CommentThread({ id, isStaff }: { id: string; isStaff: boolean }) {
  const { data: comments = [], isLoading } = useServiceRequestComments(id, isStaff);
  const addComment = useAddServiceRequestComment();
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    await addComment.mutateAsync({ id, data: { content: text.trim(), isInternal } });
    setText("");
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments
      </h3>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`rounded-lg border p-3 ${c.isInternal ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20" : "bg-card"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">{c.authorName ?? "Unknown"}</span>
                {c.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply box */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <div className="flex items-center justify-between">
          {isStaff && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded"
              />
              Internal note
            </label>
          )}
          <Button
            size="sm"
            disabled={!text.trim() || addComment.isPending}
            onClick={submit}
            className="ml-auto"
          >
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Approval history ─────────────────────────────────────────────────────────

const DECISION_STYLE: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Delegated: 'bg-blue-100 text-blue-800 border-blue-200',
  Skipped: 'bg-gray-100 text-gray-600 border-gray-200',
};

function ApprovalHistory({ id }: { id: string }) {
  const { data: approvalStatus, isLoading } = useApprovalStatus(id);
  if (isLoading) return <Skeleton className="h-24" />;
  const steps = approvalStatus?.steps;
  if (!steps || steps.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        Approval Steps
        {approvalStatus && (
          <span className="text-xs font-normal text-muted-foreground ml-1">
            ({approvalStatus.completedSteps}/{approvalStatus.totalSteps} completed)
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.stepId ?? i} className={`flex items-start gap-3 text-sm rounded-lg border p-2 ${step.isCurrent ? 'border-primary/40 bg-primary/5' : 'border-transparent'}`}>
            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
              step.status === 'Approved' ? 'bg-green-500' :
              step.status === 'Rejected' ? 'bg-red-500' :
              step.isCurrent ? 'bg-primary animate-pulse' :
              'bg-muted-foreground/30'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{step.stepName ?? `Step ${step.order}`}</span>
                {step.isCurrent && step.status === 'Pending' && (
                  <span className="text-xs text-primary font-medium">← Current</span>
                )}
                <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium border ${DECISION_STYLE[step.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {step.status}
                </span>
              </div>
              {step.approverName && (
                <span className="text-xs text-muted-foreground">by {step.approverName}</span>
              )}
              {step.decidedAt && (
                <span className="text-xs text-muted-foreground ml-2">{new Date(step.decidedAt).toLocaleString()}</span>
              )}
              {step.comments && <p className="text-xs text-muted-foreground mt-0.5">{step.comments}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

function RejectDialog({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Rejection reason <span className="text-destructive">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Explain why this request is being rejected..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={!reason.trim() || loading} onClick={() => onConfirm(reason)}>Reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Cancel Request</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Reason <span className="text-destructive">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why are you cancelling this request?" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Back</Button>
          <Button variant="destructive" disabled={!reason.trim() || loading} onClick={() => onConfirm(reason)}>Cancel Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FulfillDialog({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: (notes: string, actualCost?: number) => void; loading: boolean }) {
  const [notes, setNotes] = useState("");
  const [actualCost, setActualCost] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Mark as Fulfilled</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Fulfillment notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Describe how the request was fulfilled..." />
          </div>
          <div className="space-y-1.5">
            <Label>Actual Cost <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" className="pl-7" value={actualCost} onChange={(e) => setActualCost(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={() => onConfirm(notes, actualCost ? parseFloat(actualCost) : undefined)}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mark Fulfilled
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: (userId: string) => void; loading: boolean }) {
  const [userId, setUserId] = useState("");
  const [staff, setStaff] = useState<import('@/lib/api/users').User[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingStaff(true);
    import('@/lib/api/users').then(m => m.getAssignableStaff()).then(res => {
      if (res.success && res.data) setStaff(res.data);
      setLoadingStaff(false);
    });
  }, [open]);

  const selected = staff.find(s => s.id === userId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Assign Request</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Assignee <span className="text-destructive">*</span></Label>
          {loadingStaff ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a staff member..." />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex flex-col py-0.5">
                      <span className="font-medium">{s.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {[s.role, s.department, s.jobTitle].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selected && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm space-y-0.5">
              <p className="font-medium">{selected.fullName}</p>
              {selected.jobTitle && <p className="text-xs text-muted-foreground">{selected.jobTitle}</p>}
              {selected.department && <p className="text-xs text-muted-foreground">{selected.department}</p>}
              <p className="text-xs text-muted-foreground capitalize">{selected.role}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!userId || loading} onClick={() => onConfirm(userId)}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ISR AI Analysis Panel ────────────────────────────────────────────────────

function ISRAIPanel({ req }: { req: ServiceRequest }) {
  const [expanded, setExpanded] = useState(false);
  const [suggestedName, setSuggestedName] = useState<string | null>(null);

  // Resolve the suggested assignee name when it's present but not auto-assigned
  useEffect(() => {
    if (req.aiSuggestedAssigneeId && !req.assignedToId) {
      import('@/lib/api/users').then(m => m.getUserById(req.aiSuggestedAssigneeId!)).then(res => {
        if (res.success && res.data) setSuggestedName(res.data.fullName ?? res.data.email ?? null);
      });
    }
  }, [req.aiSuggestedAssigneeId, req.assignedToId]);

  const hasAI =
    req.aiConfidenceScore != null ||
    req.aiSuggestedPriority != null ||
    req.aiSuggestedCategoryId != null ||
    req.aiAssignmentReason != null;

  const score = req.aiConfidenceScore ?? 0;
  const pct = Math.round(score * 100);
  const autoAssigned = score >= 0.70 && !!req.assignedToId;

  const barColor =
    score >= 0.70 ? "bg-green-500" : score >= 0.50 ? "bg-amber-500" : "bg-red-500";
  const scoreColor =
    score >= 0.70 ? "text-green-700 dark:text-green-400" : score >= 0.50 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400";

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <span className="font-semibold text-sm">AI Analysis</span>
          <Badge variant="outline" className="text-xs font-normal ml-1">Rule-Based</Badge>
          {hasAI ? (
            req.aiConfidenceScore != null && (
              <span className={`text-xs font-semibold ${scoreColor}`}>{pct}% confidence</span>
            )
          ) : (
            <span className="text-xs text-muted-foreground">No data yet</span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t">
          {/* No AI data yet */}
          {!hasAI && (
            <p className="text-sm text-muted-foreground pt-3">
              No AI analysis data has been recorded for this request yet. The AI runs automatically on creation and after approval.
            </p>
          )}

          {/* Confidence bar */}
          {req.aiConfidenceScore != null && (
            <div className="space-y-1.5 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className={`font-bold ${scoreColor}`}>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Auto-assign threshold: 70%</span>
                <span className={autoAssigned ? "text-green-600 dark:text-green-400 font-medium" : "text-amber-600 dark:text-amber-400"}>
                  {autoAssigned ? "Auto-assigned" : "Manual assignment needed"}
                </span>
              </div>
            </div>
          )}

          {/* Suggestions row */}
          {(req.aiSuggestedPriority || req.aiSuggestedCategoryId) && (
            <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                AI Suggestions (applied at creation)
              </div>
              {req.aiSuggestedPriority && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suggested Priority</span>
                  <Badge variant="outline" className="text-xs">{req.aiSuggestedPriority}</Badge>
                </div>
              )}
              {req.aiSuggestedCategoryId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suggested Category</span>
                  <Badge variant="outline" className="text-xs font-mono">{req.categoryName ?? req.aiSuggestedCategoryId}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Assignment outcome */}
          {autoAssigned && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Auto-assigned by AI
              </div>
              {req.assignedToName && (
                <p className="text-sm text-green-700 dark:text-green-400">
                  Assigned to: <span className="font-medium">{req.assignedToName}</span>
                </p>
              )}
              {req.aiAssignmentReason && (
                <p className="text-xs text-green-600 dark:text-green-500 italic">{req.aiAssignmentReason}</p>
              )}
            </div>
          )}

          {!autoAssigned && req.aiConfidenceScore != null && req.aiConfidenceScore < 0.70 && !req.assignedToId && ["Approved", "InProgress"].includes(req.status) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Manual assignment needed
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                AI confidence ({pct}%) is below the 70% auto-assign threshold. A staff member must assign this request manually.
              </p>
              {(suggestedName ?? req.aiSuggestedAssigneeId) && (
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  AI suggestion: {suggestedName ?? req.aiSuggestedAssigneeId}
                </p>
              )}
            </div>
          )}

          {/* Score breakdown */}
          <div className="rounded border bg-muted/30 p-3 space-y-2 text-xs">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide">How this score was built</p>
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-muted-foreground">
              <span>Base score (always)</span><span className="font-mono text-right">0.40</span>
              <span>Category keyword match</span><span className="font-mono text-right">up to +0.30</span>
              <span>Request type keywords</span><span className="font-mono text-right">up to +0.15</span>
              <span>Eligible fulfiller found</span><span className="font-mono text-right">+0.15</span>
              <span className="font-medium text-foreground pt-1 border-t">Max possible</span>
              <span className="font-mono text-right font-medium text-foreground pt-1 border-t">1.00</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70 pt-1">
              ISR AI is rule-based keyword matching only — no TF-IDF, no Case-Based Reasoning. Auto-assigns when score ≥ 0.70.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workflow action buttons ───────────────────────────────────────────────────

function WorkflowActions({ req, role, isOwner, onUpdate }: { req: ServiceRequest; role: UserRole | string | undefined; isOwner: boolean; onUpdate: () => void }) {
  const submit = useSubmitServiceRequest();
  const approve = useApproveServiceRequest();
  const start = useStartServiceRequest();
  const close = useCloseServiceRequest();
  const deleteMut = useDeleteServiceRequest();
  const { navigateTo, pageParams } = useNavigation();

  const [showReject, setShowReject] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showFulfill, setShowFulfill] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [approveComments, setApproveComments] = useState("");

  const reject = useRejectServiceRequest();
  const cancel = useCancelServiceRequest();
  const fulfill = useFulfillServiceRequest();
  const assign = useAssignServiceRequest();

  // Fetch approval status + applicable workflow to determine if user can approve current step
  const { data: approvalStatus } = useApprovalStatus(
    req.status === 'PendingApproval' ? req.id : undefined
  );
  const { data: workflow } = useWorkflowForRequest(
    req.status === 'PendingApproval' ? req.requestType : undefined,
    req.categoryId ?? undefined
  );

  const { status, id } = req;

  // Determine if user can approve the CURRENT active step (not just any step)
  const isCurrentStepApprover = (() => {
    if (status !== 'PendingApproval') return false;
    const currentStep = approvalStatus?.steps?.find(s => s.isCurrent);
    if (!currentStep || !workflow) {
      // No workflow or step data — fall back to generic approver check
      return hasRole(role, APPROVER_ROLES);
    }
    const workflowStep = workflow.steps?.find(s => s.id === currentStep.stepId);
    if (!workflowStep) return hasRole(role, APPROVER_ROLES);
    return canUserApproveStep(role, workflowStep.approverType, workflowStep.approverRoles ?? []);
  })();

  const isAssigner = hasRole(role, ASSIGNER_ROLES);
  const isFulfiller = hasRole(role, FULFILLER_ROLES);

  // Cancel: draft = owner only; submitted = any non-terminal actor
  const canCancel = !["Closed", "Rejected", "Cancelled"].includes(status) &&
    (status !== "Draft" || isOwner);

  // If no actions apply at all, show nothing
  const hasDraftActions = status === "Draft" && isOwner;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Draft actions — owner only */}
        {hasDraftActions && (
          <>
            <Button size="sm" onClick={async () => { await submit.mutateAsync(id); onUpdate(); }}>
              <Send className="h-4 w-4 mr-1" />
              Submit for Approval
            </Button>
            <Button size="sm" variant="destructive" onClick={async () => { await deleteMut.mutateAsync(id); navigateTo(pageParams?.from ?? "/service-requests/my-requests"); }}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Draft
            </Button>
          </>
        )}

        {/* PendingApproval: approver actions */}
        {status === "PendingApproval" && isCurrentStepApprover && (
          <>
            <Button size="sm" onClick={() => setShowApprove(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowReject(true)}>
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}

        {/* Approved: assign (if no assignee) */}
        {status === "Approved" && isAssigner && !req.assignedToId && (
          <Button size="sm" variant="outline" onClick={() => setShowAssign(true)}>
            <UserCheck className="h-4 w-4 mr-1" />
            Assign
          </Button>
        )}

        {/* Approved → InProgress */}
        {status === "Approved" && isFulfiller && (
          <Button size="sm" onClick={async () => { await start.mutateAsync(id); onUpdate(); }}>
            <Play className="h-4 w-4 mr-1" />
            Start Work
          </Button>
        )}

        {/* InProgress → Fulfilled */}
        {status === "InProgress" && isFulfiller && (
          <Button size="sm" onClick={() => setShowFulfill(true)}>
            <Package className="h-4 w-4 mr-1" />
            Mark Fulfilled
          </Button>
        )}

        {/* Fulfilled → Closed */}
        {status === "Fulfilled" && (
          <Button size="sm" onClick={async () => { await close.mutateAsync(id); onUpdate(); }}>
            <Lock className="h-4 w-4 mr-1" />
            Close Request
          </Button>
        )}

        {/* Cancel (any non-terminal stage) */}
        {canCancel && (
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setShowCancel(true)}>
            Cancel
          </Button>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Comments <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              placeholder="Add any comments or notes for this approval..."
              value={approveComments}
              onChange={e => setApproveComments(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprove(false)}>Cancel</Button>
            <Button disabled={approve.isPending} onClick={async () => {
              await approve.mutateAsync({ id, data: { comments: approveComments || undefined } });
              setShowApprove(false);
              setApproveComments("");
              onUpdate();
            }}>
              {approve.isPending ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <RejectDialog
        open={showReject}
        onClose={() => setShowReject(false)}
        loading={reject.isPending}
        onConfirm={async (reason) => {
          await reject.mutateAsync({ id, data: { reason } });
          setShowReject(false);
          onUpdate();
        }}
      />
      <CancelDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        loading={cancel.isPending}
        onConfirm={async (reason) => {
          await cancel.mutateAsync({ id, data: { reason } });
          setShowCancel(false);
          onUpdate();
        }}
      />
      <FulfillDialog
        open={showFulfill}
        onClose={() => setShowFulfill(false)}
        loading={fulfill.isPending}
        onConfirm={async (notes, actualCost) => {
          await fulfill.mutateAsync({ id, data: { notes, actualCost } });
          setShowFulfill(false);
          onUpdate();
        }}
      />
      <AssignDialog
        open={showAssign}
        onClose={() => setShowAssign(false)}
        loading={assign.isPending}
        onConfirm={async (userId) => {
          await assign.mutateAsync({ id, data: { assignToUserId: userId } });
          setShowAssign(false);
          onUpdate();
        }}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ServiceRequestDetailPage() {
  const { activePage, pageParams, navigateTo } = useNavigation();
  const { user } = useAuth();
  const id = pageParams?.id ?? activePage.split("/").pop() ?? "";

  const { data: req, isLoading, refetch } = useServiceRequest(id);
  const [fulfilledByName, setFulfilledByName] = useState<string | null>(null);

  const isStaff = user?.role !== "EndUser";
  const isOwner = !!user?.id && user.id === req?.requesterId;

  // Resolve fulfilledById → name when the backend doesn't return a name
  useEffect(() => {
    const id = req?.fulfilledById;
    const existingName = req?.fulfilledByName;
    if (!id || existingName) { setFulfilledByName(existingName ?? null); return; }
    import('@/lib/api/users').then(m => m.getUserById(id)).then(res => {
      if (res.success && res.data) setFulfilledByName(res.data.fullName ?? res.data.email ?? id);
    });
  }, [req?.fulfilledById, req?.fulfilledByName]);

  function formatDate(d?: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 opacity-40" />
        <p>Service request not found</p>
        <Button variant="outline" size="sm" onClick={() => navigateTo(pageParams?.from ?? "/service-requests/my-requests")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  // Draft requests are private — only the requester may view them
  if (req.status === "Draft" && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Lock className="h-10 w-10 opacity-40" />
        <p className="font-medium">Access restricted</p>
        <p className="text-sm text-center max-w-xs">
          This request is a draft and can only be viewed by its creator.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigateTo(pageParams?.from ?? (isStaff ? "/service-requests" : "/service-requests/my-requests"))}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigateTo(pageParams?.from ?? (isStaff ? "/service-requests" : "/service-requests/my-requests"))}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-sm text-muted-foreground">{req.requestNumber}</p>
            <h1 className="text-2xl font-bold mt-0.5">{req.subject}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSRPriorityStyle(req.priority)}`}>
              {req.priority}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSRStatusStyle(req.status)}`}>
              {getSRStatusLabel(req.status)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <StatusTracker status={req.status} />
      </div>

      {/* No workflow warning — shown when Draft has no workflow attached */}
      {req.status === "Draft" && req.approvalWorkflowId === null && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">No approval workflow configured</p>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              This request cannot be submitted until an admin configures an approval workflow for{" "}
              <span className="font-medium">{getSRTypeLabel(req.requestType)}</span> requests
              {req.categoryName ? ` (${req.categoryName})` : ""}.
            </p>
          </div>
        </div>
      )}

      {/* Workflow actions */}
      {user && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-3">Actions</h3>
          <WorkflowActions req={req} role={user.role} isOwner={isOwner} onUpdate={() => refetch()} />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-semibold">Request Details</h3>
            <p className="text-sm whitespace-pre-wrap">{req.description}</p>
            {req.justification && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business Justification</p>
                <p className="text-sm whitespace-pre-wrap">{req.justification}</p>
              </div>
            )}
            {req.fulfillmentNotes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Fulfillment Notes</p>
                <p className="text-sm whitespace-pre-wrap">{req.fulfillmentNotes}</p>
              </div>
            )}
            {req.rejectionReason && (
              <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive uppercase tracking-wide mb-1">Rejection Reason</p>
                <p className="text-sm">{req.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-lg border bg-card p-4">
            <CommentThread id={req.id} isStaff={isStaff} />
          </div>

          {/* Approval history */}
          <div className="rounded-lg border bg-card p-4">
            <ApprovalHistory id={req.id} />
          </div>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm">Information</h3>
            <InfoRow icon={Tag} label="Type" value={getSRTypeLabel(req.requestType)} />
            <InfoRow icon={Tag} label="Category" value={req.categoryName} />
            <InfoRow icon={User} label="Requester" value={req.requesterName} />
            <InfoRow icon={User} label="On Behalf Of" value={req.onBehalfOfName} />
            <InfoRow icon={UserCheck} label="Assigned To" value={req.assignedToName} />
            <InfoRow icon={UserCheck} label="Approved By" value={req.approvedByName} />
            <InfoRow icon={UserCheck} label="Fulfilled By" value={fulfilledByName} />
            <InfoRow icon={CalendarDays} label="Created" value={formatDate(req.createdAt)} />
            <InfoRow icon={CalendarDays} label="Submitted" value={formatDate(req.submittedAt)} />
            <InfoRow icon={CalendarDays} label="Required By" value={req.requiredByDate ? new Date(req.requiredByDate).toLocaleDateString() : null} />
            <InfoRow icon={CalendarDays} label="Approved At" value={formatDate(req.approvedAt)} />
            <InfoRow icon={CalendarDays} label="Fulfilled At" value={formatDate(req.fulfilledAt)} />
            <InfoRow icon={CalendarDays} label="Closed At" value={formatDate(req.closedAt)} />
            <InfoRow icon={CalendarDays} label="Cancelled At" value={formatDate(req.cancelledAt)} />
            {(req.estimatedCost != null || req.actualCost != null) && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground w-28 shrink-0">Cost</span>
                <span>
                  {req.estimatedCost != null ? `$${req.estimatedCost.toFixed(2)} est.` : ""}
                  {req.actualCost != null ? ` / $${req.actualCost.toFixed(2)} actual` : ""}
                </span>
              </div>
            )}
          </div>

          {req.tags && req.tags.length > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-sm">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {req.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis — staff only */}
          {isStaff && <ISRAIPanel req={req} />}
        </div>
      </div>
    </div>
  );
}
