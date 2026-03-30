// API Client for HelpEdge API
// Base configuration and utilities for making API requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helpedge-api.onrender.com';
// Browser requests are routed through the Next.js proxy path to avoid CORS.
// Defaults to /api-proxy when no env override is provided.
const API_PROXY_BASE = process.env.NEXT_PUBLIC_API_PROXY_BASE_URL || '/api-proxy';

function getBaseUrl(): string {
  // In the browser, use the proxy path to avoid CORS with local backend
  if (typeof window !== 'undefined' && API_PROXY_BASE) {
    return API_PROXY_BASE;
  }

  return API_BASE_URL;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  includeAuth?: boolean;
  // Use 'omit' for public endpoints like login/register to avoid CORS issues
  // Use 'include' for authenticated endpoints to send cookies
  credentials?: 'include' | 'omit' | 'same-origin';
}

/**
 * Make an API request to the HelpEdge backend
 * When includeAuth is true, adds Authorization header with Bearer token
 * Use credentials: 'omit' for public endpoints to avoid CORS issues
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  config: ApiRequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = false,
    credentials, //allow caller to specify credentials mode
  } = config;

  // Auth is Bearer token in Authorization header — cookies are never needed.
  // Force 'omit' to avoid CORS preflight failures from Access-Control-Allow-Credentials requirements.
  const effectiveCredentials: 'include' | 'omit' | 'same-origin' =
    credentials === 'omit' || credentials === 'same-origin' ? credentials : 'omit';
  const url = `${getBaseUrl()}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if includeAuth is true
  if (includeAuth) {
    const token = getAuthToken();

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const requestBody =
      body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);

    console.warn('API Request:', { url, method, headers: requestHeaders, body, credentials });

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      mode: 'cors',
      credentials: effectiveCredentials, // Use provided credentials mode
    });

    console.warn('API Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    const contentType = response.headers.get('content-type');
    let data;

    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.warn('API Response Data:', data);

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
    interface ErrorInfo {
      type: string;
      message: string;
      url: string;
      likelyCause?: string;
      suggestion?: string;
    }
    // Try to extract more information
    const errorInfo: ErrorInfo = {
      type: error instanceof Error ? error?.constructor?.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      url: url,
    };

    // Check if it's a TypeError (common for CORS issues)
    if (error instanceof TypeError) {
      errorInfo.likelyCause = 'CORS or Network issue';
      errorInfo.suggestion =
        'Check browser console for CORS errors. The backend may need to allow requests from your origin.';
    }

    console.error('Error details:', errorInfo);

    // Determine user-friendly error message
    let userMessage = 'Network error occurred. ';

    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMessage +=
        'This is likely a CORS issue. The backend API needs to allow requests from your domain (http://localhost:3000). ';
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
 * Get the authentication token from cookies (client-side)
 * Note: This reads from document.cookie, not httpOnly cookies
 * The actual auth token is httpOnly and sent automatically by browser
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {return null;}
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');

    if (name === 'authToken') {
      return value;
    }
  }

  return null;
}

/**
 * Remove the authentication token cookie
 * Sets the cookie with an expired date to delete it
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {return;}
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Check if user is authenticated (has valid token cookie)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {return false;}
  const token = getAuthToken();

  return !!token;
}
