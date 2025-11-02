// Authentication API endpoints
import { apiRequest, ApiResponse, setAuthToken, removeAuthToken } from './client';

// Role mapping: frontend string values to backend numeric values
export const ROLE_MAP = {
  admin: 0,
  agent: 1,
  end_user: 2,
} as const;

// Reverse mapping: backend numeric values to frontend string values
export const ROLE_REVERSE_MAP = {
  0: 'admin',
  1: 'agent',
  2: 'end_user',
} as const;

// Backend string role to frontend role mapping
export const BACKEND_STRING_ROLE_MAP: Record<string, RoleString> = {
  'SuperAdmin': 'admin',
  'Admin': 'admin',
  'Agent': 'agent',
  'EndUser': 'end_user',
  'end_user': 'end_user',
  'admin': 'admin',
  'agent': 'agent',
};

export type RoleString = keyof typeof ROLE_MAP;
export type RoleNumber = typeof ROLE_MAP[RoleString];

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
  role: RoleString;
  department?: string;
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiRequest<any>('/api/Auth/login', {
    method: 'POST',
    body: credentials,
    includeAuth: false,
  });

  console.log('Login API response:', response);

  // Store token if login successful
  // Backend returns Token (capital T), handle both cases
  if (response.success && response.data) {
    const token = response.data.token || response.data.Token;
    if (token) {
      console.log('Token found, storing...');
      setAuthToken(token);
    } else {
      console.error('No token in response:', response.data);
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

  const response = await apiRequest<any>('/api/Auth/register', {
    method: 'POST',
    body: apiData,
    includeAuth: false,
  });

  console.log('Register API response:', response);

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
  });
}

/**
 * Logout user (clear local token)
 */
export function logout(): void {
  removeAuthToken();
  // Note: Redirect is handled by AuthContext using Next.js router
  // to avoid full page reload and preserve client-side routing
}

/**
 * Get current user from stored token
 * This decodes the JWT token to extract user information
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('getCurrentUser: No token in localStorage');
    return null;
  }

  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT Payload:', payload);

    // Map role to frontend format
    let roleString: RoleString = 'end_user';
    if (typeof payload.role === 'number') {
      // Backend sends numeric role (0, 1, 2)
      roleString = ROLE_REVERSE_MAP[payload.role as RoleNumber] || 'end_user';
    } else if (typeof payload.role === 'string') {
      // Backend sends string role (SuperAdmin, Agent, EndUser)
      roleString = BACKEND_STRING_ROLE_MAP[payload.role] || 'end_user';
    }

    const user = {
      id: payload.sub || payload.userId || payload.id || payload.nameid,
      email: payload.email || payload.Email,
      name: payload.name || payload.username || payload.Name || payload.unique_name,
      role: roleString,
      department: payload.department || payload.Department,
    };

    console.log('Extracted user:', user);
    return user;
  } catch (error) {
    console.error('Error decoding token:', error);
    console.error('Token:', token.substring(0, 50) + '...');
    return null;
  }
}
