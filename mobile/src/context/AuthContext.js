import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from '../services/api';

const AuthContext = createContext();

// Detect if running inside Expo Go (push tokens don't work there SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');

                if (storedUser && storedToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);
                    // Register push token for returning session
                    registerPushToken(parsedUser);
                }
            } catch (error) {
                console.error('Failed to load auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);

    /**
     * Dynamically loads expo-notifications and registers the push token.
     * Skipped silently in Expo Go (SDK 53+ removed remote push support).
     */
    const registerPushToken = async (userData) => {
        // Skip in Expo Go — remote push notifications removed in SDK 53+
        if (isExpoGo) {
            console.log('[PushToken] Skipped: running in Expo Go. Use a dev build for push tokens.');
            return;
        }

        // Skip on simulator/emulator
        if (!Constants.isDevice) {
            console.log('[PushToken] Skipped: not a physical device');
            return;
        }

        try {
            // Dynamic import — avoids crash on Expo Go startup
            const Notifications = await import('expo-notifications');

            // Configure foreground notification display
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            // Check / request permission
            const { status: existing } = await Notifications.getPermissionsAsync();
            let finalStatus = existing;
            if (existing !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('[PushToken] Permission not granted');
                return;
            }

            // Get Expo push token
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            const tokenData = await Notifications.getExpoPushTokenAsync(
                projectId ? { projectId } : undefined
            );
            const pushToken = tokenData.data;
            console.log('[PushToken] Token:', pushToken);

            // Map role to user_type for the DB table
            const userType = userData.role === 'provider' ? 'provider' : 'customer';

            // Save to backend
            await apiService.post('/api/mobile/push-token', {
                userId: userData.id,
                userType,
                pushToken,
                platform: Platform.OS,
            });
            console.log('[PushToken] Saved to backend ✅');

            // Set Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#115e59',
                });
            }
        } catch (err) {
            // Non-fatal — never block the login flow
            console.warn('[PushToken] Registration failed (non-fatal):', err.message);
        }
    };

    const login = async (userData, userToken) => {
        try {
            setUser(userData);
            setToken(userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
            registerPushToken(userData);
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

    const updateUser = async (updatedData) => {
        try {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            console.log('[AuthContext] User data updated locally ✅');
        } catch (error) {
            console.error('Failed to update user auth data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

