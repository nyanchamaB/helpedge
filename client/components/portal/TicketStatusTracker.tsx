"use client";

import { CheckCircle2, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  key: string;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  { key: "submitted", label: "Submitted", description: "Ticket received" },
  { key: "inReview", label: "In Review", description: "Awaiting assignment" },
  { key: "assigned", label: "Assigned", description: "Agent assigned" },
  { key: "inProgress", label: "In Progress", description: "Work underway" },
  { key: "waitingUser", label: "Waiting for You", description: "Your response needed" },
  { key: "resolved", label: "Resolved", description: "Issue fixed" },
  { key: "closed", label: "Closed", description: "Ticket closed" },
];

// Override description when a stage is the active (current) stage
function getActiveDescription(stageKey: string): string {
  if (stageKey === "assigned") return "Awaiting acknowledgement";
  return STAGES.find((s) => s.key === stageKey)?.description ?? "";
}

function getActiveStageIndex(status: string, hasAssignee: boolean): number {
  switch (status) {
    case "Open":
      return hasAssignee ? 2 : 1;
    case "InProgress":
      return 3;
    case "OnHold":
    case "AwaitingInfo":
      return 4;
    case "Resolved":
      return 5;
    case "Closed":
      return 6;
    default:
      return 0;
  }
}

interface TicketStatusTrackerProps {
  status: string;
  hasAssignee: boolean;
  createdAt?: string;
  resolvedAt?: string;
}

export function TicketStatusTracker({
  status,
  hasAssignee,
}: TicketStatusTrackerProps) {
  const activeIndex = getActiveStageIndex(status, hasAssignee);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-max px-2 py-4">
        {STAGES.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isLast = index === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5 w-20">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-blue-500 border-blue-500 text-white",
                    !isCompleted && !isCurrent && "bg-white border-gray-200 text-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isCurrent && "text-blue-600",
                      isCompleted && "text-green-600",
                      !isCompleted && !isCurrent && "text-gray-400"
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {isCurrent ? getActiveDescription(stage.key) : stage.description}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 w-8 mt-4 shrink-0",
                    index < activeIndex ? "bg-green-400" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
