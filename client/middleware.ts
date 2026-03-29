import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tickets',
  '/team',
  '/reports',
  '/systems',
  '/security',
  '/knowledge-base',
  '/settings',
  '/customers',
  '/billing',
  //'/features',
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
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Get auth token from cookie
  const authTokenCookie = request.cookies.get('authToken')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if route is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

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

      // Allow access to protected routes
      return response;
    } else if (validation.isExpired) {
      // Token is expired, clear cookie and redirect
      const expiredResponse = NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, request.url),
      );

      expiredResponse.cookies.delete('authToken');

      if (isProtectedRoute) {
        return expiredResponse;
      }

      // For non-protected routes, just clear the cookie
      const clearCookieResponse = NextResponse.next();

      clearCookieResponse.cookies.delete('authToken');

      return clearCookieResponse;
    } else {
      // Invalid token structure, clear cookie
      const invalidResponse = NextResponse.next();

      invalidResponse.cookies.delete('authToken');

      if (isProtectedRoute) {
        // Redirect to login for protected routes
        const url = request.nextUrl.clone();

        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);

        return NextResponse.redirect(url);
      }

      return invalidResponse;
    }
  } else {
    // No auth token cookie present
    if (isProtectedRoute) {
      // Redirect unauthenticated users to login
      const url = request.nextUrl.clone();

      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);

      return NextResponse.redirect(url);
    }
  }

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
