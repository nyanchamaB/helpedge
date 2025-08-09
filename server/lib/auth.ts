import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'H8I12jmk2gEUIkYT24WJ5+ZB2ImNNga12bTbUyDSpMs=';
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
  const tokenPayload = {
    userId: String(payload.userId),
    email: String(payload.email),
    role: String(payload.role),
  };

  let expiresIn: number | import('ms').StringValue = '7d';
  if (process.env.JWT_EXPIRES_IN) {
    const num = Number(process.env.JWT_EXPIRES_IN);
    expiresIn = isNaN(num) ? (process.env.JWT_EXPIRES_IN as import('ms').StringValue) : num;
  }

  const options: SignOptions = {
    expiresIn,
    issuer: 'helpedge',
    audience: 'helpedge-users',
  };

  return jwt.sign(tokenPayload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: 'helpedge',
    audience: 'helpedge-users',
  }) as TokenPayload;

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: String(decoded.role),
  };
}

export function extractTokenFromHeaders(headers: Headers): TokenPayload | null {
  const userId = headers.get('user-id');
  const email = headers.get('user-email');
  const role = headers.get('user-role');

  if (!userId || !email || !role) {
    return null;
  }

  return { userId, email, role };
}
