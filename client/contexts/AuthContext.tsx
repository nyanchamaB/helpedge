"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  validateToken,
  type LoginRequest,
  type RegisterRequest,
  type User,
} from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
   * Validates token and loads user data
   */
  async function initializeAuth() {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Validate token with backend
      const response = await validateToken(token);

      if (response.success && response.data?.valid) {
        // Get user from token
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
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
   */
  async function login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AuthContext: Calling login API...');
      const response = await apiLogin(credentials);
      console.log('AuthContext: Login API response:', response);

      // Check if token was stored (apiLogin handles token storage)
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('AuthContext: Token in localStorage:', storedToken ? 'YES' : 'NO');

      if (response.success && storedToken) {
        // Get user from the newly stored token
        console.log('AuthContext: Getting current user from token...');
        const currentUser = getCurrentUser();
        console.log('AuthContext: Current user:', currentUser);

        setUser(currentUser);

        if (currentUser) {
          console.log('AuthContext: Login successful, user set');
          return { success: true };
        } else {
          console.error('AuthContext: Failed to extract user from token');
          return {
            success: false,
            error: 'Failed to extract user information from token.'
          };
        }
      } else {
        console.error('AuthContext: Login failed or no token stored');
        return {
          success: false,
          error: response.error || 'Login failed. Please check your credentials.'
        };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Register new user
   * Note: Backend registration does not return a token, so we auto-login after successful registration
   */
  async function register(userData: RegisterRequest): Promise<{ success: boolean; error?: string }> {
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
          error: response.error || 'Registration failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Logout user
   */
  function logout() {
    console.log('AuthContext: Logging out...');
    apiLogout();
    setUser(null);
    console.log('AuthContext: User cleared, redirecting to login...');
    // Use Next.js router for client-side navigation
    router.push('/auth/login');
  }

  /**
   * Refresh user data from token
   */
  async function refreshUser() {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
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
