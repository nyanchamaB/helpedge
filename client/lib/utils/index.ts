import { AccessToken } from '@/lib/types';
import jwtDecode from 'jwt-decode';

export function decodeAndMapToken(token: string): AccessToken | null {
  const decodedToken = jwtDecode<AccessToken>(token);

  if (token) {
    sessionStorage.setItem('accessToken', token);
  }

  const mappedToken: AccessToken = { ...decodedToken };

  return mappedToken;
}
