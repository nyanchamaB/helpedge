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

export function middleware(request: NextRequest) {
  // Since the token is stored in localStorage (client-side only),
  // this middleware cannot access it to make routing decisions.
  // Instead, we rely on the ProtectedRoute component on the client side
  // to handle authentication checks and redirects.

  // The middleware will just allow all requests through, and the
  // ProtectedRoute component will handle redirects to login if needed.

  return NextResponse.next();
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
