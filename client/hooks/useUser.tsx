"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { decodeAndMapToken } from "@/lib/utils";
import { Session } from "next-auth";
import { AccessToken} from "@/lib/types";

type UserData = {
    session: Session;
    decodedToken: AccessToken | null;
}

type UserContextType = {
    user: UserData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
});

// cookie config
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires:  1,
    path: '/',
};


export function UserProvider ({ children}: {children: ReactNode}) {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        if (session?.error ===  'RefreshAccessTokenExpired') {
            console.log('Access token expired, signing out...');
            signOut({ redirect: true, callbackUrl: window.location.pathname + window.location.search });
            
        }
          
        const handleSesionChange = async () => {
            if (status === 'authenticated' && session?.user) {
                try {
                    if (session.accessToken) {
                        const decodedToken = decodeAndMapToken(session.accessToken);
                        setUserData({ session, decodedToken });
                        document.cookie = `accessToken=${session.accessToken}; ${Object.entries(COOKIE_OPTIONS).map(([key, value]) => `${key}=${value}`).join('; ')}`;
                    }
                    throw new Error('No access token found in session');
                } catch (error) {
                    console.error('Error decoding token:', error);
                    setUserData(null);
                }
            } else if (status === 'unauthenticated') {
                handleSignOut();
            }
        };
        const handleSignOut = () => {
            setUserData(null);
            document.cookie = `accessToken=; Max-Age=0; path=/;`;
            signOut({ callbackUrl: window.location.pathname + window.location.search,
                redirect: true
             })
            };
        handleSesionChange();
    }, [session, status]);

    const contextValue = {
        user: userData,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
    };
    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export function useUser () {
  const context  = useContext(UserContext);
    if (!context) {
        throw new Error('useUserData must be used within a UserProvider');
    }
    return context;
};

        
