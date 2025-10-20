export interface AccessToken {
    exp: number;
    sub: string;
    email: string;
    roles: string[];
   // [key: string]: any; // for any additional claims
    name?: string;
    preferred_username: string;
    email_verified?: boolean;
    family_name?: string;
    given_name?: string;        
}