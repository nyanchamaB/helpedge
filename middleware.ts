// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/users/:path*',
    '/api/tickets/:path*',
    '/api/users/:path*'
  ]
};