import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from '../services/api';

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * usePushToken
 *
 * Requests notification permission, retrieves the Expo push token,
 * and optionally saves it to the backend.
 *
 * Usage:
 *   const { pushToken, permissionStatus } = usePushToken({ userId, userType });
 *
 * Params:
 *   userId     - ID of logged-in user or provider
 *   userType   - 'customer' | 'provider'
 *   deviceId   - optional unique device identifier
 */
export const usePushToken = ({ userId, userType, deviceId } = {}) => {
    const [pushToken, setPushToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [error, setError] = useState(null);
    const registered = useRef(false);

    useEffect(() => {
        if (!userId || !userType) return;
        if (registered.current) return;
        registered.current = true;

        registerForPushNotifications();
    }, [userId, userType]);

    const registerForPushNotifications = async () => {
        if (isExpoGo) {
            console.log('[usePushToken] Skipped: running in Expo Go.');
            return;
        }

        try {
            // Push notifications don't work on simulator; skip gracefully
            if (!Constants.isDevice) {
                console.log('[PushToken] Skipped: not a physical device');
                return;
            }

            // Dynamic import
            const Notifications = await import('expo-notifications');

            // Check / request permission
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            setPermissionStatus(finalStatus);

            if (finalStatus !== 'granted') {
                console.log('[PushToken] Permission denied');
                return;
            }

            // Get the Expo push token
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            const tokenData = await Notifications.getExpoPushTokenAsync(
                projectId ? { projectId } : undefined
            );
            const token = tokenData.data;
            setPushToken(token);
            console.log('[PushToken] Token:', token);

            // Save token to backend
            await savePushToken(token);

            // Android: set notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#115e59',
                });
            }
        } catch (err) {
            console.error('[PushToken] Registration error:', err);
            setError(err.message);
        }
    };

    const savePushToken = async (token) => {
        if (!token || !userId) return;
        try {
            await apiService.post('/api/mobile/push-token', {
                userId,
                userType,
                pushToken: token,
                platform: Platform.OS,
                deviceId: deviceId || null,
            });
            console.log('[PushToken] Saved to backend');
        } catch (err) {
            // Non-fatal: token saving failure shouldn't break the app
            console.warn('[PushToken] Failed to save to backend:', err.message);
        }
    };

    return { pushToken, permissionStatus, error };
};
