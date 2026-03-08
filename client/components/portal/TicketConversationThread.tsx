"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { TicketComment } from "@/lib/api/tickets";
import { cn } from "@/lib/utils";

interface TicketConversationThreadProps {
  comments: TicketComment[];
  currentUserId: string;
  onReply: (content: string) => Promise<void>;
  isReplying?: boolean;
  disabled?: boolean;
}

export function TicketConversationThread({
  comments,
  currentUserId,
  onReply,
  isReplying = false,
  disabled = false,
}: TicketConversationThreadProps) {
  const [replyContent, setReplyContent] = useState("");

  const publicComments = comments.filter((c) => !c.isInternal);

  const handleSubmit = async () => {
    if (!replyContent.trim() || isReplying) return;
    await onReply(replyContent.trim());
    setReplyContent("");
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {publicComments.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-gray-400">
          <MessageSquare className="h-10 w-10 mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">No messages yet</p>
          <p className="text-xs mt-1">
            Send a reply below — our team will respond soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicComments.map((comment) => {
            const isOwn = comment.authorId === currentUserId;
            return (
              <div
                key={comment.id}
                className={cn("flex gap-3", isOwn && "flex-row-reverse")}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-medium",
                      isOwn
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {isOwn ? "Me" : "AG"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex flex-col gap-1 max-w-[75%]",
                    isOwn && "items-end"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      isOwn
                        ? "bg-blue-500 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    )}
                  >
                    {comment.content}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      {!disabled && (
        <div className="border rounded-xl p-3 space-y-2 focus-within:border-blue-200 transition-colors">
          <Textarea
            placeholder="Type your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            className="border-0 resize-none p-0 focus-visible:ring-0 shadow-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Ctrl + Enter to send
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!replyContent.trim() || isReplying}
            >
              {isReplying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {disabled && (
        <p className="text-sm text-gray-400 text-center py-2">
          This ticket is closed. Replies are disabled.
        </p>
      )}
    </div>
  );
}
