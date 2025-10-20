import {AccessToken} from '@/lib/types';
import jwtDecode from 'jwt-decode';

export function decodeAndMapToken(token: string): AccessToken | null {  
    const decodedToken = jwtDecode<AccessToken>(token);
    if(token){
        sessionStorage.setItem ('accessToken', token);
    }

    const mappedToken: AccessToken = {
        name: decodedToken.name,
        email_verified: decodedToken.email_verified,
        family_name: decodedToken.family_name,
        given_name: decodedToken.given_name,
        ...decodedToken // Include any additional claims
    };
    return mappedToken;
}
