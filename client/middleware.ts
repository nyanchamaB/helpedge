import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tickets',
  '/customers',
  '/reports',
  '/knowledge-base',
  '/setttings', // Note: typo in original folder name
  '/billing',
  '/features',
  '/support',
];

// Routes that should redirect to dashboard if user is authenticated
const authRoutes = ['/auth/login', '/auth/register'];

/**
 * Validates JWT token structure and expiry
 * Note: This is basic validation - signature verification happens on the backend
 */
function validateToken(token: string): { isValid: boolean; isExpired: boolean } {
  try {
    // Check JWT structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, isExpired: false };
    }

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const isExpired = currentTimestamp >= payload.exp;

      if (isExpired) {
        return { isValid: false, isExpired: true };
      }
    }

    return { isValid: true, isExpired: false };
  } catch {
    return { isValid: false, isExpired: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  /**
   * Cookie-based authentication check
   * SECURITY NOTE: Currently, auth tokens are stored in localStorage (client-side only),
   * which this middleware cannot access. For enhanced security, consider migrating to
   * httpOnly cookies, which can be validated here for an additional security layer.
   *
   * To migrate to cookie-based auth:
   * 1. Update login/register API to set httpOnly cookies
   * 2. Update the code below to read from cookies instead of localStorage
   * 3. Remove localStorage token management from client code
   */
  const authTokenCookie = request.cookies.get('authToken')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if route is an auth route (login/register)
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (authTokenCookie) {
    // Validate token from cookie
    const validation = validateToken(authTokenCookie);

    if (validation.isValid) {
      // User is authenticated via cookie
      if (isAuthRoute) {
        // Redirect authenticated users away from login/register
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } else if (validation.isExpired) {
      // Token is expired, clear cookie
      const response = NextResponse.next();
      response.cookies.delete('authToken');

      if (isProtectedRoute) {
        // Redirect to login for protected routes
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      return response;
    }
  }

  /**
   * Client-side route guards
   * Since tokens are in localStorage, the PublicRoute and ProtectedRoute
   * components handle the actual authentication checks and redirects.
   * This middleware serves as an additional security layer when cookies are used.
   */

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
