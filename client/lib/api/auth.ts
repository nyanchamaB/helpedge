// Authentication API endpoints
import { apiRequest, ApiResponse, removeAuthToken, getAuthToken } from './client';

// All available user roles in the system
export const USER_ROLES = [
  'Admin',
  'ITManager',
  'TeamLead',
  'SystemAdmin',
  'ServiceDeskAgent',
  'Technician',
  'SecurityAdmin',
  'EndUser',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Role descriptions for display purposes
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Admin: 'System administrator with full control',
  ITManager: 'Responsible for strategic oversight, reporting, and team management',
  TeamLead: 'Manages support teams and workload distribution',
  SystemAdmin: 'Manages systems like servers, AD, and databases with SLAs',
  ServiceDeskAgent: 'First-line support, responsible for ticket triage',
  Technician: 'Second-line support, focusing on technical resolutions',
  SecurityAdmin: 'Handles security requests and access management',
  EndUser: 'Submits tickets and tracks their own requests',
};

// Dashboard route for each role
// All roles use the main /dashboard route - the RoleDashboard component
// displays role-specific content based on the user's role
export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  Admin: '/dashboard',
  ITManager: '/dashboard',
  TeamLead: '/dashboard',
  SystemAdmin: '/dashboard',
  ServiceDeskAgent: '/dashboard',
  Technician: '/dashboard',
  SecurityAdmin: '/dashboard',
  EndUser: '/dashboard',
};

// Backend string role to normalized UserRole mapping
export const BACKEND_ROLE_MAP: Record<string, UserRole> = {
  Admin: 'Admin',
  ITManager: 'ITManager',
  TeamLead: 'TeamLead',
  SystemAdmin: 'SystemAdmin',
  ServiceDeskAgent: 'ServiceDeskAgent',
  Technician: 'Technician',
  SecurityAdmin: 'SecurityAdmin',
  EndUser: 'EndUser',
  // Legacy mappings for backwards compatibility
  SuperAdmin: 'Admin',
  admin: 'Admin',
  Agent: 'ServiceDeskAgent',
  agent: 'ServiceDeskAgent',
  end_user: 'EndUser',
};

// Legacy role type for backwards compatibility
export type RoleString = 'admin' | 'agent' | 'end_user';

// Legacy role maps for backwards compatibility
export const ROLE_MAP = {
  admin: 0,
  agent: 1,
  end_user: 2,
} as const;

export const ROLE_REVERSE_MAP = {
  0: 'admin',
  1: 'agent',
  2: 'end_user',
} as const;

export type RoleNumber = (typeof ROLE_MAP)[RoleString];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: RoleNumber;
    department?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: RoleString;
  department?: string;
  phone?: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: RoleNumber;
    department?: string;
  };
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: RoleNumber;
    department?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

/**
 * Set the authentication token in a cookie
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {return;}
  // Set cookie with secure flags (httpOnly can only be set by server)
  // Cookie expires in 7 days (matching typical JWT expiry)
  const expires = new Date();

  expires.setDate(expires.getDate() + 7);
  document.cookie = `authToken=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Login user
 * Uses credentials: 'omit' to avoid CORS issues, then manually sets the cookie
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiRequest<LoginResponse>('/api/Auth/login', {
    method: 'POST',
    body: credentials,
    includeAuth: false,
    credentials: 'omit', // Avoid CORS issues with credentials
  });

  console.warn('Login API response:', response);

  // If login successful, manually set the cookie from the token in the response
  if (response.success && response.data) {
    const token = response.data.token; //|| response.data.Token;

    if (token) {
      console.warn('Setting auth token cookie manually');
      setAuthToken(token);
    }
  }

  return response;
}

/**
 * Register new user
 * Note: Backend returns UserDto only, not a token. User must login separately.
 */
export async function register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  // Convert role string to number for API
  const apiData = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: ROLE_MAP[userData.role],
    department: userData.department || undefined,
  };

  const response = await apiRequest<RegisterResponse>('/api/Auth/register', {
    method: 'POST',
    body: apiData,
    includeAuth: false,
    credentials: 'omit', // Avoid CORS issues with credentials
  });

  console.warn('Register API response:', response);

  // Backend only returns UserDto, no token
  // Token will be obtained through subsequent login

  return response;
}

