// // import jwt from 'jsonwebtoken';
// import { SignJWT, jwtVerify } from 'jose';
// import bcrypt from 'bcryptjs';

// // const JWT_SECRET = process.env.JWT_SECRET || 'H8I12jmk2gEUIkYT24WJ5+ZB2ImNNga12bTbUyDSpMs=';

// const secret = new TextEncoder().encode(process.env.JWT_SECRET!);


// export const hashPassword = async (password: string): Promise<string> => {
//   return await bcrypt.hash(password, 12);
// };

// export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
//   return await bcrypt.compare(password, hashedPassword);
// };

// // export const generateToken = (userId: string, email: string, role: string): string => {
// //   return jwt.sign(
// //     { userId, email, role },
// //     JWT_SECRET,
// //     { expiresIn: '7d' }
// //   );
// // };


// export async function generateToken(userId: string, email: string, role: string) {
//   return await new SignJWT({ userId, email, role })
//     .setProtectedHeader({ alg: 'HS256' })
//     .setIssuedAt()
//     .setExpirationTime('7d')
//     .sign(secret);
// }

// // export const verifyToken = (token: string): any => {
// //   try {
// //     return jwt.verify(token, JWT_SECRET);
// //   } catch (error) {
// //     console.error("JWT Verification failed:", error); // Add this
// //     return null;
// //   }
// // };

// export async function verifyToken(token: string) {
//   try {
//     const { payload } = await jwtVerify(token, secret);
//     return payload;
//   } catch (error) {
//     console.error("JWT Verification failed:", error);
//     return null;
//   }
// }

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'H8I12jmk2gEUIkYT24WJ5+ZB2ImNNga12bTbUyDSpMs=';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  try {
    console.log('Generating token for payload:', payload);
    
    // Ensure payload is a plain object
    const tokenPayload = {
      userId: String(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'helpedge',
      audience: 'helpedge-users',
    });
    
    console.log('Token generated successfully');
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'helpedge',
      audience: 'helpedge-users',
    }) as TokenPayload;
    
    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
      role: String(decoded.role),
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

export function extractTokenFromHeaders(headers: Headers): TokenPayload | null {
  try {
    const userId = headers.get('user-id');
    const email = headers.get('user-email');
    const role = headers.get('user-role');

    if (!userId || !email || !role) {
      return null;
    }

    return { userId, email, role };
  } catch (error) {
    return null;
  }
}