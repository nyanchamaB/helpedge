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
  '/support',
];

// Routes that should redirect to dashboard if user is authenticated
const authRoutes = ['/auth/login', '/auth/register'];

/**
 * Decode base64url safely (Edge-compatible)
 */
function decodeBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );

  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Validate JWT token structure and expiry
 */
function validateToken(token: string): { isValid: boolean; isExpired: boolean } {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { isValid: false, isExpired: false };
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('authToken')?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ✅ No token → block protected routes only
  if (!authToken) {

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ✅ Validate token
  const validation = validateToken(authToken);

  if (!validation.isValid) {
    const response = NextResponse.next();
    response.cookies.delete('authToken');

    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ✅ Token expired
  if (validation.isExpired) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(url);
    response.cookies.delete('authToken');
    return response;
  }

  // ✅ Authenticated user hitting login/register → redirect to dashboard
  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ✅ Allow request + attach security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * ✅ IMPORTANT: Only run proxy on relevant routes
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/team/:path*',
    '/reports/:path*',
    '/systems/:path*',
    '/security/:path*',
    '/knowledge-base/:path*',
    '/settings/:path*',
    '/customers/:path*',
    '/billing/:path*',
    '/support/:path*',
    '/auth/:path*',
  ],
};