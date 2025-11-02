// Type definitions for the application

export interface AccessToken {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  exp: number;
  iat: number;
}
