"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";

interface SessionAlertProps {
  onLogout?: () => void;
}

export function SessionAlert({ onLogout }: SessionAlertProps) {
  const router = useRouter();
  const {
    sessionState,
    refreshSession,
    endSession,
    showExpiryWarning,
    showExpiredAlert,
    dismissExpiryWarning,
    dismissExpiredAlert,
  } = useSessionManager();

  // Handle session refresh
  const handleRefresh = async () => {
    const success = await refreshSession();
    if (!success) {
      // If refresh fails, show expired alert
      dismissExpiryWarning();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await endSession();
    dismissExpiredAlert();
    dismissExpiryWarning();
    onLogout?.();
    router.push("/auth/login");
  };

  // Handle expired - redirect to login
  const handleExpiredLogin = async () => {
    await endSession();
    dismissExpiredAlert();
    router.push("/auth/login?expired=true");
  };

  return (
    <>
      {/* Session Expiring Soon Warning */}
      <AlertDialog open={showExpiryWarning} onOpenChange={dismissExpiryWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              Session Expiring Soon
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your session will expire in{" "}
                <span className="font-bold text-yellow-600">
                  {sessionState.remainingTimeFormatted}
                </span>
              </p>
              <p>Would you like to extend your session?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismissExpiryWarning}>
              Dismiss
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Extend Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Expired Alert */}
      <AlertDialog open={showExpiredAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" />
              Session Expired
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your session has expired for security reasons. Please log in
                again to continue.
              </p>
              <p className="text-sm text-muted-foreground">
                Sessions expire after 30 minutes of the token being issued.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleExpiredLogin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Compact session timer display for header/navbar
export function SessionTimer() {
  const { sessionState } = useSessionManager();

  if (!sessionState.isAuthenticated) return null;

  return (
    <div
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
        sessionState.isExpiringSoon
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <Clock className="h-3 w-3" />
      <span>{sessionState.remainingTimeFormatted}</span>
    </div>
  );
}

export default SessionAlert;