/**
 * Validate authentication token
 */
export async function validateToken(token: string): Promise<ApiResponse<ValidateTokenResponse>> {
  return apiRequest<ValidateTokenResponse>('/api/Auth/validate', {
    method: 'POST',
    body: { token },
    includeAuth: false,
    credentials: 'omit', // Avoid CORS issues with credentials
  });
}

/**
 * Refresh the authentication token
 * Returns a new token with extended expiration
 * Sends the current token in the Authorization header for the backend to validate and refresh
 */
export async function refreshToken(): Promise<ApiResponse<LoginResponse>> {
  const currentToken = getAuthToken();

  if (!currentToken) {
    console.warn('Refresh token: No current token found');

    return {
      success: false,
      status: 401,
      error: 'No authentication token found',
    };
  }

  const response = await apiRequest<LoginResponse>('/api/Auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
    credentials: 'omit',
  });

  console.warn('Refresh token API response:', response);

  // If refresh successful, update the cookie with the new token
  if (response.success && response.data) {
    const token = response.data.token; // || response.data.Token;

    if (token) {
      console.warn('Updating auth token cookie with refreshed token');
      setAuthToken(token);
    }
  }

  return response;
}

/**
 * Logout user - clears all local storage, cookies, and calls backend logout
 */
export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint to clear server-side cookie
    await apiRequest('/api/Auth/logout', {
      method: 'POST',
      credentials: 'omit',
    });
    console.warn('Backend logout successful');
  } catch (error) {
    console.error('Backend logout failed:', error);
  }

  // Clear the auth token cookie
  removeAuthToken();

  // Clear all localStorage items related to auth
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    // Clear any other app-specific storage
    localStorage.removeItem('helpedge_session');
  }

  // Clear all sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }

  console.warn('All local auth data cleared');
}

/**
 * Get token expiration time in seconds
 * Returns null if token is invalid or has no expiration
 */
export function getTokenExpirationTime(): number | null {
  const token = getAuthToken();

  if (!token) {return null;}

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const remainingTime = Math.floor((expirationTime - currentTime) / 1000);

      return remainingTime > 0 ? remainingTime : 0;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire (within specified minutes)
 */
export function isTokenExpiringSoon(withinMinutes: number = 5): boolean {
  const remainingTime = getTokenExpirationTime();

  if (remainingTime === null) {return false;}

  return remainingTime <= withinMinutes * 60;
}

/**
 * Check if token has expired
 */
export function isTokenExpired(): boolean {
  const remainingTime = getTokenExpirationTime();

  return remainingTime === null || remainingTime <= 0;
}

/**
 * Get current user from stored token cookie
 * This decodes the JWT token to extract user information
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {return null;}

  const token = getAuthToken();

  if (!token) {
    console.warn('getCurrentUser: No token in cookie');

    return null;
  }

  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = JSON.parse(atob(token.split('.')[1]));

    console.warn('JWT Payload:', payload);

    // Map role to UserRole format
    let userRole: UserRole = 'EndUser';
    const rawRole = payload.role || payload.Role;

    if (typeof rawRole === 'string') {
      // Backend sends string role (Admin, ITManager, etc.)
      userRole = BACKEND_ROLE_MAP[rawRole] || 'EndUser';
    }

    const user: User = {
      id: payload.sub || payload.userId || payload.id || payload.nameid,
      email: payload.email || payload.Email,
      name:
        payload.name || payload.fullName || payload.username || payload.Name || payload.unique_name,
      role: userRole,
      department: payload.department || payload.Department,
      jobTitle: payload.jobTitle || payload.JobTitle,
      avatarUrl: payload.avatarUrl || payload.AvatarUrl,
    };

    console.warn('Extracted user:', user);

    return user;
  } catch (error) {
    console.error('Error decoding token:', error);
    console.error('Token:', token.substring(0, 50) + '...');

    return null;
  }
}

/**
 * Get the dashboard route for a given role
 */
export function getDashboardRouteForRole(role: UserRole): string {
  return ROLE_DASHBOARD_ROUTES[role] || '/dashboard';
}
