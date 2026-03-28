"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { Spinner } from '@/components/ui/spinner';
import { escalateTicket } from "@/lib/api/tickets";
import { getAssignableStaff, User, getUserDisplayName } from "@/lib/api/users";

interface EscalateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  onSuccess: () => void;
}

export function EscalateDialog({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: EscalateDialogProps) {
  const [reason, setReason] = useState("");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      setReason("");
      setTargetUserId("");
      setError(null);
    }
  }, [isOpen]);

  async function loadUsers() {
    setIsLoadingUsers(true);
    const response = await getAssignableStaff();
    if (response.success && response.data) {
      setUsers(response.data.filter((u) => u.isActive));
    }
    setIsLoadingUsers(false);
  }

  async function handleSubmit() {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const response = await escalateTicket(ticketId, {
      reason: reason.trim(),
      targetUserId: targetUserId && targetUserId !== "none" ? targetUserId : undefined,
    });

    if (response.success) {
      onSuccess();
      onClose();
    } else {
      setError(response.error || "Failed to escalate ticket");
    }

    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Escalate Ticket
          </DialogTitle>
          <DialogDescription>
            Escalating marks this ticket as high-priority and notifies senior
            agents. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="escalate-reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="escalate-reason"
              placeholder="Explain why this ticket needs to be escalated..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalate-target">Assign to (optional)</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger id="escalate-target" disabled={isLoadingUsers}>
                <SelectValue
                  placeholder={
                    isLoadingUsers ? "Loading users..." : "Select a senior agent"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific assignee</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {getUserDisplayName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {targetUserId
                ? "The selected agent will be assigned to this escalated ticket."
                : "Without a target, the escalation will be routed to available senior agents."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Escalate Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
