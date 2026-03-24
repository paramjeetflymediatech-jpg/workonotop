import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * useNotifications
 * 
 * Encapulates notification listeners and response handling.
 * 
 * @param {Object} navigation - React Navigation object
 */
export const useNotifications = (navigation, userRole) => {
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        let isStopped = false;

        const setupListeners = async () => {
            try {
                // Dynamic import to prevent crash in Expo Go SDK 53+
                const Notifications = await import('expo-notifications');
                
                if (isStopped) return;

                // 1. Listen for notifications arriving while the app is FOREGROUNDED
                notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                    console.log('🔔 Foreground Notification:', notification);
                });

                // 2. Listen for user interaction (CLICKING) with a notification
                responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                    const data = response.notification.request.content.data;
                    console.log('🎯 Notification Tapped:', data);

                    if (data?.bookingId && navigation) {
                        try {
                            if (userRole === 'admin') {
                                navigation.navigate('AdminJobDetails', { booking: { id: data.bookingId } });
                            } else if (userRole === 'provider') {
                                navigation.navigate('JobDetails', { booking: { id: data.bookingId } });
                            } else {
                                navigation.navigate('CustomerBookingDetails', { bookingId: data.bookingId });
                            }
                        } catch (err) {
                            console.warn('[Push] Navigation failed:', err.message);
                        }
                    }
                });
            } catch (err) {
                console.log('[Push] Notification listeners skipped (likely running in Expo Go or simulator):', err.message);
            }
        };

        setupListeners();

        return () => {
            isStopped = true;
            const cleanup = async () => {
                if (notificationListener.current) {
                    notificationListener.current.remove();
                }
                if (responseListener.current) {
                    responseListener.current.remove();
                }
            };
            cleanup();
        };
    }, [navigation, userRole]);
};
