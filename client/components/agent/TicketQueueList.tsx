"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface QueueItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
  description: string;
  colorClasses: { bg: string; iconBg: string; iconText: string; border: string };
  onClick: () => void;
}

interface TicketQueueListProps {
  queues: QueueItem[];
  isLoading?: boolean;
  activeQueueId?: string;
}

export function TicketQueueList({
  queues,
  isLoading = false,
  activeQueueId,
}: TicketQueueListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {queues.map((queue) => {
        const Icon = queue.icon;
        const isActive = queue.id === activeQueueId;
        return (
          <button
            key={queue.id}
            onClick={queue.onClick}
            className={cn(
              "flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:shadow-md",
              isActive
                ? cn(queue.colorClasses.bg, queue.colorClasses.border, "shadow-md")
                : "bg-white border-gray-100 hover:border-gray-200"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg mb-3",
                isActive ? queue.colorClasses.iconBg : "bg-gray-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? queue.colorClasses.iconText : "text-gray-500"
                )}
              />
            </div>
            <p className="text-2xl font-bold leading-none mb-1">{queue.count}</p>
            <p
              className={cn(
                "text-sm font-medium",
                isActive ? queue.colorClasses.iconText : "text-gray-700"
              )}
            >
              {queue.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{queue.description}</p>
          </button>
        );
      })}
    </div>
  );
}
