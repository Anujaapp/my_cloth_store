import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    localStorage.setItem('token', token);
                    const userData = await api.getMe(token);
                    setUser(userData);
                    setIsAdmin(userData.is_admin);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    // If token is invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAdmin(false);
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const data = await api.login(email, password);
            setToken(data.access_token);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAdmin(false);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
