import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decode and map JWT token to user data
 * This function decodes a JWT token and extracts user information
 */
export function decodeAndMapToken(token: string): any {
  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Map the token payload to a user object
    return {
      id: payload.sub || payload.userId || payload.id || payload.nameid,
      email: payload.email || payload.Email,
      name: payload.name || payload.username || payload.Name || payload.unique_name,
      role: payload.role || payload.Role,
      department: payload.department || payload.Department,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
