import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationSettingsScreen = ({ navigation }) => {
    const { token, user } = useAuth();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        push_notifications_enabled: true,
        receive_offers: true,
        booking_reminders_enabled: true,
        email_reports_enabled: true,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await apiService.user.getSettings(token);
            if (res.success && res.data) {
                setSettings(res.data);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key, value) => {
        const previousValue = settings[key];

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        try {
            const res = await apiService.user.updateSettings({ [key]: value }, token);
            if (!res.success) {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error('Update setting error:', error);
            Alert.alert('Error', 'Failed to update setting. Reverting...');
            // Revert on failure
            setSettings(prev => ({ ...prev, [key]: previousValue }));
        }
    };

    const SettingItem = ({ icon, title, subtitle, value, onValueChange, color = "#14b8a6" }) => (
        <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={moderateScale(20)} color={color} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#e2e8f0', true: color + '70' }}
                thumbColor={value ? color : '#f8fafc'}
            />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#14b8a6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification Settings</Text>
                <View style={{ width: moderateScale(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionDescription}>
                    Manage how you want to be notified about bookings, updates, and reminders.
                </Text>

                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Receive alerts on your device"
                        value={settings.push_notifications_enabled}
                        onValueChange={(val) => toggleSetting('push_notifications_enabled', val)}
                    />
                    
                    {(user?.role === 'customer' || user?.role === 'provider') && (
                        <>
                            <View style={styles.divider} />
                            <SettingItem
                                icon="mail-outline"
                                title="Email Updates"
                                subtitle="Receive news, updates and offers"
                                value={settings.receive_offers}
                                onValueChange={(val) => toggleSetting('receive_offers', val)}
                            />
                        </>
                    )}

                    {(user?.role === 'customer' || user?.role === 'provider') && (
                        <>
                            <View style={styles.divider} />
                            <SettingItem
                                icon="calendar-outline"
                                title="Booking Reminders"
                                subtitle="Alerts for upcoming services"
                                value={settings.booking_reminders_enabled}
                                onValueChange={(val) => toggleSetting('booking_reminders_enabled', val)}
                            />
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <View style={styles.divider} />
                            <SettingItem
                                icon="stats-chart-outline"
                                title="Email Reports"
                                subtitle="Daily platform performance summary"
                                value={settings.email_reports_enabled}
                                onValueChange={(val) => toggleSetting('email_reports_enabled', val)}
                            />
                        </>
                    )}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={moderateScale(20)} color="#64748b" />
                    <Text style={styles.infoText}>
                        You can also manage system-level notifications in your device settings.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(15),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: { padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: scale(20) },
    sectionDescription: {
        fontSize: moderateScale(14),
        color: '#64748b',
        marginBottom: verticalScale(20),
        lineHeight: moderateScale(20)
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: scale(16) },
    iconBox: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(10), justifyContent: 'center', alignItems: 'center', marginRight: scale(15) },
    settingInfo: { flex: 1 },
    settingTitle: { fontSize: moderateScale(15), fontWeight: '600', color: '#0f172a' },
    settingSubtitle: { fontSize: moderateScale(12), color: '#64748b', marginTop: verticalScale(2) },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: scale(16) },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        padding: scale(15),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(10)
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#64748b',
        marginLeft: scale(10),
        lineHeight: moderateScale(18)
    }
});

export default NotificationSettingsScreen;
