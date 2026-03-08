"use client";

import { format } from "date-fns";
import { Lock, StickyNote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TicketComment } from "@/lib/api/tickets";

interface InternalNotesPanelProps {
  comments: TicketComment[];
}

export function InternalNotesPanel({ comments }: InternalNotesPanelProps) {
  const notes = comments.filter((c) => c.isInternal);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-gray-400">
        <StickyNote className="h-8 w-8 mb-2 text-gray-200" />
        <p className="text-sm">No internal notes yet</p>
        <p className="text-xs mt-0.5">Use the Internal Note tab below to add one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note, idx) => (
        <div key={note.id}>
          <div className="flex items-start gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                ST
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Lock className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">
                  Internal note
                </span>
                <span className="text-xs text-gray-400">
                  · {format(new Date(note.createdAt), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          </div>
          {idx < notes.length - 1 && <Separator className="mt-3" />}
        </div>
      ))}
    </div>
  );
}
