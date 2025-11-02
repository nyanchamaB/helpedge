"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { validateStoredToken, clearInvalidToken } from '@/lib/auth/tokenValidator';

/**
 * ProtectedRoute Component
 * Protects authenticated routes from unauthenticated users
 * Redirects unauthenticated users to login with return URL
 * Prevents flicker by showing loading state during validation
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional callback when user is not authenticated
   * If not provided, redirects to login
   */
  onUnauthenticated?: () => void;
}

export default function ProtectedRoute({
  children,
  onUnauthenticated
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [pathname]);

  async function checkAuthAndRedirect() {
    try {
      // Validate stored token
      const validation = validateStoredToken();

      if (validation.isValid) {
        // User is authenticated, allow access
        console.log('ProtectedRoute: User is authenticated');
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Token is invalid or expired
      console.log('ProtectedRoute: Token invalid or expired:', validation.error);

      // Clear invalid token
      clearInvalidToken();

      // Handle unauthenticated state
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname || '/dashboard');
        console.log('ProtectedRoute: Redirecting to login, return URL:', returnUrl);
        router.replace(`/auth/login?redirect=${returnUrl}`);
      }
    } catch (error) {
      console.error('ProtectedRoute: Error checking auth:', error);

      // On error, assume not authenticated and redirect to login
      clearInvalidToken();
      const returnUrl = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/auth/login?redirect=${returnUrl}`);
    }
  }

  // Show loading state during validation to prevent flicker
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
