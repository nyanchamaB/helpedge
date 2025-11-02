"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { validateStoredToken, clearInvalidToken } from '@/lib/auth/tokenValidator';

/**
 * PublicRoute Component
 * Protects public routes (login, register) from authenticated users
 * Uses multi-layer validation:
 * 1. Client-side token validation (checks expiry)
 * 2. AuthContext state validation
 * Redirects authenticated users to dashboard
 * Prevents flicker by showing loading state during validation
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [tokenValidated, setTokenValidated] = useState(false);

  // First layer: Validate token on mount
  useEffect(() => {
    validateAuthToken();
  }, []);

  // Second layer: Monitor AuthContext state
  useEffect(() => {
    if (!isLoading && isAuthenticated && tokenValidated) {
      // User is authenticated, redirect to dashboard
      console.log('PublicRoute: User is authenticated (via context), redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, tokenValidated, router]);

  async function validateAuthToken() {
    try {
      // Validate stored token
      const validation = validateStoredToken();

      if (validation.isValid) {
        // Token is valid, but let AuthContext confirm authentication
        console.log('PublicRoute: Token is valid, checking auth context...');
      } else {
        // Token is invalid or expired, clear it
        console.log('PublicRoute: Token invalid or expired, clearing');
        clearInvalidToken();
      }

      setTokenValidated(true);
    } catch (error) {
      console.error('PublicRoute: Error validating token:', error);
      setTokenValidated(true);
    }
  }

  // Show loading state during validation to prevent flicker
  if (isLoading || !tokenValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated (redirect will happen via useEffect)
  if (isAuthenticated) {
    return null;
  }

  // Render children if not authenticated
  return <>{children}</>;
}
