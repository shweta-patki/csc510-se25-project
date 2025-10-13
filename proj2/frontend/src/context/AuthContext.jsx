import React, { createContext, useState } from 'react';
import * as authServices from '../services/authServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const saved = authServices.getSavedAuth();
    const [user, setUser] = useState(saved ? saved.user : null);

    const login = async (creds) => {
        const data = await authServices.login(creds); // { user, token }
        setUser(data.user);
        return data;
    };

    const register = async (creds) => {
        const data = await authServices.register(creds);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        authServices.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;