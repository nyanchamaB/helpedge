// API Client for HelpEdge API
// Base configuration and utilities for making API requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helpedge-api.onrender.com';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

/**
 * Make an API request to the HelpEdge backend
 */
export async function apiRequest<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
  } = config;

  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if token exists and auth is required
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    console.log('API Request:', { url, method, headers: requestHeaders, body });

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies for cross-origin
    });

    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const contentType = response.headers.get('content-type');
    let data;

    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('API Response Data:', data);

    if (!response.ok) {
      // Parse error message from different response formats
      let errorMessage = 'Request failed';

      // Check for ASP.NET Core Problem Details format (RFC 7807)
      if (data && typeof data === 'object') {
        if (data.title && data.detail) {
          errorMessage = `${data.title}: ${data.detail}`;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.title) {
          errorMessage = data.title;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }

      // Add status code context
      if (response.status === 500) {
        errorMessage += ' (Internal Server Error - Check backend logs)';
      } else if (response.status === 401) {
        errorMessage += ' (Unauthorized - Check authentication)';
      } else if (response.status === 403) {
        errorMessage += ' (Forbidden - Insufficient permissions)';
      } else if (response.status === 404) {
        errorMessage += ' (Not Found)';
      }

      return {
        success: false,
        status: response.status,
        error: errorMessage,
        data: data, // Include original data for debugging
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    // Enhanced error logging for CORS and network errors
    console.error('API request error:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));

    // Try to extract more information
    const errorInfo: any = {
      type: error?.constructor?.name || 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      url: url,
    };

    // Check if it's a TypeError (common for CORS issues)
    if (error instanceof TypeError) {
      errorInfo.likelyCause = 'CORS or Network issue';
      errorInfo.suggestion = 'Check browser console for CORS errors. The backend may need to allow requests from your origin.';
    }

    console.error('Error details:', errorInfo);

    // Determine user-friendly error message
    let userMessage = 'Network error occurred. ';

    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMessage += 'This is likely a CORS issue. The backend API needs to allow requests from your domain (http://localhost:3000). ';
      userMessage += 'Please contact the backend team to add CORS headers.';
    } else {
      userMessage += 'Please check your internet connection and verify the API is accessible.';
    }

    return {
      success: false,
      status: 0,
      error: userMessage,
    };
  }
}

/**
 * Get the authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = getAuthToken();
  return !!token;
}
