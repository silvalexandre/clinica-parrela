import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Verifica expiração
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login'; // Força redirecionamento limpo
    };

    return (
        <AuthContext.Provider value={{ user, signed: !!user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};