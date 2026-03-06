import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load stored auth data on startup
        const loadAuthData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Failed to load auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);

    const login = async (userData, userToken) => {
        try {
            setUser(userData);
            setToken(userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
        } catch (error) {
            console.error('Failed to save auth data:', error);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
