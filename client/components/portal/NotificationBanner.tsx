"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "warning" | "info" | "error";

interface NotificationBannerProps {
  type?: NotificationType;
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
};

export function NotificationBanner({
  type = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
}: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-xl border",
        config.bg,
        config.border
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.text)}>{title}</p>
        {message && (
          <p className={cn("text-xs mt-0.5 opacity-80", config.text)}>{message}</p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className={cn("shrink-0 opacity-60 hover:opacity-100 transition-opacity", config.text)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
