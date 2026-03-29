'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getTokenExpirationTime,
  isTokenExpiringSoon,
  isTokenExpired,
  refreshToken,
  logout as apiLogout,
} from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/client';

// Session timeout in minutes (30 minutes as requested)
const SESSION_TIMEOUT_MINUTES = 30;
// Warning time before expiration (5 minutes as requested)
const WARNING_BEFORE_EXPIRY_MINUTES = 5;
// Check interval in seconds
const CHECK_INTERVAL_SECONDS = 30;

export interface SessionState {
  isAuthenticated: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  remainingTime: number | null; // in seconds
  remainingTimeFormatted: string;
}

export interface UseSessionManagerReturn {
  sessionState: SessionState;
  refreshSession: () => Promise<boolean>;
  endSession: () => Promise<void>;
  showExpiryWarning: boolean;
  showExpiredAlert: boolean;
  dismissExpiryWarning: () => void;
  dismissExpiredAlert: () => void;
}

export function useSessionManager(): UseSessionManagerReturn {
  const [sessionState, setSessionState] = useState<SessionState>({
    isAuthenticated: false,
    isExpiringSoon: false,
    isExpired: false,
    remainingTime: null,
    remainingTimeFormatted: '',
  });

  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);
  const warningDismissedRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format remaining time as MM:SS
  const formatRemainingTime = useCallback((seconds: number | null): string => {
    if (seconds === null || seconds <= 0) {return '00:00';}
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Check session status
  const checkSession = useCallback(() => {
    const token = getAuthToken();

    if (!token) {
      setSessionState((prev) => {
        // Only update if state has changed
        if (!prev.isExpired || prev.isAuthenticated || prev.remainingTime !== null) {
          return {
            isAuthenticated: false,
            isExpiringSoon: false,
            isExpired: true,
            remainingTime: null,
            remainingTimeFormatted: '00:00',
          };
        }

        return prev;
      });

      return;
    }

    const remainingTime = getTokenExpirationTime();
    const expiringSoon = isTokenExpiringSoon(WARNING_BEFORE_EXPIRY_MINUTES);
    const expired = isTokenExpired();

    setSessionState((prev) => {
      const newState = {
        isAuthenticated: !expired,
        isExpiringSoon: expiringSoon && !expired,
        isExpired: expired,
        remainingTime,
        remainingTimeFormatted: formatRemainingTime(remainingTime),
      };

      // Only update if something has changed
      if (
        prev.isAuthenticated !== newState.isAuthenticated ||
        prev.isExpiringSoon !== newState.isExpiringSoon ||
        prev.isExpired !== newState.isExpired ||
        prev.remainingTime !== newState.remainingTime
      ) {
        return newState;
      }

      return prev;
    });

    // Show expiry warning if expiring soon and not dismissed
    if (expiringSoon && !expired && !warningDismissedRef.current) {
      setShowExpiryWarning(true);
    }

    // Show expired alert if token has expired
    if (expired) {
      setShowExpiredAlert(true);
      setShowExpiryWarning(false);
    }
  }, [formatRemainingTime]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh session...');
      const result = await refreshToken();

      if (result.success) {
        console.log('Session refreshed successfully');
        warningDismissedRef.current = false;
        setShowExpiryWarning(false);

        // Small delay to ensure cookie is updated before checking session
        setTimeout(() => {
          checkSession(); // Update state with new token info
        }, 100);

        return true;
      } else {
        console.error('Failed to refresh session:', result.error);

        return false;
      }
    } catch (error) {
      console.error('Error refreshing session:', error);

      return false;
    }
  }, [checkSession]);

  // End session (logout)
  const endSession = useCallback(async (): Promise<void> => {
    try {
      await apiLogout();
      setSessionState({
        isAuthenticated: false,
        isExpiringSoon: false,
        isExpired: true,
        remainingTime: null,
        remainingTimeFormatted: '00:00',
      });
      setShowExpiryWarning(false);
      setShowExpiredAlert(false);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, []);

  // Dismiss expiry warning
  const dismissExpiryWarning = useCallback(() => {
    warningDismissedRef.current = true;
    setShowExpiryWarning(false);
  }, []);

  // Dismiss expired alert
  const dismissExpiredAlert = useCallback(() => {
    setShowExpiredAlert(false);
  }, []);

  // Set up interval to check session status
  useEffect(() => {
    // Initial check
    const initTimeout = setTimeout(() => {
      checkSession();
    }, 0);

    // Set up interval
    checkIntervalRef.current = setInterval(() => {
      checkSession();
    }, CHECK_INTERVAL_SECONDS * 1000);

    return () => {
      clearTimeout(initTimeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkSession]);

  // Reset warning dismissed flag when token changes (e.g., after refresh)
  useEffect(() => {
    const handleStorageChange = () => {
      warningDismissedRef.current = false;
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    sessionState,
    refreshSession,
    endSession,
    showExpiryWarning,
    showExpiredAlert,
    dismissExpiryWarning,
    dismissExpiredAlert,
  };
}

export default useSessionManager;
