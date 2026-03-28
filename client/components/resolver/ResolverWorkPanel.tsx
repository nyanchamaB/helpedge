"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  acknowledgeTicket,
  resolveTicket,
  requestAwaitingInfo,
  markInProgress,
  addTicketComment,
  Ticket,
  getEffectiveStatusLabel,
  getEffectiveStatusStyle,
} from "@/lib/api/tickets";
import {
  Play,
  CheckCircle2,
  MessageSquare,
  Info,
} from "lucide-react";
import { Spinner } from '@/components/ui/spinner';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResolverWorkPanelProps {
  ticket: Ticket;
  currentUserId: string;
  currentUserRole?: string;
  onUpdate: () => void;
}

export function ResolverWorkPanel({
  ticket,
  currentUserId,
  currentUserRole,
  onUpdate,
}: ResolverWorkPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [infoRequest, setInfoRequest] = useState("");
  const [showInfoForm, setShowInfoForm] = useState(false);

  const isAssignee = ticket.assignedToId === currentUserId;
  const canWork = isAssignee;

  async function handleStartWork() {
    setIsProcessing(true);
    // SystemAdmin uses /acknowledge (records acknowledgedAt); all other roles use /mark-in-progress
    const res =
      currentUserRole === "SystemAdmin"
        ? await acknowledgeTicket(ticket.id)
        : await markInProgress(ticket.id);
    if (res.success) {
      toast.success("Ticket moved to In Progress");
      onUpdate();
    } else {
      toast.error("Failed to start work");
    }
    setIsProcessing(false);
  }

  async function handleResolve() {
    setIsProcessing(true);
    const res = await resolveTicket(ticket.id);
    if (res.success) {
      toast.success("Ticket marked as resolved");
      onUpdate();
    } else {
      toast.error("Failed to resolve ticket");
    }
    setIsProcessing(false);
  }

  async function handleRequestInfo() {
    setIsProcessing(true);
    // Change ticket status to AwaitingInfo
    const statusRes = await requestAwaitingInfo(ticket.id);
    if (!statusRes.success) {
      toast.error("Failed to flag ticket as awaiting info");
      setIsProcessing(false);
      return;
    }
    // Optionally send a comment to the user explaining what's needed
    if (infoRequest.trim()) {
      await addTicketComment(ticket.id, {
        content: infoRequest.trim(),
        authorId: currentUserId,
        isInternal: false,
      });
    }
    toast.success("Ticket flagged as awaiting information");
    setInfoRequest("");
    setShowInfoForm(false);
    onUpdate();
    setIsProcessing(false);
  }

  async function handleResumeWork() {
    setIsProcessing(true);
    const res = await markInProgress(ticket.id);
    if (res.success) {
      toast.success("Ticket resumed — back to In Progress");
      onUpdate();
    } else {
      toast.error("Failed to resume ticket");
    }
    setIsProcessing(false);
  }

  return (
    <div className="space-y-4">
      {/* Current status */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Current Status</p>
        <Badge
          variant="outline"
          className={cn("text-sm", getEffectiveStatusStyle(ticket.status, ticket.assignedToId))}
        >
          {getEffectiveStatusLabel(ticket.status, ticket.assignedToId)}
        </Badge>
      </div>

      {!canWork && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2.5 border">
          You are not assigned to this ticket. Ticket actions are restricted.
        </p>
      )}

      {/* Start work */}
      {ticket.status === "Open" && canWork && (
        <Button
          className="w-full"
          onClick={handleStartWork}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Start Working
        </Button>
      )}

      {/* Request info — flag as AwaitingInfo (from InProgress) */}
      {ticket.status === "InProgress" && canWork && (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowInfoForm((v) => !v)}
            disabled={isProcessing}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Request More Information
          </Button>

          {showInfoForm && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Ticket will be paused and marked as awaiting info. Optionally add a message for the user.
              </p>
              <Textarea
                placeholder="(Optional) Describe what additional information you need..."
                value={infoRequest}
                onChange={(e) => setInfoRequest(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfoForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRequestInfo}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Spinner size="xs" className="mr-1" /> : null}
                  Confirm & Pause
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resume Work — move AwaitingInfo/OnHold back to InProgress */}
      {(ticket.status === "AwaitingInfo" || ticket.status === "OnHold") && canWork && (
        <Button
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={handleResumeWork}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Resume Work
        </Button>
      )}

      {/* Mark resolved */}
      {(ticket.status === "InProgress" || ticket.status === "OnHold" || ticket.status === "AwaitingInfo") &&
        canWork && (
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleResolve}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Mark as Resolved
          </Button>
        )}

      {(ticket.status === "Resolved" || ticket.status === "Closed") && (
        <p className="text-sm text-center text-gray-400 py-2">
          This ticket has been resolved.
        </p>
      )}
    </div>
  );
}
