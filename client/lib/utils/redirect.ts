// Utility functions for handling redirects after authentication

/**
 * Get redirect URL from query parameters
 */
export function getRedirectUrl(searchParams?: URLSearchParams): string {
  if (!searchParams) return '/dashboard';

  const redirect = searchParams.get('redirect');

  // Validate redirect URL to prevent open redirect vulnerabilities
  if (redirect && isValidRedirect(redirect)) {
    return redirect;
  }

  return '/dashboard';
}

/**
 * Validate that redirect URL is safe (internal to the app)
 */
function isValidRedirect(url: string): boolean {
  // Must start with / and not //
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }

  // Must not contain protocol
  if (url.includes('://')) {
    return false;
  }

  // Prevent redirect to auth pages
  if (url.startsWith('/auth/')) {
    return false;
  }

  return true;
}

/**
 * Build login URL with redirect parameter
 */
export function buildLoginUrl(currentPath?: string): string {
  if (!currentPath || currentPath === '/' || currentPath.startsWith('/auth/')) {
    return '/auth/login';
  }

  return `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
}
