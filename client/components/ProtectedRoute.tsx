"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { validateStoredToken, clearInvalidToken } from '@/lib/auth/tokenValidator';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Enhanced ProtectedRoute Component
 * Protects authenticated routes with multi-layer validation:
 * 1. Client-side token validation (checks expiry)
 * 2. AuthContext state validation
 * Redirects unauthenticated users to login with return URL
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [tokenValidated, setTokenValidated] = useState(false);

  // First layer: Validate token on mount and route changes
  useEffect(() => {
    validateAuthToken();
  }, [pathname]);

  // Second layer: Monitor AuthContext state
  useEffect(() => {
    if (!isLoading && !isAuthenticated && tokenValidated) {
      // Redirect to login with the current path as redirect parameter
      const redirectUrl = encodeURIComponent(pathname);
      console.log('ProtectedRoute: Not authenticated, redirecting to login');
      router.replace(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, tokenValidated, router, pathname]);

  async function validateAuthToken() {
    try {
      // Validate stored token
      const validation = validateStoredToken();

      if (!validation.isValid) {
        console.log('ProtectedRoute: Token validation failed:', validation.error);

        // Clear invalid or expired token
        clearInvalidToken();

        // If token is invalid and user is authenticated in context, trigger logout
        if (isAuthenticated) {
          console.log('ProtectedRoute: Logging out due to invalid token');
          logout();
        }

        // Don't redirect here - let the useEffect handle it after AuthContext finishes loading
        // This prevents race conditions on page refresh
      } else {
        console.log('ProtectedRoute: Token is valid');
      }

      setTokenValidated(true);
    } catch (error) {
      console.error('ProtectedRoute: Error validating token:', error);
      clearInvalidToken();
      setTokenValidated(true);
    }
  }

  // Show loading state while checking authentication
  if (isLoading || !tokenValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
