import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService, setLogoutHandler } from '../services/api';

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
                // 1. Fetch cached credentials FIRST
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');

                let cachedUser = null;
                if (storedUser) {
                    try {
                        cachedUser = JSON.parse(storedUser);
                        setUser(cachedUser);
                        setToken(storedToken);
                        console.log('📦 [AuthContext] Loaded from cache:', cachedUser.role);
                        
                        // IF we have cached data, we can stop "loading" immediately
                        // so the app opens while we refresh in background.
                        setLoading(false);
                    } catch (e) {
                        console.warn('[AuthContext] Corrupted cache:', e);
                    }
                }

                // 2. REFRESH in background (if we have a token)
                if (storedToken) {
                    setToken(storedToken);
                    
                    try {
                        console.log('🔄 [AuthContext] Refreshing session in background...');
                        const response = await apiService.auth.me(storedToken);
                        
                        if (response.success && response.user) {
                            const freshUser = response.user;
                            
                            // Re-standardize 'user' to 'customer'
                            if (freshUser.role === 'user') freshUser.role = 'customer';
                            
                            console.log(`✅ [AuthContext] Refresh complete: ${freshUser.role}`);
                            
                            setUser(freshUser);
                            await AsyncStorage.setItem('user', JSON.stringify(freshUser));
                            registerPushToken(freshUser);
                        } else {
                            console.log('🚪 [AuthContext] Session expired, logging out...');
                            await logout();
                        }
                    } catch (apiError) {
                        console.log('⚠️ [AuthContext] Background refresh failed:', apiError.message);
                        // session might be invalid but we keep the cache if it's a network error
                        const isAuthError = apiError.status === 401 || apiError.status === 404;
                        if (isAuthError) await logout();
                    }
                }
            } catch (error) {
                console.error('Failed to load auth data:', error);
            } finally {
                // Final safety check: if we never had a user, we must stop loading now
                setLoading(false);
            }
        };

        loadAuthData();
        
        // Register global logout handler for 401/404 errors
        setLogoutHandler(logout);

        return () => setLogoutHandler(null);
    }, [logout]);

    /**
     * Dynamically loads expo-notifications and registers the push token.
     * Skipped silently in Expo Go (SDK 53+ removed remote push support).
     */
    const registerPushToken = useCallback(async (userData) => {
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
    }, []);

    const login = useCallback(async (userData, userToken) => {
        try {
            setUser(userData);
            setToken(userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
            registerPushToken(userData);
        } catch (error) {
            console.error('Failed to save auth data:', error);
        }
    }, [registerPushToken]);

    const logout = useCallback(async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const response = await apiService.auth.me(token);
            if (response.success && response.user) {
                const freshUser = response.user;
                if (freshUser.role === 'user') freshUser.role = 'customer';
                setUser(freshUser);
                await AsyncStorage.setItem('user', JSON.stringify(freshUser));
                return freshUser;
            }
        } catch (error) {
            console.error('[AuthContext] Manual refresh failed:', error);
        }
    }, [token]);

    const updateUser = useCallback(async (updatedData) => {
        try {
            // 1. Update In-Memory State
            setUser(curr => {
                const newUser = { ...curr, ...updatedData };
                return newUser;
            });

            // 2. Persist to Storage (Outside of state setter)
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                const updated = { ...parsed, ...updatedData };
                await AsyncStorage.setItem('user', JSON.stringify(updated));
            }

            console.log('[AuthContext] User data updated and persisted ✅', updatedData);
        } catch (error) {
            console.error('Failed to update user auth data:', error);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        refreshUser
    }), [user, token, loading, login, logout, updateUser, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

