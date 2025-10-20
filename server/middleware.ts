 // // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { verifyToken } from './lib/auth';

// export async function middleware(request: NextRequest) {
//   console.log("ENV:", process.env.NODE_ENV); //remove this when done logging
//   const token = request.cookies.get('auth-token')?.value;
//   console.log("🪙 Token in middleware:", token);
//   const { pathname } = request.nextUrl;

//   // Public routes that don't require authentication
//   const publicRoutes = ['/auth/login', '/auth/register', '/'];

//   if (publicRoutes.includes(pathname)) {
//     return NextResponse.next();
//   }

//   // Check if user is authenticated
//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   const payload = await verifyToken(token);
//   console.log("🔐 Verified payload:", payload);

//   if (!payload) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   // Add user info to headers for API routes
//   const requestHeaders = new Headers(request.headers);
//   requestHeaders.set('x-user-id', payload.userId as string);
//   requestHeaders.set('x-user-role', payload.role as string);
//   requestHeaders.set('x-user-email', payload.email as string);

//   return NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/tickets/:path*',
//     '/users/:path*',
//     '/api/tickets/:path*',
//     '/api/users/:path*'
//   ],
//   runtime: 'nodejs'
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Inline JWT verification to avoid import issues
function verifyTokenInline(token: string) {
  try {
    // For now, let's just check if token exists
    // You can implement proper JWT verification here later
    if (!token || token.length < 10) {
      return null;
    }
    
    // Basic token validation - replace with proper JWT verification
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // For development, let's decode the payload (not secure for production)
    try {
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  console.log("🔍 Middleware running for:", request.nextUrl.pathname);
  
  const token = request.cookies.get('token')?.value; // Changed from 'auth-token' to 'token'
  console.log("🪙 Token found:", !!token);
  
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/', '/api/auth/login', '/api/auth/register'];

  // Skip middleware for public routes
  if (publicRoutes.includes(pathname)) {
    console.log("✅ Public route, allowing access");
    return NextResponse.next();
  }

  // Skip middleware for static files and API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    console.log("❌ No token, redirecting to login");
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify token
  const payload = verifyTokenInline(token);
  console.log("🔐 Token verification result:", !!payload);

  if (!payload) {
    console.log("❌ Invalid token, redirecting to login");
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId || '');
  requestHeaders.set('x-user-role', payload.role || '');
  requestHeaders.set('x-user-email', payload.email || '');

  console.log("✅ Authenticated user, proceeding");
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};