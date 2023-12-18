
// this file creates a provider for the login details or something idk
// found from following this tutorial https://www.youtube.com/watch?v=QMUii9fSKfQ&t=1391s
// might be better to move everything into the redux store at some point.


import React, { createContext, ReactNode, useState } from "react";

interface AuthProviderProps {
    children: ReactNode;
}

type AppAuthContext = {
    login: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AppAuthContext>({login :() => null, logout:()=>null });

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);

    const login = () => {
        setUserToken("kgkrekmg");
        setIsLoading(false);
    }

    const logout = () => {
        setUserToken(null);
        setIsLoading(false);
    }

    return (
        <AuthContext.Provider value={ {login, logout} }>
            { children }
        </AuthContext.Provider>
    );
};