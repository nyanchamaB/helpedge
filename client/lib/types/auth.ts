// Authentication type definitions for HelpEdge

export type RoleString = 'admin' | 'agent' | 'end_user';
export type RoleNumber = 0 | 1 | 2;

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleString;
  department?: string;
}

export interface AuthToken {
  token: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: RoleString;
  department?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
