"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  acknowledgeTicket,
  resolveTicket,
  addTicketComment,
  Ticket,
  getStatusString,
} from "@/lib/api/tickets";
import {
  Play,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResolverWorkPanelProps {
  ticket: Ticket;
  currentUserId: string;
  onUpdate: () => void;
}

export function ResolverWorkPanel({
  ticket,
  currentUserId,
  onUpdate,
}: ResolverWorkPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [infoRequest, setInfoRequest] = useState("");
  const [showInfoForm, setShowInfoForm] = useState(false);

  const isAssignee = ticket.assignedToId === currentUserId;
  const canWork = isAssignee;

  async function handleStartWork() {
    setIsProcessing(true);
    const res = await acknowledgeTicket(ticket.id);
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
    if (!infoRequest.trim()) return;
    setIsProcessing(true);
    // Add an external comment asking for more info
    const res = await addTicketComment(ticket.id, {
      content: infoRequest.trim(),
      authorId: currentUserId,
      isInternal: false,
    });
    if (res.success) {
      toast.success("Information request sent to user");
      setInfoRequest("");
      setShowInfoForm(false);
      onUpdate();
    } else {
      toast.error("Failed to send request");
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
          className={cn(
            "text-sm",
            ticket.status === "Open" && "bg-blue-50 text-blue-700 border-blue-200",
            ticket.status === "InProgress" && "bg-yellow-50 text-yellow-700 border-yellow-200",
            ticket.status === "OnHold" && "bg-purple-50 text-purple-700 border-purple-200",
            ticket.status === "Resolved" && "bg-green-50 text-green-700 border-green-200",
            ticket.status === "Closed" && "bg-gray-50 text-gray-600 border-gray-200"
          )}
        >
          {getStatusString(ticket.status)}
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
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Start Working
        </Button>
      )}

      {/* Request info */}
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
                This message will be sent to the user
              </p>
              <Textarea
                placeholder="Describe what additional information you need..."
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
                  disabled={!infoRequest.trim() || isProcessing}
                >
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mark resolved */}
      {(ticket.status === "InProgress" || ticket.status === "OnHold") &&
        canWork && (
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleResolve}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
