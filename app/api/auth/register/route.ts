// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import User from '@/models/User';
// import { hashPassword, generateToken } from '@/lib/auth';
// import { registerSchema } from '@/lib/validation';

// export async function POST(req: NextRequest) {
//   try {
//     await dbConnect();
//     const body = await req.json();

//     // Validate input
//     const validatedData = registerSchema.parse(body);

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: validatedData.email });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User already exists' },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(validatedData.password);

//     // Create user
//     const user = await User.create({
//       ...validatedData,
//       password: hashedPassword
//     });

//     // Generate token
//     const token = generateToken(user._id.toString(), user.email, user.role);

//     // Create response
//     const response = NextResponse.json({
//       message: 'User created successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });

//     // Set cookie
//     response.cookies.set('auth-token', token, {
//       httpOnly: true,
//       // secure: process.env.NODE_ENV === 'production',
//       secure: false,
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 24 * 7 // 7 days
//     });

//     return response;
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('Registration attempt for:', body.email);

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    console.log('User created successfully:', email);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with user data (password excluded by model)
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });

    // Set HTTP-only cookie with explicit settings
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: false, // Set to false for development (localhost)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}