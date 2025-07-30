// // app/api/auth/logout/route.ts
// import { NextResponse } from 'next/server';

// export async function POST() {
//   const response = NextResponse.json({ message: 'Logged out successfully' });
  
//   response.cookies.delete('auth-token');
  
//   return response;
// }

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Logout request received');
    
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    console.log('Logout successful, cookie cleared');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}