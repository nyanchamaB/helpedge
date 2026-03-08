"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addTicketComment } from "@/lib/api/tickets";
import { Lock, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AgentResponseBoxProps {
  ticketId: string;
  authorId: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function AgentResponseBox({
  ticketId,
  authorId,
  onSuccess,
  disabled = false,
}: AgentResponseBoxProps) {
  const [replyContent, setReplyContent] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (content: string, isInternal: boolean) => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    const response = await addTicketComment(ticketId, {
      content: content.trim(),
      authorId,
      isInternal,
    });
    if (response.success) {
      isInternal ? setNoteContent("") : setReplyContent("");
      toast.success(isInternal ? "Note added" : "Reply sent");
      onSuccess?.();
    } else {
      toast.error("Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <Tabs defaultValue="reply">
      <TabsList className="w-full">
        <TabsTrigger value="reply" className="flex-1 gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Reply to User
        </TabsTrigger>
        <TabsTrigger value="note" className="flex-1 gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Internal Note
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reply" className="space-y-2 mt-3">
        <Textarea
          placeholder="Write a reply that the user will see..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={4}
          disabled={disabled || isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
              submit(replyContent, false);
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Ctrl + Enter to send</span>
          <Button
            size="sm"
            onClick={() => submit(replyContent, false)}
            disabled={!replyContent.trim() || isSubmitting || disabled}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1.5" />
            )}
            Send Reply
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="note" className="space-y-2 mt-3">
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 flex items-center gap-1.5">
          <Lock className="h-3 w-3 shrink-0" />
          Internal notes are only visible to staff — not the user.
        </div>
        <Textarea
          placeholder="Add an internal note for your team..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={4}
          disabled={disabled || isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
              submit(noteContent, true);
          }}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => submit(noteContent, true)}
            disabled={!noteContent.trim() || isSubmitting || disabled}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save Note
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
