'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  validateToken,
  getDashboardRouteForRole,
  refreshToken as apiRefreshToken,
  type LoginRequest,
  type RegisterRequest,
  type User,
  type UserRole,
} from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: LoginRequest,
    redirectTo?: string,
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (
    userData: RegisterRequest,
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * Validates token (including expiry) and loads user data
   * Token is stored in cookies (set by backend via Set-Cookie header)
   */
  async function initializeAuth() {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? getAuthToken() : null;

      if (!token) {
        setUser(null);
        setIsLoading(false);

        return;
      }

      // First, perform client-side token validation (structure + expiry check)
      // This is faster and prevents unnecessary API calls for expired tokens
      const { validateStoredToken: validateTokenClient, clearInvalidToken } =
        await import('@/lib/auth/tokenValidator');
      const clientValidation = validateTokenClient();

      if (!clientValidation.isValid) {
        console.log('AuthContext: Client-side token validation failed:', clientValidation.error);
        // Clear invalid or expired token
        clearInvalidToken();
        setUser(null);
        setIsLoading(false);

        return;
      }

      // Client-side validation passed, get user from token
      const currentUser = getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        console.log('AuthContext: User authenticated from token:', currentUser.email);

        // Optionally validate with backend for signature verification
        // But don't fail if backend is unavailable - trust client-side validation
        try {
          const response = await validateToken(token);

          // Backend returns { isValid: true } not { valid: true }
          if (!response.success || !response.data?.valid) {
            console.warn(
              'AuthContext: Backend token validation failed, but trusting client-side validation',
            );
          } else {
            console.log('AuthContext: Backend token validation successful');
          }
        } catch (backendError) {
          console.warn(
            'AuthContext: Could not reach backend for token validation, but trusting client-side validation',
          );
        }
      } else {
        // Could not extract user from token
        console.log('AuthContext: Could not extract user from token');
        // Clear the cookie by calling logout
        apiLogout();
        setUser(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Login user
   * Backend sets auth cookie via Set-Cookie header automatically
   * Returns the appropriate dashboard route for the user's role
   */
  async function login(
    credentials: LoginRequest,
    redirectTo?: string,
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
    try {
      console.log('AuthContext: Calling login API...');
      const response = await apiLogin(credentials);

      console.log('AuthContext: Login API response:', response);

      // Check if cookie was set by the backend (via Set-Cookie header)
      const storedToken = typeof window !== 'undefined' ? getAuthToken() : null;

      console.log('AuthContext: Token in cookie:', storedToken ? 'YES' : 'NO');

      if (response.success && storedToken) {
        // Get user from the newly set cookie token
        console.log('AuthContext: Getting current user from token...');
        const currentUser = getCurrentUser();

        console.log('AuthContext: Current user:', currentUser);

        setUser(currentUser);

        if (currentUser) {
          // Determine redirect URL based on role or custom redirect
          const roleBasedRoute = getDashboardRouteForRole(currentUser.role);
          const redirectUrl = redirectTo || roleBasedRoute;

          console.log('AuthContext: Login successful, user role:', currentUser.role);
          console.log('AuthContext: Redirecting to:', redirectUrl);

          return { success: true, redirectUrl };
        } else {
          console.error('AuthContext: Failed to extract user from token');

          return {
            success: false,
            error: 'Failed to extract user information from token.',
          };
        }
      } else {
        console.error('AuthContext: Login failed or no token in cookie');

        return {
          success: false,
          error: response.error || 'Login failed. Please check your credentials.',
        };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);

      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Register new user
   * Note: Backend registration does not return a token, so we auto-login after successful registration
   */
  async function register(
    userData: RegisterRequest,
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
    try {
      const response = await apiRegister(userData);

      if (response.success) {
        // Registration successful, now automatically login the user
        console.log('Registration successful, auto-logging in...');
        const loginResult = await login({ email: userData.email, password: userData.password });

        return loginResult;
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed. Please try again.',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Get the dashboard route for the current user's role
   */
  function getDashboardRoute(): string {
    if (!user) {return '/dashboard';}

    return getDashboardRouteForRole(user.role);
  }

  /**
   * Logout user - clears all storage and calls backend
   */
  async function logout(): Promise<void> {
    console.log('AuthContext: Logging out...');
    try {
      await apiLogout();
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
    setUser(null);
    console.log('AuthContext: User cleared, redirecting to login...');
    // Use Next.js router for client-side navigation
    router.push('/auth/login');
  }

  /**
   * Refresh user data from token
   */
  async function refreshUser(): Promise<void> {
    const currentUser = getCurrentUser();

    setUser(currentUser);
  }

  /**
   * Refresh the authentication session
   * Returns true if refresh was successful
   */
  async function refreshSession(): Promise<boolean> {
    try {
      console.log('AuthContext: Refreshing session...');
      const result = await apiRefreshToken();

      if (result.success) {
        // Update user data from the new token
        const currentUser = getCurrentUser();

        setUser(currentUser);
        console.log('AuthContext: Session refreshed successfully');

        return true;
      } else {
        console.error('AuthContext: Session refresh failed:', result.error);

        return false;
      }
    } catch (error) {
      console.error('AuthContext: Session refresh error:', error);

      return false;
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    refreshSession,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
